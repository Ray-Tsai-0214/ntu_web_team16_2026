# Week 03 Chat Transcript

## 對話背景資訊

| 欄位 | 內容 |
| --- | --- |
| 使用者 | Ray |
| 對話整理時間 | 2026-03-13 15:04:50 +08:00 |
| 原始檔最後修改時間 | 2026-03-13 15:00:58 +08:00 |
| 使用模型 | Claude Code Opus 4.6（依使用者說明） |
| 詢問類型 | 產品發想、地圖型 Web App 機制設計、MVP 規劃、Prompt 生成、Blueprint 文件產出 |
| 對話主題 | OMG（Odd Map Gossip）地圖型社群 / 地標故事蒐集應用 |
| 整理說明 | 已將原始終端逐字貼文重排為可讀的 Markdown 對話稿，並保留重要系統事件。 |

## 對話摘要

- 討論一個以地圖為核心、適合手機網頁使用的地標故事蒐集應用。
- 聚焦在使用者上傳內容、地標留言、評分與品質控管機制。
- 最後產出 OMG（Odd Map Gossip）的命名方向與 `OMG_blueprint.md` 文件。

## 完整對話整理

### Turn 1

#### 使用者（Ray）

我現在想設計以地圖為標準的網頁應用，目標是參考 Nomad Table、皮克敏手遊等地圖應用程式，只是做網頁版，並且想蒐集使用者附近的奇文軼事當作養分，然後以手機網頁作為基底。Database 主要透過蒐集 Google Map 上面有趣的一顆星評論以及其他公開管道。設計的最終目標是，使用者可以在走路的時候使用寵物（類似皮克敏）到附近（例如方圓兩百公尺）蒐集這些評論，使用者也可以自行上傳每天的奇文軼事並且大家公開評分。請和我探討當中的機制以及可行性。

#### Claude Code Opus 4.6

這是一個很有趣的概念！讓我從幾個面向來和你探討：

##### 核心機制拆解

###### 1. 地圖 + 寵物收集機制

- 寵物系統：類似皮克敏，使用者養寵物，寵物可以被「派出去」到附近收集內容。
- 收集範圍：以使用者 GPS 為中心，半徑約 200m 內的「故事點」。
- 遊戲化：寵物有等級或外觀變化，收集越多故事養分越多，進一步成長或進化。

###### 2. 內容來源

| 來源 | 可行性 | 注意事項 |
| --- | --- | --- |
| Google Maps 1 星評論 | 中等 | Google Places API 可取得評論，但有使用限制和費用，且 TOS 禁止大規模儲存評論。 |
| 使用者自行上傳 | 高 | 這是最可控的來源，UGC 為核心。 |
| 爬蟲抓取公開資料 | 灰色地帶 | 有法律風險，需注意各平台 `robots.txt`。 |

###### 3. 社群互動機制

- 使用者上傳「奇文軼事」，並綁定地理座標。
- 其他人經過附近時，寵物可以撿到。
- 評分系統可使用按讚、好笑、離譜等分類。
- 熱門故事可以擴大影響範圍，例如從 200m 提升到 500m。

##### 可行性分析

###### 技術棧建議（Mobile-first Web App）

- 前端：React / Next.js + Mapbox GL JS 或 Leaflet
- 地圖：Mapbox（免費額度較多）或 Google Maps JS API
- 定位：Geolocation API + 背景定位（PWA）
- 後端：Node.js / Python FastAPI
- 資料庫：PostgreSQL + PostGIS（地理查詢）
- 即時：WebSocket（附近有新故事時通知）

###### 主要技術挑戰

1. GPS 精度：手機瀏覽器的 GPS 在室內或都市叢林中誤差可達 50-100m。
2. 背景定位：PWA 對背景 GPS 追蹤支援有限，不像原生 App。
3. Google Maps 評論取得：Places API 每個地點最多回傳 5 則評論，且需付費。
4. 內容審核：UGC 需要過濾不當內容。

###### 關鍵風險

- 冷啟動問題：初期沒內容，沒人用，就更沒內容。建議先用 AI 生成或爬取種子資料。
- Google Maps TOS：不能大規模快取或儲存評論，需小心處理。

##### 如果想用 Gemini 輔助，可用的方向

###### A. 種子內容生成（用來填充初期資料）

```text
你是一個擅長蒐集都市傳說和有趣地方故事的作家。
請根據以下台北市地點，生成 5 則虛構但寫實的「Google Maps 一星評論風格」的搞笑評論：

地點：台大總圖書館
格式：
- 評論內容（50-100字，語氣像真實的憤怒/搞笑/無厘頭評論）
- 搞笑程度 1-5
- 標籤（例如：#食物 #服務態度 #靈異 #迷路）
```

###### B. 內容篩選 / 分類（對爬取的真實評論做處理）

