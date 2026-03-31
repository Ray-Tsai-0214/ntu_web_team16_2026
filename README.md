# OMG 奇聞地圖 (Odd Map Gossip)

NTU Web Programming Team 16 — 地圖式校園八卦分享 App

## Demo

**線上網址：** https://ntuwebteam162026.vercel.app

| 頁面 | 連結 | 說明 |
|------|------|------|
| API 文件首頁 | https://ntuwebteam162026.vercel.app | 所有 API 端點列表 |
| 地圖首頁 | https://ntuwebteam162026.vercel.app/frontend/home.html | Mapbox 地圖 + 貼文標記 |
| 個人頁面 | https://ntuwebteam162026.vercel.app/frontend/profile.html | 使用者資料 + 貼文列表 |
| 發文頁面 | https://ntuwebteam162026.vercel.app/frontend/upload.html | 發佈新貼文到後端 |
| 寵物頁面 | https://ntuwebteam162026.vercel.app/frontend/pet.html | 寵物互動（純前端） |

## API Endpoints

```
GET  /api/landmarks              取得所有地標
GET  /api/landmarks?lat=&lng=    附近地標查詢（Haversine，預設 200m）
GET  /api/landmarks/:id          地標詳情 + 該地標貼文

GET  /api/posts                  取得所有貼文
GET  /api/posts?landmarkId=      依地標篩選貼文
POST /api/posts                  發佈新貼文（檢查每日上限）
GET  /api/posts/:id              單一貼文 + 反應統計
PATCH /api/posts/:id             按讚/收藏 toggle

GET  /api/posts/:id/reactions    該貼文的反應統計
POST /api/posts/:id/reactions    新增反應（😂🤯👍🤔👎）

GET  /api/users                  所有使用者
GET  /api/users/:id              使用者資料 + 其貼文
POST /api/users                  註冊新使用者
PUT  /api/users/:id              更新使用者資料
```

## Tech Stack

- **Frontend:** HTML5 + CSS3 + Vanilla JS + Mapbox GL JS
- **Backend:** Next.js 15 App Router (TypeScript)
- **Database:** In-memory (種子資料含 5 個 NTU 校園地標)
- **Deployment:** Vercel

## Local Development

```bash
npm install
npm run dev
# http://localhost:3000/frontend/home.html
```

## Project Structure

```
├── app/api/            Next.js API Routes（後端）
├── lib/                資料型別 + In-memory DB
├── public/frontend/    靜態前端（HTML/CSS/JS/assets）
├── HW_Report/report/   每週作業報告
└── OMG_blueprint.md    產品設計文件
```

## Team (第16組)

| 成員 | 負責項目 |
|------|---------|
| 林芷葳 | pet.html + css + js |
| 韓承芯 | home.html + css + js (Mapbox) |
| 周世恩 | profile.html + css + js |
| 蔡秉叡 | upload + 後端架構 + 部署 |
