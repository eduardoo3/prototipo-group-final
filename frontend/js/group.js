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
    <div style="display:flex; height:100%; position:relative;">

      <!-- Sidebar esquerda -->
      <div style="width:100px; flex-shrink:0; border-right:1px solid rgba(255,255,255,0.1); padding:10px 6px; display:flex; flex-direction:column; background:rgba(0,0,0,0.2); overflow-y:auto;">
        
        <button onclick="goHome()" style="background:none; border:none; color:#9ca3af; cursor:pointer; margin-bottom:10px; font-size:11px; text-align:left; padding:4px;">← Voltar</button>
        
        <div style="margin-bottom:10px;">
          <p style="font-size:12px; font-weight:700; margin:0 0 2px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${currentGroup.group_name}</p>
          <p style="font-size:9px; color:#6b7280; margin:0; overflow:hidden; text-overflow:ellipsis;">ID: ${currentGroup.id.slice(0,8)}...</p>
        </div>

        <p style="font-size:9px; color:#9ca3af; font-weight:600; margin-bottom:8px;">MEMBROS (${members.length})</p>

        <div style="flex:1; overflow-y:auto;">
          ${members.map(m => `
            <div style="display:flex; flex-direction:column; align-items:center; padding:6px 4px; border-radius:10px; background:rgba(255,255,255,0.05); margin-bottom:6px; text-align:center;">
              <div style="position:relative; display:inline-block; margin-bottom:2px;">
                <span style="font-size:24px;">${m.avatar}</span>
                <span class="online-dot" style="position:absolute; bottom:-1px; right:-1px; width:8px; height:8px; border-radius:50%; background:#22c55e;"></span>
              </div>
              <p style="margin:0; font-size:10px; font-weight:500; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; width:100%;">${m.name.split(' ')[0]}</p>
              <p style="margin:0; font-size:9px; color:#9ca3af;">${formatTime(m.today_study_time)}</p>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Conteúdo principal -->
      <div style="flex:1; padding:12px; overflow-y:auto;">
        ${mainContent}
      </div>
    </div>
  `;
}

function renderGroupHomeHTML(ranking) {
  return `
    <div class="card-glass" style="border-radius:14px; padding:14px; margin-bottom:12px;">
      <h3 style="margin:0 0 10px; font-size:14px;">🏆 Ranking do Dia</h3>
      ${ranking.length === 0
        ? `<p style="text-align:center; color:#9ca3af; padding:12px 0; font-size:13px;">Nenhum estudo hoje</p>`
        : ranking.slice(0,5).map((u, i) => `
          <div class="${i===0?'ranking-gold':i===1?'ranking-silver':i===2?'ranking-bronze':''}" style="display:flex; align-items:center; gap:8px; padding:8px; border-radius:10px; margin-bottom:6px; ${i>2?'background:rgba(255,255,255,0.05)':''}">
            <span style="width:18px; font-weight:700; font-size:12px;">${i+1}º</span>
            <span style="font-size:16px;">${u.avatar}</span>
            <span style="flex:1; font-weight:500; font-size:12px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${u.name}</span>
            <span style="font-family:monospace; font-size:11px;">${formatTime(u.today_time)}</span>
          </div>
        `).join('')}
    </div>

    <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
      ${[
        ['📞','call','Ligar','Chamada'],
        ['⏱️','timer','Cronômetro','Estudos'],
        ['📝','summaries','Resumos','Ver e criar'],
        ['📅','reminders','Lembretes','Avisos'],
      ].map(([icon, sub, title, desc]) => `
        <button onclick="openSubScreen('${sub}')" class="card-glass" style="padding:14px 10px; border-radius:14px; text-align:left; border:none; color:white; cursor:pointer;">
          <span style="font-size:28px; display:block; margin-bottom:6px;">${icon}</span>
          <h4 style="margin:0 0 2px; font-size:13px;">${title}</h4>
          <p style="margin:0; font-size:11px; color:#9ca3af;">${desc}</p>
        </button>
      `).join('')}
    </div>
  `;
}

function renderGroupTimerHTML() {
  return `
    <button onclick="closeSubScreen()" style="background:none; border:none; color:#9ca3af; cursor:pointer; margin-bottom:16px; display:flex; align-items:center; gap:6px; font-size:13px;">← Voltar</button>
    <div class="card-glass ${timerRunning ? 'timer-glow' : ''}" style="border-radius:20px; padding:32px 16px; text-align:center;">
      <p style="font-size:11px; color:#9ca3af; margin:0 0 6px;">CRONÔMETRO DO GRUPO</p>
      <div data-timer-display style="font-size:56px; font-weight:700; font-family:monospace; margin-bottom:24px;">${formatTime(timerSeconds)}</div>
      <div style="display:flex; justify-content:center; gap:10px;">
        ${timerRunning
          ? `<button onclick="pauseTimer()" style="padding:10px 20px; background:#eab308; border:none; border-radius:12px; font-weight:600; font-size:14px; cursor:pointer;">⏸️ Pausar</button>
             <button onclick="stopTimer('${currentGroup.id}')" style="padding:10px 20px; background:#ef4444; border:none; border-radius:12px; font-weight:600; font-size:14px; color:white; cursor:pointer;">⏹️ Salvar</button>`
          : `<button onclick="startTimer()" class="btn-primary" style="padding:10px 20px; border-radius:12px; font-weight:600; font-size:14px;">▶️ ${timerSeconds > 0 ? 'Continuar' : 'Iniciar'}</button>
             ${timerSeconds > 0 ? `<button onclick="stopTimer('${currentGroup.id}')" style="padding:10px 20px; background:rgba(255,255,255,0.1); border:none; border-radius:12px; font-weight:600; font-size:14px; color:white; cursor:pointer;">⏹️ Salvar</button>` : ''}`}
      </div>
    </div>
  `;
}

async function renderSummariesHTML() {
  const summaries = await API.getSummaries(currentGroup.id).catch(() => []);
  return `
    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:14px;">
      <div style="display:flex; align-items:center; gap:8px;">
        <button onclick="closeSubScreen()" style="background:none; border:none; color:#9ca3af; cursor:pointer; font-size:13px;">←</button>
        <h2 style="margin:0; font-size:15px;">📝 Resumos</h2>
      </div>
      <button onclick="showNewSummaryModal()" class="btn-primary" style="padding:6px 12px; border-radius:10px; font-weight:600; font-size:12px;">+ Novo</button>
    </div>

    ${summaries.length === 0
      ? `<div class="card-glass" style="border-radius:14px; padding:32px; text-align:center;"><span style="font-size:48px; display:block; margin-bottom:12px;">📚</span><p style="color:#9ca3af; font-size:13px;">Nenhum resumo ainda!</p></div>`
      : summaries.map(s => `
        <div class="card-glass" style="border-radius:14px; padding:14px; margin-bottom:12px;">
          <div style="display:flex; gap:10px; margin-bottom:10px;">
            <span style="font-size:24px;">${s.author.avatar}</span>
            <div>
              <h3 style="margin:0 0 2px; font-size:14px;">${s.title}</h3>
              <p style="font-size:11px; color:#9ca3af; margin:0;">${s.author.name} • ${new Date(s.created_at).toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
          <div style="background:rgba(255,255,255,0.05); border-radius:10px; padding:12px; margin-bottom:10px; white-space:pre-wrap; font-size:12px; line-height:1.5;">${s.content}</div>
          <div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:10px;">
            <p style="font-size:11px; color:#9ca3af; font-weight:600; margin-bottom:8px;">Comentários (${s.comments.length})</p>
            ${s.comments.map(c => `
              <div style="display:flex; gap:6px; background:rgba(255,255,255,0.05); border-radius:10px; padding:8px; margin-bottom:6px;">
                <span style="font-size:14px;">${c.user.avatar}</span>
                <div><p style="margin:0; font-size:10px; color:#9ca3af;">${c.user.name}</p><p style="margin:0; font-size:12px;">${c.text}</p></div>
              </div>
            `).join('')}
            <div style="display:flex; gap:6px; margin-top:6px;">
              <input type="text" id="comment-${s.id}" placeholder="Comentar..." style="flex:1; font-size:12px; padding:8px 10px;">
              <button onclick="submitComment('${s.id}')" class="btn-primary" style="padding:8px 12px; border-radius:10px; font-size:12px; font-weight:600;">↑</button>
            </div>
          </div>
        </div>
      `).join('')}

    <div id="new-summary-modal" class="modal-overlay hidden">
      <div class="card-glass" style="border-radius:16px; padding:20px; width:100%; max-height:80%; overflow-y:auto;">
        <h3 style="margin:0 0 12px; font-size:16px;">Novo Resumo</h3>
        <label style="font-size:13px; color:#9ca3af;">Título</label>
        <input type="text" id="summary-title" placeholder="Ex: Resumo de Anatomia" style="margin-top:6px; margin-bottom:12px;">
        <label style="font-size:13px; color:#9ca3af;">Conteúdo</label>
        <textarea id="summary-content" rows="6" placeholder="Escreva seu resumo..." style="margin-top:6px; margin-bottom:12px; resize:none; font-size:13px;"></textarea>
        <div style="display:flex; gap:10px;">
          <button onclick="hideNewSummaryModal()" style="flex:1; padding:10px; background:rgba(255,255,255,0.1); border:none; border-radius:10px; color:white; cursor:pointer; font-size:13px;">Cancelar</button>
          <button onclick="submitSummary()" class="btn-primary" style="flex:1; padding:10px; border-radius:10px; font-weight:600; font-size:13px;">Publicar</button>
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
    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:14px;">
      <div style="display:flex; align-items:center; gap:8px;">
        <button onclick="closeSubScreen()" style="background:none; border:none; color:#9ca3af; cursor:pointer; font-size:13px;">←</button>
        <h2 style="margin:0; font-size:15px;">📅 Lembretes</h2>
      </div>
      <button onclick="showNewReminderModal()" class="btn-primary" style="padding:6px 12px; border-radius:10px; font-weight:600; font-size:12px;">+ Novo</button>
    </div>

    ${sorted.length === 0
      ? `<div class="card-glass" style="border-radius:14px; padding:32px; text-align:center;"><span style="font-size:48px; display:block; margin-bottom:12px;">🔔</span><p style="color:#9ca3af; font-size:13px;">Nenhum lembrete ainda!</p></div>`
      : sorted.map(r => {
          const past = new Date(r.datetime) < new Date();
          return `
            <div class="card-glass" style="border-radius:12px; padding:12px; margin-bottom:10px; ${past ? 'opacity:0.5' : ''}; display:flex; align-items:center; gap:12px;">
              <span style="font-size:28px;">${past ? '✓' : '⏰'}</span>
              <div style="flex:1;">
                <h4 style="margin:0 0 2px; font-size:13px;">${r.title}</h4>
                <p style="margin:0; font-size:11px; color:#9ca3af;">${r.message || ''}</p>
                <p style="margin:2px 0 0; font-size:11px; color:#e94560;">${new Date(r.datetime).toLocaleString('pt-BR')}</p>
              </div>
              <div style="text-align:right;">
                <p style="font-size:10px; color:#9ca3af; margin:0;">${r.author.name.split(' ')[0]}</p>
                ${!past && r.author.id === currentUser.id
                  ? `<button onclick="removeReminder('${r.id}')" style="background:none; border:none; color:#f87171; font-size:11px; cursor:pointer; margin-top:2px;">Excluir</button>`
                  : ''}
              </div>
            </div>
          `;
        }).join('')}

    <div id="new-reminder-modal" class="modal-overlay hidden">
      <div class="card-glass" style="border-radius:16px; padding:20px; width:100%;">
        <h3 style="margin:0 0 12px; font-size:16px;">Novo Lembrete</h3>
        <label style="font-size:13px; color:#9ca3af;">Título</label>
        <input type="text" id="reminder-title" placeholder="Ex: Prova de Cálculo" style="margin-top:6px; margin-bottom:12px;">
        <label style="font-size:13px; color:#9ca3af;">Mensagem (opcional)</label>
        <input type="text" id="reminder-message" placeholder="Ex: Estudar caps 5-8" style="margin-top:6px; margin-bottom:12px;">
        <label style="font-size:13px; color:#9ca3af;">Data e Hora</label>
        <input type="datetime-local" id="reminder-datetime" style="margin-top:6px; margin-bottom:14px;">
        <div style="display:flex; gap:10px;">
          <button onclick="hideNewReminderModal()" style="flex:1; padding:10px; background:rgba(255,255,255,0.1); border:none; border-radius:10px; color:white; cursor:pointer; font-size:13px;">Cancelar</button>
          <button onclick="submitReminder()" class="btn-primary" style="flex:1; padding:10px; border-radius:10px; font-weight:600; font-size:13px;">Criar</button>
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
    <button onclick="closeSubScreen()" style="background:none; border:none; color:#9ca3af; cursor:pointer; margin-bottom:16px; font-size:13px;">← Voltar</button>
    <div class="card-glass" style="border-radius:16px; padding:24px; text-align:center;">
      <span style="font-size:56px; display:block; margin-bottom:16px;">📞</span>
      <h2 style="margin:0 0 6px; font-size:16px;">Chamada do Grupo</h2>
      <p style="color:#9ca3af; margin-bottom:20px; font-size:13px;">Inicie uma chamada com os membros</p>
      <div style="display:flex; flex-wrap:wrap; justify-content:center; gap:12px; margin-bottom:20px;">
        ${members.map(m => `
          <div style="text-align:center;">
            <div style="position:relative; display:inline-block;">
              <span style="font-size:32px;">${m.avatar}</span>
              <span style="position:absolute; bottom:-1px; right:-1px; width:8px; height:8px; border-radius:50%; background:#22c55e;"></span>
            </div>
            <p style="font-size:10px; margin:4px 0 0;">${m.name.split(' ')[0]}</p>
          </div>
        `).join('')}
      </div>
      <div style="background:rgba(234,179,8,0.1); border:1px solid rgba(234,179,8,0.3); border-radius:10px; padding:12px; margin-bottom:16px;">
        <p style="color:#fbbf24; font-size:12px; margin:0;">⚠️ Funcionalidade em desenvolvimento. Em breve!</p>
      </div>
      <button disabled style="padding:12px 24px; background:rgba(34,197,94,0.3); border:none; border-radius:50px; font-weight:600; font-size:14px; cursor:not-allowed; color:white;">📞 Em breve</button>
    </div>
  `;
}