// Handles POST /api/auth/login from login.html
// On success, the Supabase session cookie is set on this response
// and we redirect to home.html.

(async () => {
  // If already logged in, skip the form entirely.
  const me = await getCurrentUser();
  if (me) {
    window.location.replace('home.html');
    return;
  }
})();

const form = document.getElementById('loginForm');
const errorBox = document.getElementById('errorBox');
const submitBtn = document.getElementById('submitBtn');
const submitText = document.getElementById('submitText');

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
    ? '<span class="spinner"></span>Logging in…'
    : 'Log in';
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearError();

  const username = form.username.value.trim();
  const password = form.password.value;

  if (!username || !password) {
    showError('Username and password are required');
    return;
  }

  setLoading(true);
  try {
    await fetchAPI('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    // Cookie is set; force a refetch on next page.
    invalidateCurrentUser();
    window.location.href = 'home.html';
  } catch (err) {
    showError(err.message || 'Login failed');
    setLoading(false);
  }
});
