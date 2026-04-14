// // ── 遊戲狀態 ──
// const state = {
//   gems: 1000,
//   exp: 0,
//   expMax: 100,
//   hunger: 0,
//   hungerMax: 100,
// };

// // 食物資料：expGain, hungerGain, gemCost
// const foodData = {
//   '比目魚':   { exp: 12, hunger: 18, cost: 20, emoji: '🐟' },
//   '鮭魚':     { exp: 15, hunger: 22, cost: 25, emoji: '🐠' },
//   '貓貓鹽':   { exp: 5,  hunger: 8,  cost: 10, emoji: '🧂' },
//   '檸檬果':   { exp: 8,  hunger: 10, cost: 15, emoji: '🍋' },
//   '滋味肉':   { exp: 20, hunger: 30, cost: 40, emoji: '🥩' },
//   '超雞棒':   { exp: 18, hunger: 28, cost: 35, emoji: '🍗' },
//   '爆爆蝦':   { exp: 22, hunger: 25, cost: 45, emoji: '🍤' },
//   '蘋果':     { exp: 6,  hunger: 12, cost: 12, emoji: '🍏' },
// };

// // ── 寵物圖層資料 ──
// // 每個 pet entry：body（必填）、face（必填）、deco（可空字串）
// const petAssets = {
//   'default': {
//     body: 'assets/pet/body_0.png',
//     face: 'assets/pet/face_0.png',
//     deco: '',                          // 無飾品
//   },
//   'cat1': {
//     body: 'assets/pet/body_1.png',
//     face: 'assets/pet/face_1.png',
//     deco: 'assets/pet/deco_1.png',
//   },
//   'cat2': {
//     body: 'assets/pet/body_2.png',
//     face: 'assets/pet/face_0.png',
//     deco: 'assets/pet/deco_2.png',
//   },
//   // 之後新增：複製一個 block，改 key 跟路徑就好
// };

// // ── 初始化 UI ──
// function initUI() {
//   updateStats();
//   setPetLayers(equippedLayers); 
// }

// function updateStats() {
//   // 寶石
//   document.getElementById('gemValue').textContent = state.gems;

//   // 經驗值
//   const expPct = Math.min(100, (state.exp / state.expMax) * 100);
//   document.getElementById('barExp').style.width = expPct + '%';
//   document.getElementById('expText').textContent = state.exp + ' / ' + state.expMax;

//   // 飢餓度
//   const hungerPct = Math.min(100, (state.hunger / state.hungerMax) * 100);
//   document.getElementById('barHunger').style.width = hungerPct + '%';
//   document.getElementById('hungerText').textContent = state.hunger + ' / ' + state.hungerMax;
// }

// // ── 寵物點擊 ──
// function petTap() {
//   const pop = document.getElementById('heartPop');
//   pop.classList.remove('active');
//   void pop.offsetWidth;
//   pop.classList.add('active');
//   setTimeout(() => pop.classList.remove('active'), 900);

//   showPetSpeech();
// }

// // ── Modal ──
// function openWardrobe() {
//   document.getElementById('wardrobeModal').classList.add('active');
// }
// function openFood() {
//   document.getElementById('foodModal').classList.add('active');
// }
// function closeModal(id) {
//   const el = document.getElementById(id);
//   el.classList.add('closing');
//   setTimeout(() => { el.classList.remove('active', 'closing'); }, 260);
// }

// // 點擊 overlay 背景關閉
// document.querySelectorAll('.modalOverlay').forEach(el => {
//   el.addEventListener('click', function(e) {
//     if (e.target === this) closeModal(this.id);
//   });
// });

// // ── 使用飾品 ──
// // function useWardrobeItem(card) {
// //   card.classList.add('itemUsed');
// //   setTimeout(() => card.classList.remove('itemUsed'), 380);
// // }
// // ── 目前穿著狀態（各層獨立） ──
// const equippedLayers = {
//   body: 'assets/pet/body_0.png',
//   face: 'assets/pet/face_0.png',
//   deco: '',
// };

// function setPetLayers({ body, face, deco } = equippedLayers) {
//   document.getElementById('layerBody').src = body ?? equippedLayers.body;
//   document.getElementById('layerFace').src = face ?? equippedLayers.face;
//   document.getElementById('layerDeco').src = deco ?? '';
// }

