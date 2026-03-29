// Estado global e orquestrador
let currentUser = JSON.parse(localStorage.getItem('user') || 'null');
let currentScreen = currentUser ? 'home' : 'login';


async function renderApp() {
  if (currentScreen === 'login') renderLoginScreen();
  else if (currentScreen === 'home') await renderHomeScreen();
  else if (currentScreen === 'group') await renderGroupScreen();
}

function renderCurrentScreen() { renderApp(); }

function renderLoginScreen() {
  document.getElementById('app').innerHTML = `
    <div style="display:flex; align-items:center; justify-content:center; min-height:100vh; width:100%; padding:16px;">
      <div class="card-glass" style="border-radius:24px; padding:32px; width:100%; max-width:420px;">
        <div style="text-align:center; margin-bottom:32px;">
          <div style="font-size:64px; margin-bottom:16px;">📚</div>
          <h1 style="margin:0 0 8px;">StudyGroup</h1>
          <p style="color:#9ca3af; margin:0;">Bem-vindo ao seu grupo de estudos!</p>
        </div>

        <div id="login-form">
          <label style="font-size:14px; color:#9ca3af;">Email</label>
          <input type="email" id="login-email" placeholder="seu@email.com" style="margin-top:8px; margin-bottom:16px;">
          <label style="font-size:14px; color:#9ca3af;">Senha</label>
          <input type="password" id="login-password" placeholder="••••••••" style="margin-top:8px; margin-bottom:24px;">
          <button onclick="handleLogin()" class="btn-primary" style="width:100%; padding:12px; border-radius:12px; font-weight:600; font-size:16px; margin-bottom:12px;">Entrar</button>
          <button onclick="showRegisterForm()" style="width:100%; padding:12px; background:rgba(255,255,255,0.1); border:none; border-radius:12px; color:white; cursor:pointer; font-size:16px;">Criar Conta</button>
        </div>

        <div id="register-form" class="hidden">
          <label style="font-size:14px; color:#9ca3af;">Nome</label>
          <input type="text" id="reg-name" placeholder="Seu nome" style="margin-top:8px; margin-bottom:16px;">
          <label style="font-size:14px; color:#9ca3af;">Email</label>
          <input type="email" id="reg-email" placeholder="seu@email.com" style="margin-top:8px; margin-bottom:16px;">
          <label style="font-size:14px; color:#9ca3af;">Senha</label>
          <input type="password" id="reg-password" placeholder="••••••••" style="margin-top:8px; margin-bottom:16px;">
          <label style="font-size:14px; color:#9ca3af; display:block; margin-bottom:8px;">Escolha seu Avatar</label>
          <div style="display:grid; grid-template-columns:repeat(6,1fr); gap:8px; margin-bottom:24px;">
            ${avatars.map((av, i) => `
              <button onclick="selectAvatar('${av}')" class="avatar-btn ${i===0?'selected':''}" data-avatar="${av}"
                style="font-size:24px; padding:8px; border-radius:12px; background:rgba(255,255,255,0.1); border:2px solid ${i===0?'var(--primary)':'transparent'}; cursor:pointer;">
                ${av}
              </button>
            `).join('')}
          </div>
          <button onclick="handleRegister()" class="btn-primary" style="width:100%; padding:12px; border-radius:12px; font-weight:600; font-size:16px; margin-bottom:12px;">Criar Conta</button>
          <button onclick="showLoginForm()" style="width:100%; padding:12px; background:rgba(255,255,255,0.1); border:none; border-radius:12px; color:white; cursor:pointer; font-size:16px;">Já tenho conta</button>
        </div>

        <div id="auth-message" class="hidden" style="margin-top:16px; text-align:center; font-size:14px;"></div>
      </div>
    </div>
  `;

  // Highlight avatar selecionado ao trocar
  document.querySelectorAll('.avatar-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.avatar-btn').forEach(b => b.style.borderColor = 'transparent');
      btn.style.borderColor = 'var(--primary)';
    });
  });
}

// Init
renderApp();