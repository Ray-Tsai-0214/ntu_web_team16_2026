// 1. 初始化 Mapbox
        mapboxgl.accessToken = 'pk.eyJ1Ijoib3JhbmdlaGVhcnQiLCJhIjoiY21uZWJkZzJqMW93ZDJ3cHJrZTlpNWo3dCJ9.ECWy4Lc3ZCMWlc5qZPFobQ';
        const map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/orangeheart/cmnebww4a002701sg3ebs7gm6',
            center: [121.564, 25.033],
            zoom: 14
        });

        // 2. 資料庫
        let postsData = [
            { id: 1, coords: [121.564, 25.033], img: 'assets/cat.jpg', text: '他不答應跟我交換身體，差評', date: '2023.10.27', likes: 5, saves: 2, isLiked: false, isSaved: false },
            { id: 2, coords: [121.550, 25.040], img: 'assets/map.jpg', text: '是誰在這裡迷路了?是我', date: '2023.10.28', likes: 12, saves: 8, isLiked: false, isSaved: false },
            { id: 3, coords: [121.570, 25.050], img: 'assets/eat.jpg', text: '沒有鳳梨，一點都不道地', date: '2023.10.29', likes: 20, saves: 1, isLiked: false, isSaved: false }
        ];

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

        map.on('load', renderMarkers);

        // 4. 更新彈窗內容
        function updateModal(index) {
            currentPostIndex = index;
            const data = postsData[index];

            document.getElementById('modalImage').src = data.img;
            document.getElementById('modalText').innerText = data.text;
            document.querySelector('.post-date').innerText = data.date;

            // 更新數字顯示
            likeBtn.querySelector('.count').innerText = data.likes;
            saveBtn.querySelector('.count').innerText = data.saves;

            // 同步 愛心 狀態
            const likeIcon = likeBtn.querySelector('i');
            if (data.isLiked) {
                likeBtn.classList.add('active', 'like-active');
                likeIcon.classList.replace('fa-regular', 'fa-solid');
            } else {
                likeBtn.classList.remove('active', 'like-active');
                likeIcon.classList.replace('fa-solid', 'fa-regular');
            }

            // --- 修正點：同步 收藏 狀態 ---
            const saveIcon = saveBtn.querySelector('i');
            if (data.isSaved) {
                saveBtn.classList.add('active', 'save-active');
                saveIcon.classList.replace('fa-regular', 'fa-solid');
            } else {
                saveBtn.classList.remove('active', 'save-active');
                saveIcon.classList.replace('fa-solid', 'fa-regular');
            }
        }

        // 5. 按鈕點擊事件 (更新資料陣列並重繪 UI)

        // 愛心點擊
        likeBtn.onclick = function (e) {
            e.stopPropagation();
            if (currentPostIndex === null) return;
            const data = postsData[currentPostIndex];

            data.isLiked = !data.isLiked;
            data.likes += data.isLiked ? 1 : -1;

            updateModal(currentPostIndex); // 重新刷新介面
        };

        // --- 修正點：收藏點擊 ---
        saveBtn.onclick = function (e) {
            e.stopPropagation();
            if (currentPostIndex === null) return;
            const data = postsData[currentPostIndex];

            data.isSaved = !data.isSaved;
            data.saves += data.isSaved ? 1 : -1;

            updateModal(currentPostIndex); // 重新刷新介面
        };

        // 點擊地圖空白處重置標記點大小
        document.addEventListener('click', (e) => {
            if (!e.target.classList.contains('map-marker')) {
                document.querySelectorAll('.map-marker').forEach(m => m.classList.remove('enlarge'));
            }
        });