## 1. 練習了哪些當週上課的主題:

## 架構說明

專案透過 `js/api.js` 的 `fetchAPI()` 函式統一封裝所有後端請求，自動處理 JSON 解析、錯誤處理與 Cookie 傳遞。前端各頁面只需呼叫 `fetchAPI()`，不直接操作原生 `fetch()`（第三方 API 除外）。

---
## 一、自建後端 API

| 頁面 | 端點 | 方法 | 功能 |
|------|------|------|------|
| `api.js` | `/api/auth/me` | GET | 取得目前登入使用者 |
| `api.js` | `/api/auth/logout` | POST | 登出 |
| `login.js` | `/api/auth/login` | POST | 登入 |
| `signup.js` | `/api/auth/signup` | POST | 註冊 |
| `home.js` | `/api/posts` | GET | 載入所有貼文 |
| `home.js` | `/api/posts/${id}` | PATCH | 更新愛心／收藏 |
| `home.js` | `/api/posts/${id}` | GET | 取得貼文詳情 |
| `upload.html` | `/api/posts` | POST | 上傳新貼文 |
| `pet.js` | `/api/pets/me` | GET | 取得自己的寵物 |
| `pet.js` | `/api/pets` | POST | 新增寵物 |
| `pet.js` | `/api/pets/${id}` | GET | 取得特定寵物 |
| `profile.js` | `/api/users/${id}` | GET | 取得使用者資料 |

---

## 二、第三方外部 API

| 服務 | 端點 | 功能 | 費用 |
|------|------|------|------|
| Mapbox GL JS | `api.mapbox.com` | 地圖渲染、標記點、使用者定位 | 免費額度內 |
| Open-Meteo | `api.open-meteo.com` | 依使用者座標顯示即時天氣 | 完全免費、無需金鑰 |

---

## 三、後端服務

| 服務 | 用途 |
|------|------|
| Supabase | 資料庫儲存、使用者驗證（JWT） |


## 2. 組員分工情況 (共100%)，第16組
林芷葳 25% 
韓承芯 25% 新增依使用者座標顯示即時天氣功能，使用第三方外部api
周世恩 25% 
蔡秉叡 25% 