// Handles POST /api/auth/signup from signup.html.
// On success the cookie is already set, redirect to home.

(async () => {
  const me = await getCurrentUser();
  if (me) {
    window.location.replace('home.html');
    return;
  }
})();

const form = document.getElementById('signupForm');
const errorBox = document.getElementById('errorBox');
const submitBtn = document.getElementById('submitBtn');
const submitText = document.getElementById('submitText');
const emojiPicker = document.getElementById('emojiPicker');
const logoEmoji = document.getElementById('logoEmoji');

let selectedEmoji = '🦄';

emojiPicker.addEventListener('click', (e) => {
  const btn = e.target.closest('.emoji-option');
  if (!btn) return;
  emojiPicker.querySelectorAll('.emoji-option').forEach((el) => el.classList.remove('selected'));
  btn.classList.add('selected');
  selectedEmoji = btn.dataset.emoji;
  logoEmoji.textContent = selectedEmoji;
});

function showError(msg) {
  errorBox.textContent = msg;
  errorBox.classList.add('show');
}

function clearError() {
  errorBox.classList.remove('show');
}

function setLoading(loading) {
  submitBtn.disabled = loading;
  submitText.innerHTML = loading
    ? '<span class="spinner"></span>Creating…'
    : 'Sign up';
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearError();

  const username = form.username.value.trim();
  const password = form.password.value;

  if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
    showError('Username must be 3–20 chars: letters, numbers, underscore');
    return;
  }
  if (password.length < 6) {
    showError('Password must be at least 6 characters');
    return;
  }

  setLoading(true);
  try {
    await fetchAPI('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        username,
        password,
        avatarEmoji: selectedEmoji,
      }),
    });
    invalidateCurrentUser();
    window.location.href = 'home.html';
  } catch (err) {
    showError(err.message || 'Signup failed');
    setLoading(false);
  }
});
