// Tela de grupo
let currentGroup = null;
let currentSubScreen = null;

function openGroup(groupId, groupName) {
  currentGroup = { id: groupId, group_name: groupName };
  currentScreen = 'group';
  currentSubScreen = null;
  renderApp();
}

function goHome() {
  currentGroup = null;
  currentSubScreen = null;
  currentScreen = 'home';
  renderApp();
}

function openSubScreen(sub) { currentSubScreen = sub; renderApp(); }
function closeSubScreen() { currentSubScreen = null; renderApp(); }

async function renderGroupScreen() {
  const members = await API.getMembers(currentGroup.id).catch(() => []);
  const ranking = await API.getRanking(currentGroup.id).catch(() => []);

  let mainContent = '';
  if (currentSubScreen === 'timer') mainContent = renderGroupTimerHTML();
  else if (currentSubScreen === 'summaries') mainContent = await renderSummariesHTML();
  else if (currentSubScreen === 'reminders') mainContent = await renderRemindersHTML();
  else if (currentSubScreen === 'call') mainContent = renderCallHTML(members);
  else mainContent = renderGroupHomeHTML(ranking);

  document.getElementById('app').innerHTML = `
    <div class="sidebar card-glass">
      <button onclick="goHome()" style="background:none; border:none; color:#9ca3af; cursor:pointer; margin-bottom:16px; display:flex; align-items:center; gap:8px; font-size:14px;">← Voltar</button>
      <div style="margin-bottom:16px;">
        <h3 style="margin:0 0 4px;">${currentGroup.group_name}</h3>
        <p style="font-size:11px; color:#6b7280; margin:0;">ID: ${currentGroup.id}</p>
      </div>
      <p style="font-size:12px; color:#9ca3af; font-weight:600; margin-bottom:12px;">MEMBROS (${members.length})</p>
      <div style="flex:1; overflow-y:auto;">
        ${members.map(m => `
          <div style="display:flex; align-items:center; gap:12px; padding:8px; border-radius:12px; background:rgba(255,255,255,0.05); margin-bottom:8px;">
            <div style="position:relative;">
              <span style="font-size:24px;">${m.avatar}</span>
              <span class="online-dot" style="position:absolute; bottom:-2px; right:-2px; width:10px; height:10px; border-radius:50%; background:#22c55e;"></span>
            </div>
            <div style="flex:1; min-width:0;">
              <p style="margin:0; font-size:14px; font-weight:500; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${m.name}</p>
              <p style="margin:0; font-size:11px; color:#9ca3af;">Hoje: ${formatTime(m.today_study_time)}</p>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
    <div class="main-content">${mainContent}</div>
  `;
}

function renderGroupHomeHTML(ranking) {
  return `
    <div class="card-glass" style="border-radius:16px; padding:24px; margin-bottom:24px;">
      <h3 style="margin:0 0 16px;">🏆 Ranking do Dia</h3>
      ${ranking.length === 0
        ? `<p style="text-align:center; color:#9ca3af; padding:16px 0;">Nenhum estudo hoje ainda</p>`
        : ranking.slice(0,5).map((u, i) => `
          <div class="${i===0?'ranking-gold':i===1?'ranking-silver':i===2?'ranking-bronze':''}" style="display:flex; align-items:center; gap:12px; padding:12px; border-radius:12px; margin-bottom:8px; ${i>2?'background:rgba(255,255,255,0.05)':''}">
            <span style="width:24px; font-weight:700;">${i+1}º</span>
            <span style="font-size:20px;">${u.avatar}</span>
            <span style="flex:1; font-weight:500;">${u.name}</span>
            <span style="font-family:monospace; font-size:14px;">${formatTime(u.today_time)}</span>
          </div>
        `).join('')}
    </div>
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
      ${[
        ['📞','call','Ligar','Chamada do grupo'],
        ['⏱️','timer','Cronômetro','Iniciar estudos'],
        ['📝','summaries','Resumos','Ver e criar resumos'],
        ['📅','reminders','Lembretes','Gerenciar avisos'],
      ].map(([icon, sub, title, desc]) => `
        <button onclick="openSubScreen('${sub}')" class="card-glass" style="padding:24px; border-radius:16px; text-align:left; border:none; color:white; cursor:pointer;">
          <span style="font-size:36px; display:block; margin-bottom:12px;">${icon}</span>
          <h4 style="margin:0 0 4px;">${title}</h4>
          <p style="margin:0; font-size:14px; color:#9ca3af;">${desc}</p>
        </button>
      `).join('')}
    </div>
  `;
}

function renderGroupTimerHTML() {
  return `
    <button onclick="closeSubScreen()" style="background:none; border:none; color:#9ca3af; cursor:pointer; margin-bottom:24px; display:flex; align-items:center; gap:8px; font-size:14px;">← Voltar ao grupo</button>
    <div class="card-glass ${timerRunning ? 'timer-glow' : ''}" style="border-radius:24px; padding:48px; text-align:center;">
      <p style="font-size:12px; color:#9ca3af; margin:0 0 8px;">CRONÔMETRO DO GRUPO</p>
      <div data-timer-display style="font-size:80px; font-weight:700; font-family:monospace; margin-bottom:32px;">${formatTime(timerSeconds)}</div>
      <div style="display:flex; justify-content:center; gap:16px;">
        ${timerRunning
          ? `<button onclick="pauseTimer()" style="padding:16px 32px; background:#eab308; border:none; border-radius:12px; font-weight:600; font-size:18px; cursor:pointer;">⏸️ Pausar</button>
             <button onclick="stopTimer('${currentGroup.id}')" style="padding:16px 32px; background:#ef4444; border:none; border-radius:12px; font-weight:600; font-size:18px; color:white; cursor:pointer;">⏹️ Parar e Salvar</button>`
          : `<button onclick="startTimer()" class="btn-primary" style="padding:16px 32px; border-radius:12px; font-weight:600; font-size:18px;">▶️ ${timerSeconds > 0 ? 'Continuar' : 'Iniciar'} Estudos</button>
             ${timerSeconds > 0 ? `<button onclick="stopTimer('${currentGroup.id}')" style="padding:16px 32px; background:rgba(255,255,255,0.1); border:none; border-radius:12px; font-weight:600; font-size:18px; color:white; cursor:pointer;">⏹️ Parar e Salvar</button>` : ''}`}
      </div>
    </div>
  `;
}

async function renderSummariesHTML() {
  const summaries = await API.getSummaries(currentGroup.id).catch(() => []);
  return `
    <button onclick="closeSubScreen()" style="background:none; border:none; color:#9ca3af; cursor:pointer; margin-bottom:24px; display:flex; align-items:center; gap:8px; font-size:14px;">← Voltar ao grupo</button>
    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:24px;">
      <h2 style="margin:0;">📝 Resumos do Grupo</h2>
      <button onclick="showNewSummaryModal()" class="btn-primary" style="padding:8px 16px; border-radius:12px; font-weight:600;">+ Novo Resumo</button>
    </div>
    ${summaries.length === 0
      ? `<div class="card-glass" style="border-radius:16px; padding:48px; text-align:center;"><span style="font-size:64px; display:block; margin-bottom:16px;">📚</span><p style="color:#9ca3af;">Nenhum resumo ainda. Seja o primeiro a criar!</p></div>`
      : summaries.map(s => `
        <div class="card-glass" style="border-radius:16px; padding:24px; margin-bottom:16px;">
          <div style="display:flex; gap:12px; margin-bottom:16px;">
            <span style="font-size:32px;">${s.author.avatar}</span>
            <div>
              <h3 style="margin:0 0 4px;">${s.title}</h3>
              <p style="font-size:12px; color:#9ca3af; margin:0;">Por ${s.author.name} • ${new Date(s.created_at).toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
          <div style="background:rgba(255,255,255,0.05); border-radius:12px; padding:16px; margin-bottom:16px; white-space:pre-wrap; font-size:14px;">${s.content}</div>
          <div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:16px;">
            <p style="font-size:12px; color:#9ca3af; font-weight:600; margin-bottom:12px;">Comentários (${s.comments.length})</p>
            ${s.comments.map(c => `
              <div style="display:flex; gap:8px; background:rgba(255,255,255,0.05); border-radius:12px; padding:12px; margin-bottom:8px;">
                <span>${c.user.avatar}</span>
                <div><p style="margin:0; font-size:11px; color:#9ca3af;">${c.user.name}</p><p style="margin:0; font-size:14px;">${c.text}</p></div>
              </div>
            `).join('')}
            <div style="display:flex; gap:8px; margin-top:8px;">
              <input type="text" id="comment-${s.id}" placeholder="Adicionar comentário..." style="flex:1;">
              <button onclick="submitComment('${s.id}')" class="btn-primary" style="padding:8px 16px; border-radius:12px; font-size:14px; font-weight:600;">Enviar</button>
            </div>
          </div>
        </div>
      `).join('')}
    <div id="new-summary-modal" class="modal-overlay hidden">
      <div class="card-glass" style="border-radius:16px; padding:24px; width:100%; max-width:520px; max-height:90vh; overflow-y:auto;">
        <h3 style="margin:0 0 16px;">Novo Resumo</h3>
        <label style="font-size:14px; color:#9ca3af;">Título</label>
        <input type="text" id="summary-title" placeholder="Ex: Resumo de Anatomia" style="margin-top:8px; margin-bottom:16px;">
        <label style="font-size:14px; color:#9ca3af;">Conteúdo</label>
        <textarea id="summary-content" rows="8" placeholder="Escreva seu resumo aqui..." style="margin-top:8px; margin-bottom:16px; resize:vertical;"></textarea>
        <div style="display:flex; gap:12px;">
          <button onclick="hideNewSummaryModal()" style="flex:1; padding:12px; background:rgba(255,255,255,0.1); border:none; border-radius:12px; color:white; cursor:pointer;">Cancelar</button>
          <button onclick="submitSummary()" class="btn-primary" style="flex:1; padding:12px; border-radius:12px; font-weight:600;">Publicar</button>
        </div>
      </div>
    </div>
  `;
}

function showNewSummaryModal() { document.getElementById('new-summary-modal').classList.remove('hidden'); }
function hideNewSummaryModal() { document.getElementById('new-summary-modal').classList.add('hidden'); }

async function submitSummary() {
  const title = document.getElementById('summary-title').value.trim();
  const content = document.getElementById('summary-content').value.trim();
  if (!title || !content) return;
  try {
    await API.createSummary({ group_id: currentGroup.id, title, content });
    hideNewSummaryModal();
    openSubScreen('summaries');
  } catch (e) { alert(e.message); }
}

async function submitComment(summaryId) {
  const input = document.getElementById(`comment-${summaryId}`);
  const text = input.value.trim();
  if (!text) return;
  try {
    await API.addComment(summaryId, text);
    input.value = '';
    openSubScreen('summaries');
  } catch (e) { alert(e.message); }
}

async function renderRemindersHTML() {
  const reminders = await API.getReminders(currentGroup.id).catch(() => []);
  const sorted = [...reminders].sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
  return `
    <button onclick="closeSubScreen()" style="background:none; border:none; color:#9ca3af; cursor:pointer; margin-bottom:24px; display:flex; align-items:center; gap:8px; font-size:14px;">← Voltar ao grupo</button>
    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:24px;">
      <h2 style="margin:0;">📅 Lembretes do Grupo</h2>
      <button onclick="showNewReminderModal()" class="btn-primary" style="padding:8px 16px; border-radius:12px; font-weight:600;">+ Novo Lembrete</button>
    </div>
    ${sorted.length === 0
      ? `<div class="card-glass" style="border-radius:16px; padding:48px; text-align:center;"><span style="font-size:64px; display:block; margin-bottom:16px;">🔔</span><p style="color:#9ca3af;">Nenhum lembrete. Crie um para avisar o grupo!</p></div>`
      : sorted.map(r => {
          const past = new Date(r.datetime) < new Date();
          return `
            <div class="card-glass" style="border-radius:12px; padding:16px; margin-bottom:12px; ${past ? 'opacity:0.5' : ''}; display:flex; align-items:center; gap:16px;">
              <span style="font-size:36px;">${past ? '✓' : '⏰'}</span>
              <div style="flex:1;">
                <h4 style="margin:0 0 4px;">${r.title}</h4>
                <p style="margin:0; font-size:14px; color:#9ca3af;">${r.message || ''}</p>
                <p style="margin:4px 0 0; font-size:12px; color:var(--primary);">${new Date(r.datetime).toLocaleString('pt-BR')}</p>
              </div>
              <div style="text-align:right;">
                <p style="font-size:12px; color:#9ca3af; margin:0;">Por ${r.author.name}</p>
                ${!past && r.author.id === currentUser.id
                  ? `<button onclick="removeReminder('${r.id}')" style="background:none; border:none; color:#f87171; font-size:12px; cursor:pointer; margin-top:4px;">Excluir</button>`
                  : ''}
              </div>
            </div>
          `;
        }).join('')}
    <div id="new-reminder-modal" class="modal-overlay hidden">
      <div class="card-glass" style="border-radius:16px; padding:24px; width:100%; max-width:420px;">
        <h3 style="margin:0 0 16px;">Novo Lembrete</h3>
        <label style="font-size:14px; color:#9ca3af;">Título</label>
        <input type="text" id="reminder-title" placeholder="Ex: Prova de Cálculo" style="margin-top:8px; margin-bottom:16px;">
        <label style="font-size:14px; color:#9ca3af;">Mensagem (opcional)</label>
        <input type="text" id="reminder-message" placeholder="Ex: Estudar capítulos 5-8" style="margin-top:8px; margin-bottom:16px;">
        <label style="font-size:14px; color:#9ca3af;">Data e Hora</label>
        <input type="datetime-local" id="reminder-datetime" style="margin-top:8px; margin-bottom:16px;">
        <div style="display:flex; gap:12px;">
          <button onclick="hideNewReminderModal()" style="flex:1; padding:12px; background:rgba(255,255,255,0.1); border:none; border-radius:12px; color:white; cursor:pointer;">Cancelar</button>
          <button onclick="submitReminder()" class="btn-primary" style="flex:1; padding:12px; border-radius:12px; font-weight:600;">Criar</button>
        </div>
      </div>
    </div>
  `;
}

function showNewReminderModal() { document.getElementById('new-reminder-modal').classList.remove('hidden'); }
function hideNewReminderModal() { document.getElementById('new-reminder-modal').classList.add('hidden'); }

async function submitReminder() {
  const title = document.getElementById('reminder-title').value.trim();
  const message = document.getElementById('reminder-message').value.trim();
  const dt = document.getElementById('reminder-datetime').value;
  if (!title || !dt) return;
  try {
    await API.createReminder({ group_id: currentGroup.id, title, message, datetime: new Date(dt).toISOString() });
    hideNewReminderModal();
    openSubScreen('reminders');
  } catch (e) { alert(e.message); }
}

async function removeReminder(id) {
  try {
    await API.deleteReminder(id);
    openSubScreen('reminders');
  } catch (e) { alert(e.message); }
}

function renderCallHTML(members) {
  return `
    <button onclick="closeSubScreen()" style="background:none; border:none; color:#9ca3af; cursor:pointer; margin-bottom:24px; display:flex; align-items:center; gap:8px; font-size:14px;">← Voltar ao grupo</button>
    <div class="card-glass" style="border-radius:16px; padding:48px; text-align:center;">
      <span style="font-size:80px; display:block; margin-bottom:24px;">📞</span>
      <h2 style="margin:0 0 8px;">Chamada do Grupo</h2>
      <p style="color:#9ca3af; margin-bottom:32px;">Inicie uma chamada de voz com os membros do grupo</p>
      <div style="display:flex; flex-wrap:wrap; justify-content:center; gap:16px; margin-bottom:32px;">
        ${members.map(m => `
          <div style="text-align:center;">
            <div style="position:relative; display:inline-block;">
              <span style="font-size:40px;">${m.avatar}</span>
              <span style="position:absolute; bottom:-2px; right:-2px; width:10px; height:10px; border-radius:50%; background:#22c55e;"></span>
            </div>
            <p style="font-size:12px; margin:4px 0 0;">${m.name.split(' ')[0]}</p>
          </div>
        `).join('')}
      </div>
      <div style="background:rgba(234,179,8,0.1); border:1px solid rgba(234,179,8,0.4); border-radius:12px; padding:16px; margin-bottom:24px;">
        <p style="color:#fbbf24; font-size:14px; margin:0;">⚠️ Funcionalidade em desenvolvimento. Em breve você poderá fazer chamadas com seu grupo!</p>
      </div>
      <button disabled style="padding:16px 32px; background:rgba(34,197,94,0.3); border:none; border-radius:50px; font-weight:600; font-size:18px; cursor:not-allowed; color:white;">📞 Iniciar Chamada (Em breve)</button>
    </div>
  `;
}