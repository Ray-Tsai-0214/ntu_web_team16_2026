# 1. 練習了哪些當週上課的主題:

本週的重點是「後端建置與前後端串接」。我們在先前已完成的靜態 HTML/CSS/JS 前端基礎上，使用 Next.js 15 App Router 搭建了完整的 REST API 後端，並將前端頁面改為從 API 取得資料，實現前後端分離的架構。

首先，我們建立了 Next.js 專案結構。透過 `app/api/` 目錄下的 Route Handlers，定義了四組 RESTful API 端點：

- **Landmarks（地標）**：`GET /api/landmarks` 取得所有地標、支援座標附近查詢（Haversine 公式）
- **Posts（貼文）**：`GET /api/posts` 取得貼文、`POST /api/posts` 新增貼文（含每日上限檢查）、`PATCH /api/posts/:id` 支援按讚/收藏
- **Reactions（反應）**：`GET/POST /api/posts/:id/reactions` 五種 Threads 風格反應系統
- **Users（使用者）**：`GET /api/users/:id` 取得使用者資料與統計

在資料層方面，我們使用 TypeScript 定義了完整的型別系統（`lib/types.ts`），並建立了 In-memory Database（`lib/db.ts`）作為資料儲存，內含 5 個 NTU 校園地標種子資料。資料模型的欄位設計完全對齊前端 JS 的格式（如 `coords: [lng, lat]`、`img`、`text`、`likes`、`saves`），讓前後端的資料結構一致。

在前後端串接方面，我們建立了共用的 `js/api.js` 模組，封裝 `fetchAPI()` 函式處理 base URL 自動偵測（支援本地 `localhost:3000` 和部署後的 Vercel URL）。各頁面的修改如下：

- **home.html**：將原本硬編碼的 `postsData` 陣列改為 `fetch('/api/posts')` 從 API 載入，按讚和收藏按鈕改為 `PATCH` 請求同步到後端
- **profile.html**：從 `GET /api/users/user-001` 取得使用者資料，動態渲染 profile header、stats 數據和貼文列表
- **upload.html**：Publish 按鈕改為 `POST /api/posts`，將故事內容、標籤、地標資訊真正送出到後端

最後，我們使用 Vercel CLI 將專案部署到 Vercel 平台，實現了從本地開發到線上部署的完整流程。

# 2. 額外找了與當週上課的主題相關的程式技術：

在後端技術選型上，我們比較了兩個方案：

**Next.js + Vercel 全棧方案** vs **Django REST Framework**

最終選擇 Next.js 是因為：
- 前後端在同一個 repo 中，Server Actions 和 Route Handlers 可以直接處理 API 邏輯
- Vercel 自動 CI/CD + Preview URL，適合團隊協作
- 部署零配置，`git push` 即部署

額外學到的技術：
- **Haversine 公式**：用於計算地球表面兩點之間的距離，實作「附近地標查詢」功能（200m 半徑）
- **RESTful API 設計**：學習 HTTP 方法語意（GET 讀取、POST 新增、PATCH 部分更新、PUT 完整更新）
- **In-memory Database 模式**：使用 Singleton pattern 確保整個 server 共用同一個資料庫實例
- **Optimistic Update**：前端先更新 UI 再同步 API（按讚/收藏時先改本地狀態，背景非同步發送 PATCH）
- **Event Delegation**：在 profile.js 中，對動態產生的反應按鈕使用事件委派，避免重複綁定事件

在部署方面，學習了 Vercel CLI 的使用：
- `vercel link` — 連結專案
- `vercel deploy` — 預覽部署
- `vercel deploy --prod` — 正式部署

# 3. 組員分工情況 (共100%)，第16組

- 林芷葳 25% pet.html + css + js
- 韓承芯 25% home.html + css + js（Mapbox 地圖整合）
- 周世恩 25% profile.html + css + js
- 蔡秉叡 25% 後端架構（Next.js API routes + types + db）、前後端串接（api.js + 各頁面 fetch 整合）、Vercel 部署
