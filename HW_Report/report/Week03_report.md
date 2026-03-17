# 1. 練習了哪些當週上課的主題:

這週上課主要講的是 HTML 基礎結構和 CSS 樣式設計，我們在作業中實際把這些觀念用上了。

HTML 的部分，我們練習了網頁的基本架構，像是用 ```<header>、<main>、<footer>``` 這些語意化標籤來組織頁面，而不是全部都用 ```<div>``` 硬幹。每個頁面都有用到表單元素（```<input>```、```<textarea>```、```<button>```）、清單、連結導覽等等，算是把課堂上教的常用標籤都摸過一輪了。我們也有注意到巢狀結構的寫法，像是 upload 頁面的表單就有蠻多層的包法。

CSS 的部分花了比較多時間研究。我們用了 CSS Variables 來統一整個專案的配色（像 ```--lightPeach```、```--mutedBrown``` 這些），這樣改顏色的時候不用一個一個檔案去找。排版主要靠 Flexbox，profile 頁的 stats 那排三個數字就是用 ```justify-content: space-around``` 排出來的。然後也有練習到 ```position: fixed``` 和 ```position: sticky```，home 頁的 FAB 按鈕是 fixed 定在底部，upload 頁的發布按鈕則是用 sticky 黏在下面。動畫的部分我們用了 ```transition``` 搭配 ```transform``` 做出一些互動效果，像是 FAB 展開的扇形動畫、卡片 hover 時微微浮起的效果等等。整體是 mobile-first 的設計，有針對不同寬度寫了 media query 來做響應式調整。

# 2. 額外找了與當週上課的主題相關的程式技術:

除了 HTML 跟 CSS 之外，我們有額外去學了一些基礎的 JavaScript，主要是因為有些互動效果光靠 CSS 做不到。像 home 頁面的地圖上，我們用 JS 動態生成了隨機位置的 marker，點擊 marker 會放大、點空白處會取消選取，這些都是透過 ```addEventListener``` 和 ```classList.toggle``` 來實現的。FAB 按鈕的展開收合也是靠 JS 控制 class 的切換，再讓 CSS transition 去跑動畫。

另外我們也有開始關注 Tailwind CSS 這個 utility-first 的框架。目前我們是自己手刻 CSS，但寫到後來發現很多重複的樣式（像圓角、陰影、間距）其實可以用 Tailwind 的 class 直接套，開發速度會快蠻多的。之後如果要優化或加新功能，我們打算試著導入 Tailwind CSS，搭配 JavaScript 來做更完整的互動體驗，這部分算是我們自己額外有興趣去研究的方向。

# 3. 組員分工情況 (共100%)，第16組

- 林芷葳 25% pet.html + css
- 韓承芯 25% home.html + css
- 周世恩 25% profile.html + css
- 蔡秉叡 25% upload.html + css + 整體架構整理(OMG_blueprint.md)