// // layer: 'body' | 'face' | 'deco'
// // key: 'body_0' | 'face_1' | 'deco_2' | '' (deco 無)
// function useWardrobeItem(card, layer, key) {
//   const path = key ? `assets/pet/${key}.png` : '';
//   equippedLayers[layer] = path;
//   setPetLayers(equippedLayers);

//   // 同 panel 內取消其他選中
//   const panel = document.getElementById(`wardrobePanel-${layer}`);
//   panel.querySelectorAll('.itemCard.itemSelected').forEach(c => c.classList.remove('itemSelected'));
//   card.classList.add('itemSelected');

//   // 點擊動畫
//   card.classList.add('itemUsed');
//   setTimeout(() => card.classList.remove('itemUsed'), 380);
// }

// function switchWardrobeTab(tab, btn) {
//   // 切換 tab 樣式
//   document.querySelectorAll('.modalTab').forEach(t => t.classList.remove('tabActive'));
//   btn.classList.add('tabActive');

//   // 切換 panel
//   document.querySelectorAll('.wardrobePanel').forEach(p => p.classList.remove('panelActive'));
//   document.getElementById(`wardrobePanel-${tab}`).classList.add('panelActive');
// }

// // ── 餵食 ──
// function feedPet(itemName) {
//   const data = foodData[itemName];
//   if (!data) return;

//   if (state.gems < data.cost) {
//     showToast('💎 寶石不足！');
//     return;
//   }

//   // 扣寶石
//   state.gems -= data.cost;

//   // 增加經驗（不超過上限，滿了就升級）
//   state.exp += data.exp;
//   if (state.exp >= state.expMax) {
//     state.exp = state.exp - state.expMax; // 進位剩餘
//     state.expMax = Math.round(state.expMax * 1.2); // 下一等級需求提升
//     showToast('⭐ 升級了！');
//   }

//   // 增加飢餓度（不超過上限）
//   state.hunger = Math.min(state.hungerMax, state.hunger + data.hunger);

//   updateStats();
//   showFeedEffect(data.emoji, data.exp, data.hunger, data.cost);
//   petTap();
// }

// // ── Toast 提示 ──
// function showToast(msg) {
//   let toast = document.getElementById('gameToast');
//   if (!toast) {
//     toast = document.createElement('div');
//     toast.id = 'gameToast';
//     toast.className = 'gameToast';
//     document.querySelector('.phoneShell').appendChild(toast);
//   }
//   toast.textContent = msg;
//   toast.classList.remove('toastActive');
//   void toast.offsetWidth;
//   toast.classList.add('toastActive');
//   setTimeout(() => toast.classList.remove('toastActive'), 1800);
// }

// // ── 餵食動畫效果 ──
// function showFeedEffect(emoji, expGain, hungerGain, cost) {
//   const shell = document.querySelector('.phoneShell');

//   const el = document.createElement('div');
//   el.className = 'feedEffect';
//   el.innerHTML = `
//     <span class="feedEmoji">${emoji}</span>
//     <span class="feedGain">+${expGain} ⭐  +${hungerGain} 🍖  −${cost} 💎</span>
//   `;
//   shell.appendChild(el);
//   setTimeout(() => el.remove(), 1200);
// }

// // ── 說話功能效果 ──
// const petLines = [
//   '今天也要陪我玩嗎？',
//   '摸摸我嘛～',
//   '我肚子有點餓了！',
//   '你來啦！',
//   '今天的我也很可愛吧？',
//   '哇～好開心！',
//   '別走，再陪我一下。',
//   '我最喜歡你了！'
// ];

// let speechTimer = null;

// function showPetSpeech() {
//   const speech = document.getElementById('petSpeech');
//   if (!speech) return;

//   let lines = [];

//   if (state.hunger < 30) {
//     lines = [
//       '嗷……餓得沒力氣了。',
//       '想吃小魚乾。',
//       '肚子空空的耶。'
//     ];
//   } else if (state.hunger < 80) {
//     lines = [
//       '今天心情不錯喵！',
//       '陪我玩一下嘛～',
//       '摸摸我，我會很乖。'
//     ];
//   } else {
//     lines = [
//       '吃得好飽呀～',
//       '我現在超滿足！',
//       '嘿嘿，今天真幸福。'
//     ];
//   }

