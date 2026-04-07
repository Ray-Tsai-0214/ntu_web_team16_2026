// ── 遊戲狀態 ──
const state = {
  gems: 1000,
  exp: 0,
  expMax: 100,
  hunger: 0,
  hungerMax: 100,
};

// 食物資料：expGain, hungerGain, gemCost
const foodData = {
  '比目魚':   { exp: 12, hunger: 18, cost: 20, emoji: '🐟' },
  '鮭魚':     { exp: 15, hunger: 22, cost: 25, emoji: '🐠' },
  '貓貓鹽':   { exp: 5,  hunger: 8,  cost: 10, emoji: '🧂' },
  '檸檬果':   { exp: 8,  hunger: 10, cost: 15, emoji: '🍋' },
  '滋味肉':   { exp: 20, hunger: 30, cost: 40, emoji: '🥩' },
  '超雞棒':   { exp: 18, hunger: 28, cost: 35, emoji: '🍗' },
  '爆爆蝦':   { exp: 22, hunger: 25, cost: 45, emoji: '🍤' },
  '蘋果':     { exp: 6,  hunger: 12, cost: 12, emoji: '🍏' },
};

// ── 寵物圖層資料 ──
// 每個 pet entry：body（必填）、face（必填）、deco（可空字串）
const petAssets = {
  'default': {
    body: 'assets/pet/body_0.png',
    face: 'assets/pet/face_0.png',
    deco: '',                          // 無飾品
  },
  'cat1': {
    body: 'assets/pet/body_1.png',
    face: 'assets/pet/face_1.png',
    deco: 'assets/pet/deco_1.png',
  },
  'cat2': {
    body: 'assets/pet/body_2.png',
    face: 'assets/pet/face_0.png',
    deco: 'assets/pet/deco_2.png',
  },
  // 之後新增：複製一個 block，改 key 跟路徑就好
};

// ── 初始化 UI ──
function initUI() {
  updateStats();
  setPetLayers(equippedLayers); 
}

function updateStats() {
  // 寶石
  document.getElementById('gemValue').textContent = state.gems;

  // 經驗值
  const expPct = Math.min(100, (state.exp / state.expMax) * 100);
  document.getElementById('barExp').style.width = expPct + '%';
  document.getElementById('expText').textContent = state.exp + ' / ' + state.expMax;

  // 飢餓度
  const hungerPct = Math.min(100, (state.hunger / state.hungerMax) * 100);
  document.getElementById('barHunger').style.width = hungerPct + '%';
  document.getElementById('hungerText').textContent = state.hunger + ' / ' + state.hungerMax;
}

// ── 寵物點擊 ──
function petTap() {
  const pop = document.getElementById('heartPop');
  pop.classList.remove('active');
  void pop.offsetWidth;
  pop.classList.add('active');
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

// 點擊 overlay 背景關閉
document.querySelectorAll('.modalOverlay').forEach(el => {
  el.addEventListener('click', function(e) {
    if (e.target === this) closeModal(this.id);
  });
});

// ── 使用飾品 ──
// function useWardrobeItem(card) {
//   card.classList.add('itemUsed');
//   setTimeout(() => card.classList.remove('itemUsed'), 380);
// }
// ── 目前穿著狀態（各層獨立） ──
const equippedLayers = {
  body: 'assets/pet/body_0.png',
  face: 'assets/pet/face_0.png',
  deco: '',
};

function setPetLayers({ body, face, deco } = equippedLayers) {
  document.getElementById('layerBody').src = body ?? equippedLayers.body;
  document.getElementById('layerFace').src = face ?? equippedLayers.face;
  document.getElementById('layerDeco').src = deco ?? '';
}

// layer: 'body' | 'face' | 'deco'
// key: 'body_0' | 'face_1' | 'deco_2' | '' (deco 無)
function useWardrobeItem(card, layer, key) {
  const path = key ? `assets/pet/${key}.png` : '';
  equippedLayers[layer] = path;
  setPetLayers(equippedLayers);

  // 同 panel 內取消其他選中
  const panel = document.getElementById(`wardrobePanel-${layer}`);
  panel.querySelectorAll('.itemCard.itemSelected').forEach(c => c.classList.remove('itemSelected'));
  card.classList.add('itemSelected');

  // 點擊動畫
  card.classList.add('itemUsed');
  setTimeout(() => card.classList.remove('itemUsed'), 380);
}

function switchWardrobeTab(tab, btn) {
  // 切換 tab 樣式
  document.querySelectorAll('.modalTab').forEach(t => t.classList.remove('tabActive'));
  btn.classList.add('tabActive');

  // 切換 panel
  document.querySelectorAll('.wardrobePanel').forEach(p => p.classList.remove('panelActive'));
  document.getElementById(`wardrobePanel-${tab}`).classList.add('panelActive');
}

// ── 餵食 ──
function feedPet(itemName) {
  const data = foodData[itemName];
  if (!data) return;

  if (state.gems < data.cost) {
    showToast('💎 寶石不足！');
    return;
  }

  // 扣寶石
  state.gems -= data.cost;

  // 增加經驗（不超過上限，滿了就升級）
  state.exp += data.exp;
  if (state.exp >= state.expMax) {
    state.exp = state.exp - state.expMax; // 進位剩餘
    state.expMax = Math.round(state.expMax * 1.2); // 下一等級需求提升
    showToast('⭐ 升級了！');
  }

  // 增加飢餓度（不超過上限）
  state.hunger = Math.min(state.hungerMax, state.hunger + data.hunger);

  updateStats();
  showFeedEffect(data.emoji, data.exp, data.hunger, data.cost);
  petTap();
}

// ── Toast 提示 ──
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

// ── 餵食動畫效果 ──
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

// ── 說話功能效果 ──
const petLines = [
  '今天也要陪我玩嗎？',
  '摸摸我嘛～',
  '我肚子有點餓了！',
  '你來啦！',
  '今天的我也很可愛吧？',
  '哇～好開心！',
  '別走，再陪我一下。',
  '我最喜歡你了！'
];

let speechTimer = null;

function showPetSpeech() {
  const speech = document.getElementById('petSpeech');
  if (!speech) return;

  let lines = [];

  if (state.hunger < 30) {
    lines = [
      '嗷……餓得沒力氣了。',
      '想吃小魚乾。',
      '肚子空空的耶。'
    ];
  } else if (state.hunger < 80) {
    lines = [
      '今天心情不錯喵！',
      '陪我玩一下嘛～',
      '摸摸我，我會很乖。'
    ];
  } else {
    lines = [
      '吃得好飽呀～',
      '我現在超滿足！',
      '嘿嘿，今天真幸福。'
    ];
  }

  const randomLine = lines[Math.floor(Math.random() * lines.length)];
  speech.textContent = randomLine;

  speech.classList.remove('active');
  void speech.offsetWidth;
  speech.classList.add('active');

  clearTimeout(speechTimer);
  speechTimer = setTimeout(() => {
    speech.classList.remove('active');
  }, 1800);
}



// // 目前使用的寵物
// let currentPet = 'default';

// function setPetLayers(petKey) {
//   const pet = petAssets[petKey];
//   if (!pet) return;
//   currentPet = petKey;
//   document.getElementById('layerBody').src = pet.body;
//   document.getElementById('layerFace').src = pet.face;
//   document.getElementById('layerDeco').src = pet.deco ?? '';
// }

// ── DOMContentLoaded ──
document.addEventListener('DOMContentLoaded', initUI);