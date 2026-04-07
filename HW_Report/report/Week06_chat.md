
## Ray 對話紀錄：使用 Claude Code 把後端從 in-memory 遷移到 Supabase + 加上 username/password 登入

### Turn 1：盤點現有後端 + 多帳號架構診斷

**User：** 請幫我查看目前後端的完整技術以及是否可以透過不同帳號密碼登入不同的帳號並且在後端有完整的多帳號架構儲存。我現在有這個架構嗎？

**Claude：** 全域搜尋了 `password / auth / session / login / register / bcrypt / jwt / cookie`，並讀完 `lib/db.ts`、`lib/types.ts` 與所有 `app/api/*` 路由後得出結論：

- **技術棧現況**：Next.js 15 App Router + React 19 + TypeScript，資料層完全是 `lib/db.ts` 內的 in-memory class（用 `globalThis.__omgDb` singleton 跨 HMR 保留），沒有任何真實資料庫
- **多帳號登入架構：完全沒有**。`User` 型別沒有 `password` / `email`；`createUser()` 只收 `displayName + avatarEmoji`；`POST /api/users` 是公開的匿名建帳號；沒有 `/api/auth/*` 路由、沒有 session、沒有 cookie、沒有 middleware
- API 怎麼知道操作者是誰？答案：client 自己在 body 塞 `authorId` → **任何人都能冒充任何帳號**
- 而且 in-memory 資料 Vercel 冷啟動就消失，根本不能持久化

提出 5 件要補：持久化資料庫（推薦 Supabase）、`User` 加 `passwordHash`、`/api/auth/*` 路由、session 機制、middleware 保護寫入路由。

---

### Turn 2：規劃方案 + 用 Supabase MCP 執行

**User：** 請幫我規劃方案，並且我想要可以讓使用者先用 username sign up 並且登入就好不用真的連上 gmail。使用 Supabase MCP 並且幫我完善剩餘機制。

**Claude：** 提出**「合成 email + Supabase Auth」**核心策略：用 `${username}@omg.local` 當 Supabase Auth 的 email 欄位（使用者完全看不到、不會寄信），server 端用 service role 呼叫 `auth.admin.createUser({ email_confirm: true })` 直接繞過 email 驗證。這樣可以沿用 Supabase 完整的密碼雜湊（bcrypt）、JWT、refresh token、HttpOnly cookie 基礎設施，不用自刻。

但在動工前先用 MCP 跑了 `list_tables`，**發現重要問題**：MCP 連的 Supabase project 不是 OMG 的，而是另一個已經有 7 個真實 user、105 則訊息、21 則 mind_posts 的 production 資料庫！立刻停手，警告使用者四個風險（污染他人 production DB、命名衝突、Auth 共用、migration 難 rollback），列了四個方向（A. 用 schema 隔離 / B. 建新 project / C. 切換 MCP / D. 先寫程式碼）。

---

### Turn 3：MCP scoping 機制澄清

**User：** B. OMG 應該有自己的 Supabase project。你的 MCP 是對應到其中一個專案而已嗎？我如果現在把你接到新的專案，我在另一個地方使用 MCP 就不會是我現在這個 supabase 專案嗎？

**Claude：** 找到 `~/.mcp.json` 確認 Supabase MCP 是用 `mcp-remote` + URL 寫死 `project_ref=srruhdfjvsyupnjgwmni`（另一個 Expo 專案）。解釋了 Claude Code MCP 的三層階層：

| 層級 | 位置 | scope |
|---|---|---|
| User（全域）| `~/.mcp.json` | 所有 session 都載入 |
| Project | `<repo>/.mcp.json` | 只在該 repo 開 Claude 時載入 |
| Project local | `<repo>/.claude/settings.local.json` | 同上但不 commit |

**結論**：現況是「一個 Supabase MCP = 一個固定 project」，但可以做到「OMG repo 自動連 OMG，Expo repo 自動連 Expo」，兩個 session 同時開互不干擾。解法是在 OMG repo 建 project-local `.mcp.json` 覆蓋 global 的同名 server。

順便發現 `~/.mcp.json` 裡 GitHub PAT 是明文存放，建議改用環境變數。

---

### Turn 4：建立新 Supabase + 把 GitHub PAT 搬到 env var

**User：** Project name: `ntu_web_team16_2026`, Project ID: `xktiskyatbamqelqzoou`。順便幫我將 GitHub access token 改用環境變數。

**Claude：** 並行做了三件事：

1. **GitHub PAT 搬家**：在 `~/.env.secrets` 加 `export GITHUB_PERSONAL_ACCESS_TOKEN=...`（已驗證 `~/.zprofile` 會 source 這個檔案）；把 `~/.mcp.json` 第 11 行的明文改成 `${GITHUB_PERSONAL_ACCESS_TOKEN}`，由 shell 環境注入
2. **OMG 專案 MCP 隔離**：在 `ntu_web_team16_2026/.mcp.json` 寫 project-local config，指向 `project_ref=xktiskyatbamqelqzoou`
3. 提醒使用者重開終端機（讓 `.zprofile` 重新 source）+ 重開 Claude Code（讓新 MCP config 生效）

