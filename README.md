# OMG 奇聞地圖 (Odd Map Gossip)

NTU Web Programming Team 16 — 地圖式校園八卦分享 App

## Demo

**線上網址：** https://ntuwebteam162026.vercel.app

### 🆕 Auth pages (Week 6+)

從 Week 6 開始導入帳號系統。第一次使用請從 `signup.html` 註冊；之後每次都從 `login.html` 進入。

| 頁面 | 連結 | 說明 |
|------|------|------|
| 註冊 | https://ntuwebteam162026.vercel.app/frontend/signup.html | username + password 註冊（不需 email）+ 12 個 emoji avatar |
| 登入 | https://ntuwebteam162026.vercel.app/frontend/login.html | 已有帳號者由此進入 |

### App pages

| 頁面 | 連結 | 需要登入？ | 說明 |
|------|------|-----------|------|
| 地圖首頁 | https://ntuwebteam162026.vercel.app/frontend/home.html | ❌ 公開瀏覽 | Mapbox 地圖 + 貼文標記。右上角顯示登入狀態 |
| 個人頁面 | https://ntuwebteam162026.vercel.app/frontend/profile.html | ✅ 必須登入 | 自己的資料 + 貼文 + 登出按鈕。未登入會自動跳到 login.html |
| 發文頁面 | https://ntuwebteam162026.vercel.app/frontend/upload.html | ✅ 必須登入 | 發佈新貼文，author_id 從 session 取，無法偽造 |
| 寵物頁面 | https://ntuwebteam162026.vercel.app/frontend/pet.html | ❌ 純前端遊戲 | 寵物養成（state 在前端 localStorage） |
| API 文件首頁 | https://ntuwebteam162026.vercel.app | — | Next.js 預設首頁 |

## 使用方法（給初次使用者）

```
1. 開 https://ntuwebteam162026.vercel.app/frontend/signup.html
2. 填 username（3–20 字元，英數加底線）+ password（≥6 字元）+ 選 emoji avatar
3. 按 Sign up → 自動跳到 home.html，右上角會看到自己的 emoji
4. 從右上角點 emoji 進個人頁，或從右下角 + 選相機進發文頁
5. 要登出：個人頁右上角 logout icon
6. 下次回來：直接從 https://ntuwebteam162026.vercel.app/frontend/login.html 進入
```

如果直接打 `profile.html` / `upload.html` 但沒登入 → 會自動跳到 `login.html`。

## API Endpoints

### 🆕 Authentication（Week 6+）

session 用 HttpOnly cookie 由 `@supabase/ssr` 管理，下面所有需要登入的路由都會自動帶 cookie。

```
POST /api/auth/signup    註冊：{ username, password, avatarEmoji? } → 201 + 自動登入
POST /api/auth/login     登入：{ username, password } → 200 + set-cookie
POST /api/auth/logout    登出：清 session cookie → 200 { ok: true }
GET  /api/auth/me        當前使用者：→ 200 { user, profile } 或 401
```

### Public read（無需登入）

```
GET  /api/landmarks              取得所有地標
GET  /api/landmarks?lat=&lng=    附近地標查詢（Haversine，預設 200m）
GET  /api/landmarks/:id          地標詳情 + 該地標貼文
GET  /api/posts                  取得所有貼文
GET  /api/posts?landmarkId=      依地標篩選貼文
GET  /api/posts/:id              單一貼文 + 反應統計
GET  /api/posts/:id/reactions    該貼文的反應統計
GET  /api/users                  所有使用者公開資料
GET  /api/users/:id              單一使用者資料 + 其貼文
```

### 🔒 Authenticated（需要 session cookie）

```
POST  /api/posts                 發佈新貼文（檢查每日上限 5 篇，author_id 從 session 取）
PATCH /api/posts/:id             按讚 / 收藏 toggle
POST  /api/posts/:id/reactions   新增反應（😂🤯👍🤔👎），1 user 1 reaction per post
PUT   /api/users/:id             更新使用者資料（只能改自己）
```

> ⚠️ `POST /api/users`（Week 5 的匿名建帳號路由）已**移除**，請改用 `POST /api/auth/signup`。

## Tech Stack

- **Frontend:** HTML5 + CSS3 + Vanilla JS + Mapbox GL JS
- **Backend:** Next.js 15 App Router (TypeScript) + `@supabase/ssr` middleware
- **Database:** Supabase (PostgreSQL) — 4 tables (`profiles`, `landmarks`, `posts`, `reactions`)
- **Auth:** Supabase Auth + 「synthetic-email」pattern（`${username}@omg.local`），讓使用者只需 username/password 即可註冊登入，不需要 email。Server 端用 service role key 呼叫 `auth.admin.createUser({ email_confirm: true })` 跳過 email 驗證
- **Security:** PostgreSQL Row-Level Security (RLS) 強制 `auth.uid() = author_id` / `user_id`，所有寫入路由的「操作者身份」都從 session 取得，無法被前端偽造
- **Deployment:** Vercel（auto-deploy on push to `main`）

## Local Development

```bash
# 1. 安裝相依套件
npm install

# 2. 建立 .env.local（從範本複製）
cp .env.local.example .env.local
# 編輯 .env.local，把 SUPABASE_SERVICE_ROLE_KEY 換成 Supabase Dashboard 的 service_role key
# 公開值（NEXT_PUBLIC_SUPABASE_URL、NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY）已預先填好

# 3. 啟動 dev server
npm run dev

# 4. 開瀏覽器
open http://localhost:3000/frontend/signup.html
```

需要的環境變數一覽（4 個）：

| 變數 | 公開？ | 取得方式 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ public | Supabase Dashboard → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | ✅ public | 同上 → Publishable / anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | ❌ secret | 同上 → service_role key（紅色 secret 標籤）|
| `OMG_AUTH_EMAIL_DOMAIN` | — | 預設 `omg.local`（合成 email 用，使用者看不到） |

## Project Structure

```
├── app/
│   └── api/
│       ├── auth/          🆕 signup / login / logout / me
│       ├── landmarks/     地標
│       ├── posts/         貼文 + 反應
│       └── users/         使用者
├── lib/
│   └── supabase/          🆕 server.ts (SSR client) / admin.ts (service role) / mappers.ts / database.types.ts
├── middleware.ts          🆕 每個 request 自動 refresh session cookie
├── public/frontend/       靜態前端（HTML / CSS / JS / assets）
│   ├── login.html         🆕
│   ├── signup.html        🆕
│   ├── home.html / profile.html / upload.html / pet.html
│   ├── css/auth.css       🆕
│   └── js/{login,signup,api,home,profile,pet}.js
├── HW_Report/report/      每週作業報告（Week03–Week06）
├── .mcp.json              project-local Supabase MCP 設定（指向 OMG project）
├── .env.local.example     env vars 範本
└── OMG_blueprint.md       產品設計文件
```

## Team (第16組)

| 成員 | 負責項目 |
|------|---------|
| 林芷葳 | pet.html + css + js |
| 韓承芯 | home.html + css + js (Mapbox) |
| 周世恩 | profile.html + css + js |
| 蔡秉叡 | upload + 後端架構 + 部署 + Week 6 Supabase 遷移 + Auth 系統 |
