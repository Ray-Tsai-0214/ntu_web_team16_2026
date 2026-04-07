# Contributing Guide

Team 16 成員協作流程指南。歡迎任何 commit！

---

## 🚀 Quick Start

```bash
# 1. Clone repo
git clone https://github.com/Ray-Tsai-0214/ntu_web_team16_2026.git
cd ntu_web_team16_2026

# 2. 安裝依賴
npm install

# 3. 啟動本地 dev server
npm run dev
# → 打開 http://localhost:3000/frontend/home.html
```

本地修改、儲存檔案後會自動熱重載，不用重啟。

---

## 🔄 開發流程

### 方法 A：直接推到 `main`（最快）

適合小改動、緊急修復、個人練習：

```bash
git pull origin main        # 先同步最新進度
# ...改 code...
git add <你改的檔案>
git commit -m "描述你做了什麼"
git push origin main
```

Push 後約 **1 分鐘**自動部署到 production：https://ntuwebteam162026.vercel.app

### 方法 B：用 feature branch + PR（推薦做大功能時用）

適合影響範圍大、需要 review 的改動：

```bash
git checkout -b feat/your-feature-name
# ...改 code...
git push origin feat/your-feature-name
```

到 GitHub 開一個 Pull Request：
- Vercel 會自動建立一個 **preview URL**（留言在 PR 下方）
- 點 preview URL 驗證功能正常
- 確認無誤後 merge 到 main → 自動部署到 production

---

## 📂 專案結構

```
ntu_web_team16_2026/
├── app/api/              # 後端 API routes (Next.js)
│   ├── posts/            # 貼文 CRUD
│   ├── landmarks/        # 地標 CRUD
│   ├── users/            # 使用者 CRUD
│   └── ...
├── lib/
│   ├── db.ts             # In-memory database + seed data
│   └── types.ts          # TypeScript 型別定義
├── public/frontend/      # 前端 HTML/CSS/JS
│   ├── home.html         # 地圖首頁
│   ├── upload.html       # 發文頁
│   ├── profile.html      # 個人頁
│   ├── pet.html          # 寵物頁
│   ├── css/
│   └── js/
│       └── api.js        # fetchAPI 共用 helper
└── HW_Report/report/     # 作業報告
```

**修改前端**：改 `public/frontend/**` 下的檔案
**修改後端**：改 `app/api/**/route.ts`
**加資料欄位**：改 `lib/types.ts` + `lib/db.ts`

---

## ✅ Commit 規範

Commit message 用英文或中文皆可，但要**講清楚做了什麼**：

```bash
# 好的 commit message
git commit -m "feat: add comment section to post card"
git commit -m "fix: resolve map marker overlap issue"
git commit -m "style: update home page header color"

# 不好的 commit message
git commit -m "update"
git commit -m "修改"
git commit -m "wip"
```

常用前綴（optional but nice）：
- `feat:` 新功能
- `fix:` 修 bug
- `style:` 純視覺 / CSS 調整
- `refactor:` 重構（行為不變）
- `docs:` 文件更新
- `chore:` 雜項（設定、依賴）

---

## ⚠️ 注意事項

### 1. In-memory Database 會重置
目前後端用的是 in-memory DB — **每次 Vercel 重新部署，所有新增的貼文/反應會被清空**，回到 seed 資料。如果要 demo，部署後再貼測試資料就好。

### 2. 不要 commit 這些東西
- `node_modules/` — 已經在 `.gitignore`
- `.next/` — build 輸出
- 任何 `.env` 檔案或含有密鑰的東西
- IDE 暫存檔（`.vscode/`, `.idea/`）

### 3. Mapbox Token
目前 Mapbox token 是 public token (`pk.*`)，寫死在 `public/frontend/js/home.js` 和 `public/frontend/upload.html`。**這是設計上就可以公開的，不是洩漏。**

### 4. 本地 build 測試
推上去之前如果擔心會爆 build，可以先跑：
```bash
npm run build
```
本地 build 成功通常 Vercel 上也會成功。

---

## 🐛 遇到問題

### 本地跑不起來？
```bash
rm -rf node_modules .next
npm install
npm run dev
```

### Push 之後網頁沒更新？
- 等 1-2 分鐘（Vercel 需要時間 build）
- 檢查 GitHub repo 首頁，commit 旁邊應該有綠勾 ✅
- 紅叉 ❌ → 點進去看 build log

### API 回傳錯誤？
- 打開瀏覽器 DevTools → Network tab 看 response
- 檢查 `lib/db.ts` 看 seed 資料格式
- 本地用 `npm run dev` reproduce 一次

---


**Repo:** https://github.com/Ray-Tsai-0214/ntu_web_team16_2026
**Production:** https://ntuwebteam162026.vercel.app
