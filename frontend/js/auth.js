// Autenticação
const avatars = ['🧑‍🎓','👨‍💻','👩‍🔬','🧑‍🏫','👨‍🎨','👩‍⚕️','🧑‍🚀','👨‍🍳','👩‍🌾','🧑‍🔧','📚','🎯'];
let selectedAvatar = avatars[0];

function selectAvatar(avatar) {
  selectedAvatar = avatar;
  document.querySelectorAll('.avatar-btn').forEach(btn => {
    btn.classList.toggle('selected', btn.dataset.avatar === avatar);
  });
}

async function handleLogin() {
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  if (!email || !password) return showMessage('Preencha todos os campos', true);

  try {
    const data = await API.login(email, password);
    if (data.access_token) {
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      currentUser = data.user;
      currentScreen = 'home';
      renderApp();
    } else {
      showMessage(data.detail || 'Erro ao entrar', true);
    }
  } catch (e) { showMessage(e.message, true); }
}

async function handleRegister() {
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  if (!name || !email || !password) return showMessage('Preencha todos os campos', true);

  try {
    await API.register({ name, email, password, avatar: selectedAvatar });
    showMessage('Conta criada! Faça login.');
    showLoginForm();
  } catch (e) { showMessage(e.message, true); }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  currentUser = null;
  currentScreen = 'login';
  resetTimerSilent();
  renderApp();
}

function showRegisterForm() {
  document.getElementById('login-form').classList.add('hidden');
  document.getElementById('register-form').classList.remove('hidden');
}

function showLoginForm() {
  document.getElementById('register-form').classList.add('hidden');
  document.getElementById('login-form').classList.remove('hidden');
}

function showMessage(msg, isError = false) {
  const el = document.getElementById('auth-message');
  el.textContent = msg;
  el.className = `mt-4 text-center text-sm ${isError ? 'text-red-400' : 'text-green-400'}`;
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 3000);
}