```text
以下是從公開來源取得的 Google Maps 評論。
請判斷每則評論是否「有趣 / 奇特 / 值得收藏」，並給出分數 1-10。
只保留分數 >= 7 的評論。

評論列表：
1. "這家店的老闆養了一隻會開門的貓..."
2. "普通，沒什麼特別的"
3. ...

回傳 JSON 格式：[{"id": 1, "score": 9, "tags": ["動物", "驚奇"]}, ...]
```

###### C. 使用者上傳內容審核

```text
使用者提交了以下「奇文軼事」，請判斷：
1. 是否含有不當內容（色情 / 暴力 / 個資）
2. 趣味程度 1-10
3. 建議標籤
4. 是否適合公開發布

內容："{user_content}"
地點："{location}"
```

##### 建議優先順序

1. 先做 UGC 為主，不要一開始就依賴 Google Maps 評論，因為有 TOS 風險與成本問題。
2. 用 Gemini API 做內容審核與趣味評分，這是最實際的 AI 用途。
3. MVP 先做：地圖 + 定位 + 發布故事 + 附近收集，寵物系統可以之後加。
4. 考慮 PWA，但如果背景定位很重要，未來可能需要轉原生 App。

你想先從哪個部分開始實作？我可以幫你搭建專案結構。

#### 系統事件

- `Cooked for 40s`

### Turn 2

#### 使用者（Ray）

我希望先不要用 AI 生成評論，我之後會想辦法爬蟲加 AI 過濾。我希望參考類似 Nomad Table 的形式讓大家可以在該地標上留言或是評分。以及相關的得分機制，讓使用者能發出更高質量的奇文軼事貼文，不要變成濫竽充數的內容。譬如每人每天限發布兩篇，如果發的貼文迴響好可以解鎖更多篇之類的。並且評分或分享機制可以參考 Threads。

#### Claude Code Opus 4.6

好的，讓我聚焦在機制設計上。

##### 內容發布 + 品質控管機制

###### 發文限制（防灌水）

- 基礎額度：每人每天 2 篇
- 解鎖條件：
  - 累積獲得 10 個 👍：每天 3 篇
  - 累積獲得 50 個 👍：每天 4 篇
  - 單篇破 20 👍（爆文）：當天額外 +1 篇
  - 連續 7 天都有發文且平均分 > 3.5：永久 +1 篇

###### 使用者等級系統

- Lv.1 路人（0-30 積分）：2 篇 / 天，只能文字
- Lv.2 說書人（31-100）：3 篇 / 天，可附圖
- Lv.3 軼事獵人（101-300）：4 篇 / 天，貼文可置頂到地標
- Lv.4 都市傳說（301+）：5 篇 / 天，可建立新地標

###### 積分來源

- 發文 +2
- 被 👍 +1
- 被收藏 +3
- 爆文（20 👍）+10
- 被檢舉成立 -20
- 被 👎 -1（但每篇最多扣 -3）

###### 為什麼不用純投票制

純投票會變成「先發優勢」，早發的文永遠在最上面。建議用時間衰減 + 互動率：

```text
熱度分數 = (👍數 - 👎數) / (發布後小時數 + 2)^1.5
```

這樣新文章有機會出頭，舊的自然沉下去。

##### 互動機制（參考 Threads）

###### 反應類型（不只是讚 / 噓）

- 😂 笑死：最正面，權重 1.5
- 🤯 離譜：正面，權重 1.2
- 👍 不錯：正面，權重 1.0
- 🤔 存疑：中性，權重 0
- 👎 無聊：負面，權重 -1.0

###### 留言串（類 Threads）

- 每個地標是一個「故事板」。
- 故事板上的貼文可以被回覆，形成留言串。
- 回覆不佔每日發文額度，但有防洗頻冷卻：同一串 60 秒內只能回一次。
- 可以引用轉發別人的故事到另一個地標，形成跨地標擴散。

###### 分享機制

- 直接分享連結：不需登入即可看單篇。
- 分享到地標：引用轉發，標注原作者，原作者也得積分 +1。
- 收藏到個人地圖：私人收藏，之後可以沿路線重溫。

##### 地標 + 地圖互動

###### 地標類型

- 📍 官方地標：對應真實 Google Maps 地點（店家、景點）
- 📌 使用者地標：Lv.4 使用者可以在任意座標釘一個，例如「這棵樹很怪」
- 🔥 熱點：24 小時內累積 > 10 篇貼文的區域自動生成

###### 收集機制（寵物系統簡化版）

- 走到地標 200m 內：解鎖該地標的故事板，可以瀏覽與發文。
- 走到 50m 內：「深度探索」，可以看到隱藏貼文（低讚數但作者標記為彩蛋的）。
- 每天走訪 3 個不同地標：每日任務獎勵積分 +5。

寵物系統可以先簡化成頭像 + 稱號，MVP 不需要養成系統。

##### 資料模型概觀

