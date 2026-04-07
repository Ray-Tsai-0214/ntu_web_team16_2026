# 1. 練習了哪些當週上課的主題:

本週的核心是將上週搭建的 **in-memory 後端** 全面遷移到 **真實資料庫 + 完整身分驗證機制**。我們改用 **Supabase**（managed PostgreSQL + Auth）作為後端資料層，並在 Next.js 15 App Router 上實作了 username/password 的多帳號登入系統。整個流程涵蓋了「資料庫 schema 設計、Row Level Security、Server-Side Auth、Session Cookie 管理、API 路由保護」等實務後端主題。

首先，我們重新設計了資料模型。從原本散落在 `lib/db.ts` 的 In-memory class，遷移到 PostgreSQL 上四張正規化的表：

- **`profiles`**：與 `auth.users` 透過 `id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE` 建立 1:1 關聯。`username` 欄位有 `UNIQUE` 與 `CHECK (length BETWEEN 3 AND 20 AND ~ '^[a-zA-Z0-9_]+$')` 雙重約束。
- **`landmarks`**：text PK，公開唯讀，遷移自原本的 15 筆 NTU 校園地標 seed data。
- **`posts`**：`author_id uuid REFERENCES profiles(id)`，`coords_lng / coords_lat` 拆成兩個 column 以利索引。
- **`reactions`**：複合唯一鍵 `UNIQUE (post_id, user_id)` 強制每人對每篇貼文只能有一個 reaction，type 欄位用 `CHECK IN (...)` 限制為五種 Threads 風格反應。

接著，我們為每張表啟用 **Row Level Security（RLS）** 並設計細緻的 policy：`SELECT` 全部公開（任何人可讀貼文與地標），但 `INSERT/UPDATE/DELETE` 必須通過 `auth.uid() = author_id`（或 `user_id`）才能執行。`profiles` 的 INSERT 故意不開 policy，確保新帳號只能透過 server 端的 service role 走 signup 路由建立，無法被前端直接呼叫繞過驗證。

為了維持點數系統，我們在 PostgreSQL 內寫了兩個 **`SECURITY DEFINER` trigger function**：`handle_post_change` 在 INSERT 時自動 `post_count + 1`、`daily_posts_used + 1`、`total_points + 2`；`handle_reaction_change` 在 INSERT 時 `reaction_count + 1`、`total_points + 1`。這比把計數邏輯放在 API route 更可靠，因為連 admin client 直接寫資料也會觸發。

身分驗證的部分是這週最有挑戰性的設計。需求是「使用者只用 username + password 就能註冊登入，不要連 email」。為了避免自刻 JWT 與密碼雜湊（風險高），我們採用 **「synthetic email」** 模式：在 server 端把 username 拼成 `${username}@omg.local`，當作 Supabase Auth 的 email 欄位儲存。使用者完全看不到、不會收到信，但底層仍享有 Supabase 提供的 bcrypt 密碼雜湊、JWT、refresh token、HttpOnly cookie 等完整機制。為了徹底繞過 email 驗證流程，signup 路由用 service role key 呼叫 `auth.admin.createUser({ email_confirm: true })`，直接建立已確認的帳號。

新增的四個 auth 路由分別處理 signup、login、logout、me（取得當前 session）。最關鍵的安全強化是：**所有寫入操作的 `userId` / `authorId` 都從 server 端 `auth.getUser()` 取得，絕對不再相信 request body 傳來的值**。這修補了上週後端的根本漏洞——之前任何人都能偽造 `authorId` 冒充其他使用者發文。

最後，我們新增了 `middleware.ts` 在每個動態請求時透過 `@supabase/ssr` 自動 refresh session cookie，並把所有既有的 API route（landmarks、posts、posts/[id]、reactions、users）改寫為從 Supabase 讀寫，新增 `lib/supabase/mappers.ts` 統一處理 snake_case ↔ camelCase 的欄位轉換，讓既有前端 JS 不需要修改就能正常運作。

# 2. 額外找了與當週上課的主題相關的程式技術：

這週深入研究了不少課堂沒涵蓋的後端與工具鏈技術：

**Supabase 與 PostgreSQL 進階特性**

- **Row Level Security (RLS)**：PostgreSQL 9.5 開始支援的列級安全機制。透過 `CREATE POLICY ... USING (...) WITH CHECK (...)` 可以在資料庫層直接定義「誰能讀哪一列、誰能寫哪一列」，並用 `auth.uid()` 取得當前 JWT 的 user id。這讓 API route 的安全邏輯下沉到 DB，即使應用層出 bug 也不會破壞權限模型。
- **`SECURITY DEFINER` Functions + Trigger**：在 trigger function 裡用 `SECURITY DEFINER` 讓函式以 owner 權限執行（而非呼叫者），這樣即使 RLS 限制了使用者直接 update profiles，trigger 仍能更新 post_count 等計數欄位。`SET search_path = public` 是必須的安全防護避免 search_path injection。
- **Foreign Key + ON DELETE CASCADE**：`profiles.id` REFERENCE `auth.users(id)` ON DELETE CASCADE 讓 Supabase Auth 刪除帳號時，profile 與其所有貼文 / reaction 自動連動刪除。
- **Composite UNIQUE constraint + UPSERT**：`reactions` 用 `UNIQUE (post_id, user_id)` 配合 supabase-js 的 `.upsert(..., { onConflict: "post_id,user_id" })`，可以一次完成「沒有就新增、已有就改 type」，省掉先 SELECT 再 INSERT/UPDATE 的競爭條件。

