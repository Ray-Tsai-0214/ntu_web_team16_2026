// 1. 初始化 Mapbox
mapboxgl.accessToken = 'pk.eyJ1Ijoib3JhbmdlaGVhcnQiLCJhIjoiY21uZWJkZzJqMW93ZDJ3cHJrZTlpNWo3dCJ9.ECWy4Lc3ZCMWlc5qZPFobQ';
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/orangeheart/cmnebww4a002701sg3ebs7gm6',
    center: [121.564, 25.033],
    zoom: 14
});

// 2. 從 API 載入貼文（取代硬編碼的 postsData）
let postsData = [];

async function loadPosts() {
    try {
        postsData = await fetchAPI('/api/posts');
        // 補上前端需要的 client-side 狀態
        postsData.forEach(p => {
            p.isLiked = false;
            p.isSaved = false;
        });
        renderMarkers();
    } catch (err) {
        console.error('Failed to load posts from API:', err);
    }
}

const fabWrapper = document.getElementById('fabWrapper');
const fabToggle = document.getElementById('fabToggle');
const fabOverlay = document.getElementById('fabOverlay');
const postModal = document.getElementById('postModal');
const closeModal = document.getElementById('closeModal');
const likeBtn = document.getElementById('likeBtn');
const saveBtn = document.getElementById('saveBtn');
let currentPostIndex = null;

// --- 選單控制邏輯 ---
fabToggle.onclick = (e) => {
    e.stopPropagation();
    const isActive = fabWrapper.classList.toggle('active');
    fabOverlay.classList.toggle('active', isActive);
};

fabOverlay.onclick = () => {
    fabWrapper.classList.remove('active');
    fabOverlay.classList.remove('active');
};

// --- 彈窗關閉邏輯 ---
closeModal.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    postModal.classList.remove('show');
};

postModal.onclick = (e) => {
    if (e.target === postModal) postModal.classList.remove('show');
};

// 3. 渲染標記
function renderMarkers() {
    postsData.forEach((post, index) => {
        const el = document.createElement('div');
        el.className = 'map-marker';

        new mapboxgl.Marker(el)
            .setLngLat(post.coords)
            .addTo(map);

        el.addEventListener('click', (e) => {
            e.stopPropagation();
            updateModal(index);
            postModal.classList.add('show');
        });
    });
}

// 地圖載入後：拉資料 + 顯示使用者位置
map.on('load', () => {
    loadPosts();
    showUserLocation();
});

// 顯示使用者目前位置（藍色脈衝點）
function showUserLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
        (pos) => {
            const { latitude: lat, longitude: lng } = pos.coords;

            // 藍色定位點
            const dot = document.createElement('div');
            dot.className = 'user-location-dot';
            dot.innerHTML = '<div class="pulse"></div>';
            new mapboxgl.Marker(dot)
                .setLngLat([lng, lat])
                .addTo(map);

            // 移動地圖中心到使用者位置
            map.flyTo({ center: [lng, lat], zoom: 15, duration: 1500 });
        },
        () => { /* 定位失敗就不處理 */ },
        { enableHighAccuracy: true, timeout: 8000 }
    );
}

// 4. 更新彈窗內容
function updateModal(index) {
    currentPostIndex = index;
    const data = postsData[index];

    document.getElementById('modalImage').src = data.img;
    document.getElementById('modalText').innerText = data.text;
    document.querySelector('.post-date').innerText = data.date;

    likeBtn.querySelector('.count').innerText = data.likes;
    saveBtn.querySelector('.count').innerText = data.saves;

    const likeIcon = likeBtn.querySelector('i');
    if (data.isLiked) {
        likeBtn.classList.add('active', 'like-active');
        likeIcon.classList.replace('fa-regular', 'fa-solid');
    } else {
        likeBtn.classList.remove('active', 'like-active');
        likeIcon.classList.replace('fa-solid', 'fa-regular');
    }

    const saveIcon = saveBtn.querySelector('i');
    if (data.isSaved) {
        saveBtn.classList.add('active', 'save-active');
        saveIcon.classList.replace('fa-regular', 'fa-solid');
    } else {
        saveBtn.classList.remove('active', 'save-active');
        saveIcon.classList.replace('fa-solid', 'fa-regular');
    }
}