//   const randomLine = lines[Math.floor(Math.random() * lines.length)];
//   speech.textContent = randomLine;

//   speech.classList.remove('active');
//   void speech.offsetWidth;
//   speech.classList.add('active');

//   clearTimeout(speechTimer);
//   speechTimer = setTimeout(() => {
//     speech.classList.remove('active');
//   }, 1800);
// }



// // // 目前使用的寵物
// // let currentPet = 'default';

// // function setPetLayers(petKey) {
// //   const pet = petAssets[petKey];
// //   if (!pet) return;
// //   currentPet = petKey;
// //   document.getElementById('layerBody').src = pet.body;
// //   document.getElementById('layerFace').src = pet.face;
// //   document.getElementById('layerDeco').src = pet.deco ?? '';
// // }

// // ── DOMContentLoaded ──
// document.addEventListener('DOMContentLoaded', initUI);
// ── API helpers (來自 api.js，這裡假設已載入) ──
// fetchAPI, getCurrentUser, requireAuth 都在 api.js 裡

// ── 遊戲狀態（從 Supabase 同步過來後覆蓋） ──
const state = {
  petId: null,
  coins: 0,          // ← 原本的 gems，改從 Supabase pet.coins 讀取
  exp: 0,
  expMax: 100,
  hunger: 0,
  hungerMax: 100,
  health: 100,       // ← 新增，Supabase pet.health
  mood: 100,         // ← 新增，Supabase pet.mood
  petName: '',       // ← 新增，Supabase pet.name
};

// 食物資料：expGain, hungerGain, coinCost
const foodData = {
  '比目魚': { exp: 12, hunger: 18, cost: 20, emoji: '🐟' },
  '鮭魚':   { exp: 15, hunger: 22, cost: 25, emoji: '🐠' },
  '貓貓鹽': { exp: 5,  hunger: 8,  cost: 10, emoji: '🧂' },
  '檸檬果': { exp: 8,  hunger: 10, cost: 15, emoji: '🍋' },
  '滋味肉': { exp: 20, hunger: 30, cost: 40, emoji: '🥩' },
  '超雞棒': { exp: 18, hunger: 28, cost: 35, emoji: '🍗' },
  '爆爆蝦': { exp: 22, hunger: 25, cost: 45, emoji: '🍤' },
  '蘋果':   { exp: 6,  hunger: 12, cost: 12, emoji: '🍏' },
};

// ── 寵物圖層資料 ──
const petAssets = {
  'default': { body: 'assets/pet/body_0.png', face: 'assets/pet/face_0.png', deco: '' },
  'cat1':    { body: 'assets/pet/body_1.png', face: 'assets/pet/face_1.png', deco: 'assets/pet/deco_1.png' },
  'cat2':    { body: 'assets/pet/body_2.png', face: 'assets/pet/face_0.png', deco: 'assets/pet/deco_2.png' },
};

const equippedLayers = {
  body: 'assets/pet/body_0.png',
  face: 'assets/pet/face_0.png',
  deco: '',
};

// ── Supabase sync helpers ──

// 取得目前使用者的寵物
// ⚠️ 請確認夥伴的路徑，可能是 /api/pets/me 或 /api/pets?userId=me
async function fetchMyPet() {
  try {
    return await fetchAPI('/api/pets/me');
  } catch {
    return null;
  }
}

// 建立新寵物（onboarding 用）
async function createPet(name) {
  return await fetchAPI('/api/pets', {
    method: 'POST',
    body: JSON.stringify({ name, species: 'cat', stage: 'egg' }),
  });
}

// 更新寵物欄位
async function patchPet(petId, fields) {
  try {
    return await fetchAPI(`/api/pets/${petId}`, {
      method: 'PATCH',
      body: JSON.stringify(fields),
    });
  } catch (e) {
    console.error('patchPet failed:', e);
    return null;
  }
}

// ── 時間差衰減計算 ──
// health 跟 mood 每小時各 -10，下限 0
function applyDecay(pet) {
  const updatedAt = new Date(pet.updatedAt).getTime();
  const now = Date.now();
  const hoursElapsed = (now - updatedAt) / (1000 * 60 * 60);
  const decay = Math.floor(hoursElapsed * 10);

  if (decay <= 0) return { health: pet.health, mood: pet.mood };

  return {
    health: Math.max(0, pet.health - decay),
    mood:   Math.max(0, pet.mood   - decay),
  };
}