**Next.js 15 的 SSR Auth 模式**

- **`@supabase/ssr` 套件**：官方推出的 Next.js App Router 整合，正確處理 cookie 在 Server Components / Route Handlers / Middleware 三種環境下的讀寫差異。Next.js 15 將 `cookies()` 與 `headers()` 改為 async，需要 `await cookies()` 才能取得 cookie store。
- **Middleware refresh pattern**：在 `middleware.ts` 用 `createServerClient` + 立刻呼叫 `await supabase.auth.getUser()` 來觸發 session refresh。文件特別強調這兩行之間不能放任何邏輯，否則 refresh token 可能不會正確寫回。
- **Synthetic email auth pattern**：用 `${username}@${INTERNAL_DOMAIN}` 把 username-only auth 接到 Supabase Auth 上的技巧，搭配 admin client 的 `email_confirm: true` 完全繞過 email 驗證流程。

**MCP（Model Context Protocol）工具鏈**

- **mcp-remote OAuth flow**：Supabase 官方 MCP server 是遠端服務，透過 `mcp-remote` proxy 用 OAuth 完成首次認證。OAuth callback HTTP server 啟動在隨機 port，需要使用者在瀏覽器點 Approve 才會把 token 寫到 `~/.mcp-auth/mcp-remote-X.X.X/{md5_hash}_tokens.json`。
- **Claude Code MCP 三層 scoping**：`~/.mcp.json`（user-level，全 session 共用）、`<repo>/.mcp.json`（project-level，可 commit）、`<repo>/.claude/settings.local.json`（project-local，不 commit）。透過在 OMG repo 建 project-local config 並用相同 server 名稱 `supabase`，可以做到「OMG repo 開的 Claude session 連 OMG Supabase，其他 repo 開的連別的 Supabase」，互不干擾。
- **Stale OAuth lock 排錯**：當 mcp-remote 進程在 OAuth 完成前被 kill，會留下 `_lock.json` 但沒對應的 `_tokens.json`。修復方式是檢查 lock file 裡的 PID 是否還活著（`ps -p`）和 port 是否還在 listen（`lsof -i`），確認是 stale 後刪除該 hash 的所有檔案讓 mcp-remote 重做 OAuth。

**Secret 管理**

- 把明文寫在 `~/.mcp.json` 的 GitHub Personal Access Token 搬到 `~/.env.secrets`（由 `~/.zprofile` source），mcp.json 改用 `${GITHUB_PERSONAL_ACCESS_TOKEN}` 環境變數展開語法。如此即使 mcp.json 被備份或同步到雲端，token 也不會跟著外洩。
- 在 Next.js 專案區分 `NEXT_PUBLIC_*`（會打包進 client bundle，可以暴露給瀏覽器）與只能在 server 用的 secret（如 `SUPABASE_SERVICE_ROLE_KEY`）。`.gitignore` 加 `.env*.local` 確保真實 key 永遠不會被 commit。

**TypeScript 型別自動化**

- 用 `mcp__supabase__generate_typescript_types` 從 Supabase 自動產生 `Database` 型別，再傳給 `createClient<Database>(...)` / `createServerClient<Database>(...)`。這樣 `.from('profiles').insert({...})` 會即時檢查欄位名稱與型別，IDE 也有完整 autocomplete。
- 學到 supabase-js 在沒有泛型時 `.from().insert()` 的 payload 型別會被收斂成 `never`，需要明確傳 `Database` 才能用。

# 3. 組員分工情況 (共100%)，第16組

- 林芷葳 25%
- 韓承芯 25%
- 周世恩 25%
- 蔡秉叡 25% 後端從 in-memory 遷移到 Supabase（4 張表 + RLS policies + SECURITY DEFINER triggers + 15 筆 landmark seed migration）、設計並實作 username-only 身分驗證系統（synthetic-email + Supabase Auth admin client）、新增 `/api/auth/{signup,login,logout,me}` 四個路由、改寫所有既有 API routes 加上 session 檢查（`auth.uid()` 取代 request body 的 `authorId`）、建立 `lib/supabase/{server,admin,mappers,database.types}.ts`、新增 Next.js middleware 自動 refresh session cookie、配置 project-local `.mcp.json` 隔離 Supabase project、把 GitHub PAT 從明文搬到環境變數