---

### Turn 5：MCP 連線失敗 → OAuth 卡住排錯

**User：** `/mcp` 顯示 "Failed to reconnect to supabase"

**Claude：** 列了 `~/.mcp-auth/mcp-remote-0.1.37/` 後發現有兩個 hash 目錄有 `_lock.json` 但沒對應的 `_tokens.json`。用 Node 算 MD5(URL) 確認 hash `79ee230d27...` 對應的就是 OMG 新 project：

- Lock file 指向 PID `30662`（已死）+ port `34549`（沒人 listen），時間戳 `22:29:19`
- 結論：mcp-remote 啟動本地 OAuth callback HTTP server，但 Claude Code 在 OAuth 完成前就被關掉，token 沒寫入

清掉 `79ee230d27...` 開頭的三個 stale 檔案（`_lock.json`、`_code_verifier.txt`、`_client_info.json`），完全不動 Expo 那組 `534b7ad1d1...`。指示使用者重跑 `/mcp` + 切到瀏覽器點 Approve。

---

### Turn 6：連線成功 → 開始九步實作

**User：** `Reconnected to supabase.` 連上了。

**Claude：** 並行驗證連線：
- ✅ Project URL: `https://xktiskyatbamqelqzoou.supabase.co`
- ✅ `public.tables = []`（完全空的，零衝突風險）
- ✅ 預設裝了 `uuid-ossp / pgcrypto / pg_graphql / supabase_vault`，不需要額外裝
- ✅ Publishable key: `sb_publishable_0D7TrarUfrwr0IglCfizbg_7A6v7ui3`

建了 9 個 task 並開始執行：

#### Task 1：Schema migration（`apply_migration` name=`create_omg_schema`）

建了 4 張表 + 全部啟用 RLS：

| Table | 重點 |
|---|---|
| `profiles` | `id uuid PK REFERENCES auth.users(id) ON DELETE CASCADE`；`username` 唯一，`CHECK length(3-20) AND ~ '^[a-zA-Z0-9_]+$'` |
| `landmarks` | text PK，公開唯讀 |
| `posts` | `author_id uuid REFERENCES profiles(id)`，`coords_lng/coords_lat` 拆兩欄，`body CHECK length(1-500)` |
| `reactions` | `UNIQUE (post_id, user_id)`，`type CHECK IN ('hilarious'/'wtf'/'nice'/'doubt'/'boring')` |

RLS Policies：
- `profiles_select_all` 公開讀；`profiles_update_self` 只能改自己；INSERT 故意不開（走 service role signup）
- `landmarks_select_all` 公開唯讀
- `posts`：select 公開，insert/update/delete 都要 `auth.uid() = author_id`
- `reactions`：select 公開，insert/update/delete 都要 `auth.uid() = user_id`

兩個 SECURITY DEFINER trigger：
- `posts_count_trigger`：INSERT 時 `profiles.post_count + 1`、`daily_posts_used + 1`、`total_points + 2`
- `reactions_count_trigger`：INSERT 時 `profiles.reaction_count + 1`、`total_points + 1`

跑完用 `get_advisors security` 確認 0 個警告。

#### Task 2：Seed 15 個 NTU 地標
從原本 `lib/db.ts` 把 `seedLandmarks` 搬進 `apply_migration` name=`seed_landmarks`，加 `ON CONFLICT DO NOTHING`。

#### Task 3-4：npm install + .gitignore + .env.local.example
- `npm install @supabase/supabase-js @supabase/ssr` → 12 packages, 0 vulnerabilities
- `.gitignore` 加 `.env`、`.env*.local`
- 寫 `.env.local.example` 範本（含 Supabase URL、publishable key、service role key 佔位、`OMG_AUTH_EMAIL_DOMAIN=omg.local`）

#### Task 5：Supabase clients + middleware
- `lib/supabase/server.ts` — 用 `createServerClient` + `next/headers` 的 `await cookies()`，包成 `createSupabaseServerClient()`
- `lib/supabase/admin.ts` — service role client，加 `autoRefreshToken: false`、`persistSession: false`，cached singleton
- `middleware.ts` — 在 `createServerClient` 後立刻 `await supabase.auth.getUser()` 以 refresh session cookie；matcher 排除 `_next/static`、`_next/image`、各種靜態副檔名
- 補充：validation hook 提到 Next 16 把 `middleware.ts` 改名成 `proxy.ts`，但專案是 15.3.1 不適用，跳過

#### Task 6：Auth API routes
- `POST /api/auth/signup`：驗 username regex `^[a-zA-Z0-9_]{3,20}$`、password ≥ 6；先在 `profiles` 查 username 有沒有被佔；用 admin client 呼叫 `auth.admin.createUser({ email: ${username}@omg.local, password, email_confirm: true })` 跳過 email 驗證；INSERT `profiles`；如果 INSERT 失敗就 `auth.admin.deleteUser` rollback；最後用 SSR client `signInWithPassword` 把 cookie 設在 response 上
- `POST /api/auth/login`：SSR client `signInWithPassword`，失敗統一回 401「invalid username or password」避免洩漏 username 是否存在
- `POST /api/auth/logout`：`signOut()`
- `GET /api/auth/me`：`getUser()` 沒有就 401，有就 join `profiles` 回傳

