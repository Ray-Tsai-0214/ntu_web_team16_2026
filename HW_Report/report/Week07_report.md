## 1. 練習了哪些當週上課的主題:

本週的核心重點放在將資料庫實際建置完成、串接前端資料調用流程，以及針對整體系統進行錯誤排查與修復。相較於上週偏向架構設計，本週更著重於實際開發中的「資料流整合」與「系統穩定性」。

首先，我們完成了 Supabase 資料庫的實際建立與欄位設計落地。依照先前規劃的 schema，將寵物系統所需的資料（如 coins、exp、hunger、mood、health 等）正式建立於 PostgreSQL 中，並確保欄位型別與預設值能支援遊戲邏輯運作。同時也確認各欄位在前端 state 與後端資料之間能正確對應，避免 snake_case / camelCase 不一致造成資料錯誤。

接著，我們完成了前端與 Supabase API 的資料調用整合。透過既有的 fetchAPI 封裝，成功從 /api/pets/me 取得當前使用者的寵物資料，並將回傳結果同步至前端 state。同時實作了 patchPet 來處理資料更新，使得餵食、數值變動等操作能即時回寫至資料庫，形成完整的「讀取 → 顯示 → 修改 → 同步」循環。

在這個過程中，我們特別練習了前端狀態管理與後端資料來源之間的關係。例如：畫面顯示的數值（coins、exp 等）並不是直接寫在 HTML，而是透過 updateStats() 動態渲染，確保 UI 永遠反映最新的 state。這也讓我們理解到資料流應該由「後端 → state → UI」單向流動，而非讓 UI 嘗試直接讀取變數。

最後，本週花了相當多時間在**問題排查與修復（debugging）**上。包含：

state 資料被 API 回傳值覆蓋（導致手動修改無效）
HTML 嘗試直接使用 state.xxx 導致畫面無法正確顯示
圖片路徑錯誤或資源未載入造成顯示異常

透過這些問題，我們學習到在實際專案中，錯誤往往來自「資料流順序」、「非同步時機」以及「多來源狀態覆蓋」，而非單一語法錯誤。

整體而言，本週的學習重點在於：將資料庫、API、前端狀態與 UI 串接成一個可運作的完整系統，並透過除錯提升系統穩定性與可預測性。

## 2. 額外找了與當週上課的主題相關的程式技術：

本週在實作過程中，進一步了解了多項與資料流與系統穩定性相關的技術概念：

前端狀態管理與資料流（State Flow）
Single Source of Truth（單一資料來源）
將 state 作為唯一的資料來源，所有 UI 顯示都透過 updateStats() 從 state 渲染，避免直接在 HTML 寫死數值或使用未綁定的變數。
State → UI 同步模式
每當資料改變（如餵食後 coins 減少），必須手動呼叫 updateStats()，確保畫面更新。這讓我們理解 UI 並不會自動追蹤變數，而是需要明確觸發渲染。
非同步資料與覆蓋問題（Async Data Overwrite）

在 initApp() 中，從 API 取得資料後會覆蓋 state

state.coins = pet.coins;

若在此之前手動修改 state，會被 API 結果覆蓋。

學到 debug 時應特別注意「執行順序」，例如：
修改要放在 fetch 之後
或透過 setTimeout / console.log 確認資料變化時機
DOM 操作與渲染時機

且下周待完成的有，在Vercel上無法顯示的圖片要如何顯示成功。

## 3. 組員分工情況 (共100%)，第16組
林芷葳 25% 加入金錢到調取資料庫數據，且可修改寵物命名。
韓承芯 25%
周世恩 25% 實作 profile 貼文點擊展開詳情層（動態建立 overlay、支援 backdrop/關閉鍵/Esc 關閉與捲動鎖定）、補上 profile.js 關鍵註解、將 JS 內嵌樣式完整搬移至 profile.css，並修正手機點擊藍色高亮與統一全頁按鈕 focus/tap 互動樣式。
蔡秉叡 25% 後端從 in-memory 遷移到 Supabase（4 張表 + RLS policies + SECURITY DEFINER triggers + 15 筆 landmark seed migration）、設計並實作 username-only 身分驗證系統（synthetic-email + Supabase Auth admin client）、新增 `/api/auth/{signup,login,logout,me}` 四個路由、改寫所有既有 API routes 加上 session 檢查（`auth.uid()` 取代 request body 的 `authorId`）、建立 `lib/supabase/{server,admin,mappers,database.types}.ts`、新增 Next.js middleware 自動 refresh session cookie、配置 project-local `.mcp.json` 隔離 Supabase project、把 GitHub PAT 從明文搬到環境變數
