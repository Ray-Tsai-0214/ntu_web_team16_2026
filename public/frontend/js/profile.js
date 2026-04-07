document.addEventListener('DOMContentLoaded', async () => {

  // ── 0. require login ──
  const me = await requireAuth();

  // ── 1. fetch full profile + this user's posts ──
  let posts = [];
  try {
    const data = await fetchAPI(`/api/users/${me.id}`);
    posts = data.posts || [];
  } catch (err) {
    console.error('Failed to load posts from API:', err);
  }

  // ── 2. render profile header ──
  document.querySelector('.pet-avatar').textContent = me.avatarEmoji;
  document.querySelector('.username').textContent = me.displayName;
  document.querySelector('.user-id').textContent = `@${me.username}`;
  document.querySelector('.level-badge').innerHTML =
    `<i class="fa-solid fa-star"></i> Lv.${me.level}`;

  // ── 3. render stats (count-up animation runs in step 5) ──
  const statValues = document.querySelectorAll('.stat-value');
  const targets = [me.totalPoints, me.postCount, me.reactionCount];
  statValues.forEach((stat, i) => {
    stat.dataset.target = targets[i];
    stat.textContent = '0';
  });

  // ── 4. render post feed ──
  const postFeed = document.querySelector('.post-feed');
  if (posts.length > 0) {
    postFeed.innerHTML = '';
    posts.forEach((post) => {
      const article = document.createElement('article');
      article.className = 'post-card';
      article.innerHTML = `
        <div class="post-header">
          <div class="author-avatar">${me.avatarEmoji}</div>
          <div class="author-info">
            <span class="author-name">${me.displayName} <span class="author-level">Lv.${me.level}</span></span>
            <span class="post-time">${post.date}</span>
          </div>
        </div>
        <p class="post-content">${escapeHtml(post.text)}</p>
        <div class="post-tags">
          ${post.tags.map((t) => `<span class="tag">#${escapeHtml(t)}</span>`).join('')}
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
  } else {
    postFeed.innerHTML = `
      <div class="empty-feed">
        <p>You haven't posted anything yet.</p>
        <p style="font-size: 0.85rem; margin-top: 8px; opacity: 0.7;">
          Tap the + button on the map to share something weird.
        </p>
      </div>
    `;
  }

  // ── 5. count-up animation ──
  document.querySelectorAll('.stat-value').forEach((stat) => {
    const target = parseInt(stat.dataset.target || '0', 10);
    if (target === 0) {
      stat.textContent = '0';
      return;
    }
    let current = 0;
    const increment = Math.max(1, Math.ceil(target / 40));
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

  // ── 6. tab switching ──
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('active')) return;
      tabBtns.forEach((t) => t.classList.remove('active'));
      btn.classList.add('active');
      postFeed.style.transition = 'opacity 0.2s ease';
      postFeed.style.opacity = '0.3';
      setTimeout(() => { postFeed.style.opacity = '1'; }, 250);
    });
  });

  // ── 7. reaction button toggle (event delegation) ──
  postFeed.addEventListener('click', function (e) {
    const btn = e.target.closest('.reaction-btn');
    if (!btn) return;
    const counterSpan = btn.querySelector('span');
    const currentCount = parseInt(counterSpan.textContent, 10);
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

  // ── 8. avatar easter egg ──
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

  // ── 9. logout button ──
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('Log out of OMG?')) logout();
    });
  }
});

function escapeHtml(s) {
  if (typeof s !== 'string') return '';
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