// ── 初始化主流程 ──
async function initApp() {
  // 1. 確認登入（未登入會自動跳轉 login.html）
  await requireAuth();

  // 2. 查有沒有寵物
  const pet = await fetchMyPet();

  if (!pet) {
    // 沒有寵物 → 跳出命名 onboarding
    showOnboardingModal();
    return;
  }

  // 3. 有寵物 → 計算衰減
  const decayed = applyDecay(pet);
  const needPatch = decayed.health !== pet.health || decayed.mood !== pet.mood;

  // 4. 把資料同步進 state
  state.petId   = pet.petId;
  state.petName = pet.name;
  state.coins   = pet.coins;
  state.exp     = pet.exp;
  state.expMax  = 100; // 或依 level 計算
  state.hunger  = pet.hunger;
  state.health  = decayed.health;
  state.mood    = decayed.mood;

  // 5. 衰減有變化 → patch 回 Supabase
  if (needPatch) {
    await patchPet(pet.petId, {
      health: decayed.health,
      mood:   decayed.mood,
    });
  }

  // 6. 顯示主畫面
  setPetLayers(equippedLayers);
  renderPetName();
  updateStats();
}

// ── Onboarding Modal（第一次建立寵物用） ──
function showOnboardingModal() {
  // 動態建立，或者在 HTML 裡已有 #onboardingModal
  let modal = document.getElementById('onboardingModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'onboardingModal';
    modal.className = 'modalOverlay active';
    modal.innerHTML = `
      <div class="modalBox" style="max-width:320px;margin:auto;padding:32px 24px;text-align:center;">
        <div style="font-size:48px;margin-bottom:12px;">🐾</div>
        <h2 style="margin:0 0 8px;font-size:18px;">給你的夥伴取個名字吧！</h2>
        <p style="color:var(--color-text-secondary,#888);font-size:13px;margin:0 0 20px;">之後也可以在主畫面修改</p>
        <input
          id="onboardingNameInput"
          type="text"
          maxlength="12"
          placeholder="輸入名字…"
          style="width:100%;box-sizing:border-box;padding:10px 14px;border:1.5px solid var(--color-border-secondary,#ddd);border-radius:8px;font-size:15px;outline:none;margin-bottom:16px;"
        />
        <button
          id="onboardingConfirmBtn"
          style="width:100%;padding:12px;background:#b29586;color:#fff;border:none;border-radius:8px;font-size:15px;cursor:pointer;"
        >開始冒險 ✨</button>
        <p id="onboardingError" style="color:#c0392b;font-size:12px;margin:8px 0 0;display:none;">請輸入名字！</p>
      </div>
    `;
    document.querySelector('.phoneShell').appendChild(modal);
  }

  modal.classList.add('active');

  document.getElementById('onboardingConfirmBtn').onclick = async () => {
    const nameInput = document.getElementById('onboardingNameInput');
    const name = nameInput.value.trim();
    if (!name) {
      document.getElementById('onboardingError').style.display = 'block';
      return;
    }

    const btn = document.getElementById('onboardingConfirmBtn');
    btn.disabled = true;
    btn.textContent = '建立中…';

    try {
      const newPet = await createPet(name);
      state.petId   = newPet.petId;
      state.petName = newPet.name;
      state.coins   = newPet.coins ?? 0;
      state.exp     = newPet.exp ?? 0;
      state.hunger  = newPet.hunger ?? 100;
      state.health  = newPet.health ?? 100;
      state.mood    = newPet.mood ?? 100;

      modal.classList.remove('active');
      setPetLayers(equippedLayers);
      renderPetName();
      updateStats();
    } catch (e) {
      btn.disabled = false;
      btn.textContent = '開始冒險 ✨';
      showToast('建立失敗，請再試一次 😢');
    }
  };
}

// ── 名字顯示 + Inline 編輯 ──
function renderPetName() {
  let nameEl = document.getElementById('petNameDisplay');
  if (!nameEl) return;

  nameEl.textContent = state.petName || '未命名';
  nameEl.title = '點擊修改名字';
  nameEl.style.cursor = 'pointer';
}