#### Task 7：改寫既有 API routes（最大塊）
寫了 `lib/supabase/mappers.ts` 統一處理 snake_case ↔ camelCase 轉換（`toApiProfile`、`toApiPost`、`toApiLandmark`），順便把 haversine 函式從舊 `lib/db.ts` 搬過來。

然後改寫了所有路由（重點是「authorId/userId 從 session 取，不從 body」）：
- `app/api/landmarks/route.ts` — 從 Supabase 讀，附近查詢用 mapper 的 haversine
- `app/api/landmarks/[id]/route.ts` — landmark + posts join
- `app/api/posts/route.ts` — POST 從 `auth.getUser()` 取 author_id；做 daily limit 檢查；POI 名稱建立新 landmark 走 admin client
- `app/api/posts/[id]/route.ts` — PATCH like/save 需要 auth；用 admin client 寫入（因為 RLS posts_update_self 只開給作者，但 like/save 是任何登入者都能做）
- `app/api/posts/[id]/reactions/route.ts` — POST 改用 `upsert` + `onConflict: "post_id,user_id"`，user_id 從 session 取
- `app/api/users/route.ts` — POST 移除（改走 `/api/auth/signup`），GET 改用 Supabase
- `app/api/users/[id]/route.ts` — PUT 加 `auth.uid() === id` 檢查 + 403

#### Task 8：刪除 lib/db.ts
- `Grep` 確認沒有任何檔案還在 import `lib/db` 或 `lib/types`
- 刪 `lib/db.ts` 和 `lib/types.ts`
- 跑 `npx tsc --noEmit` → **4 個錯誤**：Supabase client 沒有 Database 泛型，`.from().insert()` 型別變成 `never`
- 用 `mcp__supabase__generate_typescript_types` 生 `Database` type，存到 `lib/supabase/database.types.ts`
- 把 `createServerClient` 和 `createClient` 改成 `createServerClient<Database>` / `createClient<Database>`
- 又有 2 個 dynamic update payload 錯誤：`{ [column]: newValue }` 和 `Record<string, string>` 對 `TablesUpdate` 不相容
- 改成 `if (action === "like") { likes: ... } else { saves: ... }` 和 `ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"]`
- 再跑 tsc → **0 errors** ✅

#### Task 9：Build + smoke test
- `npx next build` → 11 routes 全部編譯成功，middleware 87.3 kB
- `npx next dev` 在背景啟動，跑 curl 驗證：
  - ✅ `GET /api/landmarks` → 15 筆地標，snake→camel mapping 正確
  - ✅ `GET /api/landmarks/lm-006` → 德田館 + posts: []
  - ✅ `GET /api/posts` → []
  - ✅ `GET /api/users` → []
  - ✅ `GET /api/auth/me` 無 session → `{user:null,profile:null}` HTTP 401
- `POST /api/auth/signup`（沒有 service role key）→ `{"error":"Invalid API key"}` HTTP 500（**錯誤路徑正確**，需要使用者貼 service role key 進 `.env.local` 才能跑完整 signup）

---

### 總結：完成的檔案

```
新增：
  .mcp.json                                 ← project-local Supabase MCP
  .env.local                                ← 公開值已填，service role 待補
  .env.local.example                        ← 範本
  lib/supabase/server.ts                    ← SSR client
  lib/supabase/admin.ts                     ← service role client
  lib/supabase/mappers.ts                   ← snake↔camel 轉換 + haversine
  lib/supabase/database.types.ts            ← 從 Supabase 生的 Database 型別
  middleware.ts                             ← session refresh
  app/api/auth/signup/route.ts
  app/api/auth/login/route.ts
  app/api/auth/logout/route.ts
  app/api/auth/me/route.ts

修改：
  ~/.env.secrets                            ← 加 GITHUB_PERSONAL_ACCESS_TOKEN
  ~/.mcp.json                               ← PAT 改用 ${VAR}
  .gitignore                                ← 加 .env*.local
  package.json                              ← 加 @supabase/supabase-js, @supabase/ssr
  app/api/landmarks/route.ts                ← 改用 Supabase
  app/api/landmarks/[id]/route.ts           ← 改用 Supabase
  app/api/posts/route.ts                    ← 改用 Supabase + auth
  app/api/posts/[id]/route.ts               ← 改用 Supabase + auth
  app/api/posts/[id]/reactions/route.ts     ← 改用 Supabase + upsert + auth
  app/api/users/route.ts                    ← POST 移除，GET 改用 Supabase
  app/api/users/[id]/route.ts               ← PUT 加 auth 檢查

刪除：
  lib/db.ts                                 ← in-memory store
  lib/types.ts                              ← 舊 type 定義
```

Supabase（project `xktiskyatbamqelqzoou`）狀態：4 張表 + RLS + 2 trigger + 15 筆 seed landmark + 0 筆 profile/post/reaction（等使用者 signup）。
