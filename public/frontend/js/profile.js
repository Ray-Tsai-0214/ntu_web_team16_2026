document.addEventListener('DOMContentLoaded', async () => {

  // ── 從 API 載入使用者資料 ──
  try {
    const { user, posts } = await fetchAPI(`/api/users/${CURRENT_USER_ID}`);

    // 更新 profile header
    document.querySelector('.pet-avatar').textContent = user.avatarEmoji;
    document.querySelector('.username').textContent = user.displayName;
    document.querySelector('.user-id').textContent = `ID: ${user.id}`;
    document.querySelector('.level-badge').innerHTML =
      `<i class="fa-solid fa-star"></i> Lv.${user.level}`;

    // 更新 stats 數字
    const statValues = document.querySelectorAll('.stat-value');
    const targets = [user.totalPoints, user.postCount, user.reactionCount];
    statValues.forEach((stat, i) => {
      stat.textContent = targets[i];
    });

    // 動態渲染貼文列表
    if (posts.length > 0) {
      const postFeed = document.querySelector('.post-feed');
      postFeed.innerHTML = ''; // 清除靜態 placeholder

      posts.forEach(post => {
        const article = document.createElement('article');
        article.className = 'post-card';
        article.innerHTML = `
          <div class="post-header">
            <div class="author-avatar">${user.avatarEmoji}</div>
            <div class="author-info">
              <span class="author-name">${user.displayName} <span class="author-level">Lv.${user.level}</span></span>
              <span class="post-time">${post.date}</span>
            </div>
          </div>
          <p class="post-content">${post.text}</p>
          <div class="post-tags">
            ${post.tags.map(t => `<span class="tag">#${t}</span>`).join('')}
          </div>
          <div class="post-reactions">
            <button class="reaction-btn">😂 <span>${post.likes}</span></button>
            <button class="reaction-btn">🤯 <span>0</span></button>
            <button class="reaction-btn">👍 <span>0</span></button>
            <button class="reaction-btn">🤔 <span>0</span></button>
            <button class="reaction-btn">👎 <span>0</span></button>
          </div>
        `;
        postFeed.appendChild(article);
      });
    }
  } catch (err) {
    console.error('Failed to load profile from API:', err);
  }

  // ── 1. Number Counter Animation ──
  const statValues = document.querySelectorAll('.stat-value');
  statValues.forEach(stat => {
    const target = parseInt(stat.textContent, 10);
    let current = 0;
    const increment = Math.ceil(target / 40);
    stat.textContent = '0';

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        stat.textContent = target;
        clearInterval(timer);
      } else {
        stat.textContent = current;
      }
    }, 25);
  });

  // ── 2. Tab Switching Logic ──
  const tabBtns = document.querySelectorAll('.tab-btn');
  const postFeed = document.querySelector('.post-feed');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('active')) return;
      tabBtns.forEach(t => t.classList.remove('active'));
      btn.classList.add('active');

      postFeed.style.transition = 'opacity 0.2s ease';
      postFeed.style.opacity = '0.3';
      setTimeout(() => { postFeed.style.opacity = '1'; }, 250);
    });
  });

  // ── 3. Reaction Button Toggling（使用 event delegation 支援動態元素） ──
  document.querySelector('.post-feed').addEventListener('click', function(e) {
    const btn = e.target.closest('.reaction-btn');
    if (!btn) return;

    const counterSpan = btn.querySelector('span');
    let currentCount = parseInt(counterSpan.textContent, 10);

    if (btn.classList.contains('active')) {
      btn.classList.remove('active');
      counterSpan.textContent = currentCount - 1;
    } else {
      btn.classList.add('active');
      counterSpan.textContent = currentCount + 1;
    }

    btn.style.transform = 'scale(1.1)';
    setTimeout(() => { btn.style.transform = 'scale(1)'; }, 150);
  });

  // ── 4. Pet Avatar Easter Egg ──
  const petAvatar = document.querySelector('.pet-avatar-container');
  petAvatar.style.transition = 'transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
  petAvatar.style.cursor = 'pointer';

  petAvatar.addEventListener('click', () => {
    petAvatar.style.transform = 'scale(0.9) translateY(5px)';
    setTimeout(() => {
      petAvatar.style.transform = 'scale(1.05) translateY(-5px)';
      setTimeout(() => {
        petAvatar.style.transform = 'scale(1) translateY(0)';
      }, 150);
    }, 100);
  });

});