// 在 HTML 裡，名字元素要有 id="petNameDisplay"
// 這裡統一掛 click 事件
document.addEventListener('DOMContentLoaded', () => {
  const nameEl = document.getElementById('petNameDisplay');
  if (nameEl) {
    nameEl.addEventListener('click', () => startInlineNameEdit(nameEl));
  }
});

function startInlineNameEdit(nameEl) {
  const currentName = state.petName;

  const input = document.createElement('input');
  input.type = 'text';
  input.value = currentName;
  input.maxLength = 12;
  input.style.cssText = `
    font-size: inherit;
    border: none;
    border-bottom: 1.5px solid #b29586;
    background: transparent;
    outline: none;
    text-align: center;
    width: 100px;
  `;

  nameEl.replaceWith(input);
  input.focus();
  input.select();

  async function commitNameEdit() {
    const newName = input.value.trim() || currentName;

    // 還原 span
    const span = document.createElement('span');
    span.id = 'petNameDisplay';
    span.textContent = newName;
    span.title = '點擊修改名字';
    span.style.cursor = 'pointer';
    span.addEventListener('click', () => startInlineNameEdit(span));
    input.replaceWith(span);

    if (newName !== currentName && state.petId) {
      state.petName = newName;
      try {
        await patchPet(state.petId, { name: newName });
        showToast('✏️ 名字已更新！');
      } catch {
        showToast('更新失敗 😢');
      }
    }
  }

  input.addEventListener('blur', commitNameEdit);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') input.blur();
    if (e.key === 'Escape') {
      input.value = currentName;
      input.blur();
    }
  });
}

// ── 更新 UI ──
function updateStats() {
  // coins（原本的 gems）
  const gemEl = document.getElementById('gemValue');
  if (gemEl) gemEl.textContent = state.coins;

  // 經驗值
  const expPct = Math.min(100, (state.exp / state.expMax) * 100);
  const barExp = document.getElementById('barExp');
  if (barExp) barExp.style.width = expPct + '%';
  const expText = document.getElementById('expText');
  if (expText) expText.textContent = state.exp + ' / ' + state.expMax;

  // 飢餓度
  const hungerPct = Math.min(100, (state.hunger / state.hungerMax) * 100);
  const barHunger = document.getElementById('barHunger');
  if (barHunger) barHunger.style.width = hungerPct + '%';
  const hungerText = document.getElementById('hungerText');
  if (hungerText) hungerText.textContent = state.hunger + ' / ' + state.hungerMax;

  // health（如果 HTML 有 bar 的話）
  const barHealth = document.getElementById('barHealth');
  if (barHealth) barHealth.style.width = state.health + '%';
  const healthText = document.getElementById('healthText');
  if (healthText) healthText.textContent = state.health + ' / 100';

  // mood（如果 HTML 有 bar 的話）
  const barMood = document.getElementById('barMood');
  if (barMood) barMood.style.width = state.mood + '%';
  const moodText = document.getElementById('moodText');
  if (moodText) moodText.textContent = state.mood + ' / 100';
}

// ── 餵食（coins 取代 gems） ──
function feedPet(itemName) {
  const data = foodData[itemName];
  if (!data) return;

  if (state.coins < data.cost) {
    showToast('💎 金幣不足！');
    return;
  }

  state.coins -= data.cost;
  state.exp += data.exp;

  if (state.exp >= state.expMax) {
    state.exp = state.exp - state.expMax;
    state.expMax = Math.round(state.expMax * 1.2);
    showToast('⭐ 升級了！');
  }

  state.hunger = Math.min(state.hungerMax, state.hunger + data.hunger);

  updateStats();
  showFeedEffect(data.emoji, data.exp, data.hunger, data.cost);
  petTap();

  // 非同步 patch 回 Supabase（不 await，不阻塞 UI）
  if (state.petId) {
    patchPet(state.petId, {
      coins:  state.coins,
      exp:    state.exp,
      hunger: state.hunger,
    }).catch(() => showToast('同步失敗，請確認網路'));
  }
}

// ── 寵物點擊 ──
function petTap() {
  const pop = document.getElementById('heartPop');
  pop.classList.remove('active');
  void pop.offsetWidth;
  pop.classList.add('active');
  state.coins += 20;
  setTimeout(() => pop.classList.remove('active'), 900);
  showPetSpeech();
}