```text
User
  ├── id, username, avatar, level, points
  ├── daily_post_count, max_daily_posts
  └── created_at

Landmark（地標）
  ├── id, name, type (official/user/hotspot)
  ├── lat, lng
  ├── google_place_id (nullable)
  └── created_by (nullable)

Post（貼文 / 奇文軼事）
  ├── id, author_id, landmark_id
  ├── content, image_url (nullable)
  ├── reaction_counts {laugh, wtf, like, doubt, boring}
  ├── heat_score
  └── created_at

Reaction（反應）
  ├── user_id, post_id, type
  └── created_at

Comment（回覆）
  ├── id, post_id, author_id, parent_comment_id
  ├── content
  └── created_at
```

##### 下一步建議

先釐清幾個方向，我再幫你開始搭建：

1. 技術選擇：你偏好哪個框架？React / Vue / 純 HTML+JS？後端用 Node 還是 Python？
2. 地圖服務：Mapbox（免費額度高、客製化強）還是 Google Maps（生態系整合）？
3. MVP 範圍：建議第一版先做「地圖 + 地標瀏覽 + 發文 + 反應」，寵物與等級系統第二階段再加。
4. 部署：你有偏好的平台嗎？例如 Vercel、Firebase 或自架。

你覺得這些機制方向 OK 嗎？有想調整的部分？

### Turn 3

#### 使用者（Ray）

好的，請給我完整的初始架設 prompt，並且也同時參考 `D:\NTU_TAIWAN\NTUCS_AI\114-2\Web_design\blueprint.pdf`。這是我們討論後的簡易網頁頁面分化圖，請你參考這些生成一個 `OMG_blueprint.md`。OMG 是該應用的名稱，你認為要用哪三個單字的縮寫比較好（例如 O?? Map Gossip）？

#### 系統事件

- 讀取 1 份檔案：`D:\NTU_TAIWAN\NTUCS_AI\114-2\Web_design\blueprint.pdf`

#### Claude Code Opus 4.6

根據 blueprint 我看到以下頁面結構：

1. Home Page：地圖主頁，紅色地標 pins，底部導航列。
2. 上傳頁（原地）：拍照或上傳內容到當前位置。
3. 編輯頁：編輯貼文，有寵物頭像、文字輸入、鍵盤。
4. 地標詳情頁：點擊 pin 後顯示寵物、愛心數、貼文列表。
5. User Page：個人頁，寵物頭像、name / ID、成就、收藏、保險 / 保齡。
6. Pet Page：寵物展示頁，可愛企鵝角色。

關於 OMG 命名，我的推薦：

| 縮寫 | 全名 | 理由 |
| --- | --- | --- |
| Odd Map Gossip | 奇怪的地圖八卦 | 最貼切「奇文軼事」的精神，好記又有趣。 |
| Outdoor Map Gossip | 戶外地圖八卦 | 強調走路探索。 |
| Our Map Gossip | 我們的地圖八卦 | 強調社群感。 |

我推薦 **Odd Map Gossip**，和蒐集「奇文軼事」的主題最搭。現在幫你生成 blueprint 文件。

#### 系統事件

- 寫入檔案：`OMG_blueprint.md`
- 寫入行數：407 行
- 預覽：

```md
# OMG - Odd Map Gossip

## App Overview

A mobile-first map-based web application where users walk around, discover nearby landmarks, and collect/share interesting real-world stories and anecdotes ("gossip"). Inspired by Pikmin Bloom's walking mechanics and Nomad Table's location-based community. Users have pet companions and earn rewards for contributing high-quality content.

---

## Page Structure (based on wireframe)

### Page 1: Home Page (Map View)

... +397 lines
```

#### Claude Code Opus 4.6

文件已生成。以下是重點摘要：

OMG = **Odd Map Gossip**

「奇怪的地圖八卦」完美對應蒐集「奇文軼事」的核心概念。

你拿到的東西：

1. 6 個頁面的完整規格（對應你的手繪 wireframe）
   - Home（地圖）→ 地標詳情 → 發文 → 編輯 → 個人頁 → 寵物頁
2. 完整的遊戲化機制
   - 每日發文限制 2 → 5 篇（靠品質解鎖）
   - 4 級等級系統
   - 5 種 Threads 風格反應按鈕
   - 熱度衰減公式
3. 可直接貼進 Google AI Studio Build 的 prompt
   - 在文件最下方的 Google AI Studio Build Prompt 區塊
   - 包含技術棧、資料庫結構、商業邏輯、種子資料（台大周邊 5 個地標）
   - 直接複製程式碼區塊內的內容貼進 AI Studio 即可
4. 三階段開發計畫
   - Phase 1：AI Studio 快速出 MVP
   - Phase 2：加深功能
   - Phase 3：匯出到本地做進階開發

你可以現在就把 prompt 貼進 Google AI Studio Build 開始生成了。生成後如果有需要調整的地方再跟我說。