// 5. 按鈕點擊 — 更新本地 + 同步 API

likeBtn.onclick = function (e) {
    e.stopPropagation();
    if (currentPostIndex === null) return;
    const data = postsData[currentPostIndex];

    data.isLiked = !data.isLiked;
    data.likes += data.isLiked ? 1 : -1;
    updateModal(currentPostIndex);

    // 同步到後端
    fetchAPI(`/api/posts/${data.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ action: 'like' }),
    }).catch(err => console.error('Like sync failed:', err));
};

saveBtn.onclick = function (e) {
    e.stopPropagation();
    if (currentPostIndex === null) return;
    const data = postsData[currentPostIndex];

    data.isSaved = !data.isSaved;
    data.saves += data.isSaved ? 1 : -1;
    updateModal(currentPostIndex);

    // 同步到後端
    fetchAPI(`/api/posts/${data.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ action: 'save' }),
    }).catch(err => console.error('Save sync failed:', err));
};

// 點擊地圖空白處重置標記點大小
document.addEventListener('click', (e) => {
    if (!e.target.classList.contains('map-marker')) {
        document.querySelectorAll('.map-marker').forEach(m => m.classList.remove('enlarge'));
    }
});

// 新增 DOM 元素獲取
const fullView = document.getElementById('fullView');
const closeFullView = document.getElementById('closeFullView');

// --- A. 監聽拍立得卡片點擊 ---
// 修改原有的渲染邏輯，讓卡片被點擊時開啟 Full View
document.querySelector('.polaroid-card').addEventListener('click', (e) => {
    // 排除掉點擊關閉按鈕或反應按鈕的狀況
    if (e.target.closest('.close-modal') || e.target.closest('.action-item')) return;
    openFullView();
});

// --- B. 開啟詳情層與抓取資料 ---
async function openFullView() {
    const post = postsData[currentPostIndex];
    if (!post) return;

    // 1. 先填入基礎資訊
    document.getElementById('fullViewImage').src = post.img;
    document.getElementById('fullViewText').innerText = post.text;
    document.getElementById('fullViewDate').innerText = post.date;

    // 2. 顯示層級
    fullView.classList.add('active');

    // 3. 從 API 抓取完整的 Reactions 統計 (對應 [id]/route.ts 的 GET)
    try {
        const detail = await fetchAPI(`/api/posts/${post.id}`);
        renderReactionStats(detail.reactions);
    } catch (err) {
        console.error("無法載入反應統計", err);
    }
}

// --- C. 動態渲染 5 種反應按鈕 ---
function renderReactionStats(counts) {
    // 反應類型與 Emoji 對照 (與 type.ts 同步)
    const emojiMap = {
        hilarious: "😂",
        wtf: "🤯",
        nice: "👍",
        doubt: "🤔",
        boring: "👎"
    };

    const container = document.getElementById('reactionStats');
    container.innerHTML = Object.keys(emojiMap).map(type => `
        <button class="reaction-btn-pill" onclick="handleReactionClick('${type}')">
            <span style="font-size: 1.4rem;">${emojiMap[type]}</span>
            <span>${counts[type] || 0}</span>
        </button>
    `).join('');
}

// --- D. 處理反應點擊 (預留給未來 PATCH /api/posts/[id]/reactions) ---
function handleReactionClick(type) {
    console.log("用戶點擊了反應:", type);
    // 這裡可以呼叫 API 同步反應
}

closeFullView.onclick = () => fullView.classList.remove('active');

// 點擊地圖標記時，確保標記會放大並更新 Modal (原本的邏輯)