// ── Modal ──
function openWardrobe() {
  document.getElementById('wardrobeModal').classList.add('active');
}
function openFood() {
  document.getElementById('foodModal').classList.add('active');
}
function closeModal(id) {
  const el = document.getElementById(id);
  el.classList.add('closing');
  setTimeout(() => { el.classList.remove('active', 'closing'); }, 260);
}

document.querySelectorAll('.modalOverlay').forEach(el => {
  el.addEventListener('click', function(e) {
    if (e.target === this) closeModal(this.id);
  });
});

// ── 寵物圖層 ──
function setPetLayers({ body, face, deco } = equippedLayers) {
  document.getElementById('layerBody').src = body ?? equippedLayers.body;
  document.getElementById('layerFace').src = face ?? equippedLayers.face;
  const decoEl = document.getElementById('layerDeco');
  if (decoEl) decoEl.src = deco ?? '';
}

function useWardrobeItem(card, layer, key) {
  const path = key ? `assets/pet/${key}.png` : '';
  equippedLayers[layer] = path;
  setPetLayers(equippedLayers);

  const panel = document.getElementById(`wardrobePanel-${layer}`);
  panel.querySelectorAll('.itemCard.itemSelected').forEach(c => c.classList.remove('itemSelected'));
  card.classList.add('itemSelected');
  card.classList.add('itemUsed');
  setTimeout(() => card.classList.remove('itemUsed'), 380);

  // 同步 outfit/accessory 到 Supabase
  if (state.petId) {
    patchPet(state.petId, { outfit: key }).catch(() => {});
  }
}

function switchWardrobeTab(tab, btn) {
  document.querySelectorAll('.modalTab').forEach(t => t.classList.remove('tabActive'));
  btn.classList.add('tabActive');
  document.querySelectorAll('.wardrobePanel').forEach(p => p.classList.remove('panelActive'));
  document.getElementById(`wardrobePanel-${tab}`).classList.add('panelActive');
}

// ── Toast ──
function showToast(msg) {
  let toast = document.getElementById('gameToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'gameToast';
    toast.className = 'gameToast';
    document.querySelector('.phoneShell').appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.remove('toastActive');
  void toast.offsetWidth;
  toast.classList.add('toastActive');
  setTimeout(() => toast.classList.remove('toastActive'), 1800);
}

// ── 餵食動畫 ──
function showFeedEffect(emoji, expGain, hungerGain, cost) {
  const shell = document.querySelector('.phoneShell');
  const el = document.createElement('div');
  el.className = 'feedEffect';
  el.innerHTML = `
    <span class="feedEmoji">${emoji}</span>
    <span class="feedGain">+${expGain} ⭐  +${hungerGain} 🍖  −${cost} 💎</span>
  `;
  shell.appendChild(el);
  setTimeout(() => el.remove(), 1200);
}

// ── 說話功能 ──
const petLines = ['今天也要陪我玩嗎？', '摸摸我嘛～', '我肚子有點餓了！', '你來啦！', '今天的我也很可愛吧？'];
let speechTimer = null;

function showPetSpeech() {
  const speech = document.getElementById('petSpeech');
  if (!speech) return;

  let lines = state.hunger < 30
    ? ['嗷……餓得沒力氣了。', '想吃小魚乾。', '肚子空空的耶。']
    : state.hunger < 80
    ? ['今天心情不錯喵！', '陪我玩一下嘛～', '摸摸我，我會很乖。']
    : ['吃得好飽呀～', '我現在超滿足！', '嘿嘿，今天真幸福。'];

  // 加入 health/mood 狀態台詞
  if (state.health < 30) lines = ['身體不太舒服…', '好累，能幫我嗎？'];
  if (state.mood < 30)   lines = ['有點寂寞…', '陪我說說話嘛。'];

  const randomLine = lines[Math.floor(Math.random() * lines.length)];
  speech.textContent = randomLine;
  speech.classList.remove('active');
  void speech.offsetWidth;
  speech.classList.add('active');

  clearTimeout(speechTimer);
  speechTimer = setTimeout(() => speech.classList.remove('active'), 1800);
}

// ── 入口 ──
document.addEventListener('DOMContentLoaded', initApp);