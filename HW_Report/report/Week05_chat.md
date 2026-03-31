
## 對話紀錄：使用 Claude Code 搭建 Next.js 後端 + 前後端串接

### Turn 1：查看現有架構與後端建議

**User：** 請幫我查看目前的網站架構細節以及作業進度，如果我想要在此之上架設後端，你會如何建議？

**Claude：** 分析了專案現狀（純靜態 HTML/CSS/JS 前端原型，4 頁已完成），比較了兩個後端方案：

| 比較 | Next.js + Vercel | Django |
|------|-----------------|--------|
| 地理查詢 | PostGIS 或自製 Haversine | GeoDjango（業界標準） |
| 部署 | 零配置自動部署 | 需 WSGI server |
| 前端整合 | 同 repo，無 CORS 問題 | 前後端分離，需處理 CORS |
| 學習成本 | 需學 React + Next.js | 需學 Python + Django |

建議兩階段：短期用現有前端 + API，中期遷移到 Next.js 全棧。

---

### Turn 2：建立 Next.js 後端

**User：** 請幫我搭建並且解釋你是如何搭建的

**Claude：** 建立了以下檔案結構：

```
app/api/
├── landmarks/route.ts        ← GET 所有地標 + 附近查詢
├── landmarks/[id]/route.ts   ← GET 單一地標 + 該地標貼文
├── posts/route.ts            ← GET/POST 貼文
├── posts/[id]/route.ts       ← GET/PATCH 單一貼文
├── posts/[id]/reactions/     ← GET/POST 反應
└── users/                    ← GET/POST/PUT 使用者
lib/
├── types.ts                  ← TypeScript 型別定義
└── db.ts                     ← In-memory DB + 種子資料
```

關鍵設計：
- 種子資料包含 5 個 NTU 校園地標
- Haversine 公式計算附近地標（200m 半徑）
- 每日發文上限（2 篇）、發文加分（+2 points）
- 反應系統支援 5 種類型

---

### Turn 3：清理 HW_Report + 前後端串接

**User：** 請將 HW_Report 資料夾中的檔案僅保留 report 資料夾，其餘刪除，並且將 public/frontend 確實連到 database

**Claude：** 執行了以下工作：

1. **清理 HW_Report/** — 刪除所有 html/css/js/assets，僅保留 `report/`
2. **更新後端資料模型** — `lib/types.ts` 和 `lib/db.ts` 改為對齊前端 JS 的 `postsData` 格式：
   ```typescript
   interface Post {
     id: number;
     coords: [number, number];  // [lng, lat]
     img: string;
     text: string;
     date: string;
     likes: number;
     saves: number;
   }
   ```
3. **建立 `js/api.js`** — 共用 fetch helper，自動偵測 base URL
4. **改寫前端 JS**：
   - `home.js`：`postsData = await fetchAPI('/api/posts')` 取代硬編碼
   - `profile.js`：`fetchAPI('/api/users/user-001')` 動態渲染
   - `upload.html`：Publish → `POST /api/posts`
5. **部署到 Vercel** — `vercel deploy --prod`

最終前後端連接對照：

| 前端操作 | API 呼叫 |
|---------|----------|
| 地圖載入貼文 | `GET /api/posts` |
| 按讚/收藏 | `PATCH /api/posts/:id` |
| 個人頁載入 | `GET /api/users/user-001` |
| 發布貼文 | `POST /api/posts` |
