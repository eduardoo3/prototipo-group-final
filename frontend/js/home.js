// Tela inicial
async function renderHomeScreen() {
  const groups = await API.myGroups().catch(() => []);
  const stats = await API.myStats().catch(() => ({ today_time: 0, total_time: 0 }));

  // Ranking global: coleta membros de todos os grupos
  const memberMap = {};
  for (const g of groups) {
    const members = await API.getMembers(g.id).catch(() => []);
    members.forEach(m => {
      if (!memberMap[m.id] || memberMap[m.id].total_study_time < m.total_study_time) {
        memberMap[m.id] = m;
      }
    });
  }
  const globalRanking = Object.values(memberMap).sort((a, b) => b.total_study_time - a.total_study_time).slice(0, 10);

  document.getElementById('app').innerHTML = `
    <div class="sidebar card-glass">
      <div style="text-align:center; margin-bottom:24px;">
        <div style="font-size:48px;">${currentUser.avatar}</div>
        <h3 style="margin:4px 0;">${currentUser.name}</h3>
        <p style="font-size:12px; color:#9ca3af;">${currentUser.email}</p>
      </div>

      <div style="flex:1; overflow-y:auto;">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px;">
          <span style="font-size:12px; color:#9ca3af; font-weight:600;">MEUS GRUPOS</span>
          <button onclick="showCreateGroupModal()" style="color:var(--primary); background:none; border:none; font-size:24px; cursor:pointer;">+</button>
        </div>

        ${groups.length === 0
          ? `<p style="font-size:12px; color:#6b7280; text-align:center; padding:16px 0;">Nenhum grupo ainda</p>`
          : groups.map(g => `
            <button onclick="openGroup('${g.id}','${g.group_name}')" style="width:100%; text-align:left; padding:12px; border-radius:12px; background:rgba(255,255,255,0.05); border:none; color:white; cursor:pointer; margin-bottom:8px; display:flex; align-items:center; gap:12px;">
              <span style="font-size:24px;">👥</span>
              <div>
                <p style="margin:0; font-size:14px; font-weight:500;">${g.group_name}</p>
                <p style="margin:0; font-size:12px; color:#9ca3af;">${g.member_count} membro(s)</p>
              </div>
            </button>
          `).join('')}

        <button onclick="showJoinGroupModal()" style="width:100%; padding:12px; border-radius:12px; border:2px dashed rgba(255,255,255,0.2); background:none; color:#9ca3af; cursor:pointer; margin-top:8px; font-size:14px;">
          + Entrar em um grupo
        </button>
      </div>

      <button onclick="logout()" style="margin-top:16px; padding:8px; border-radius:12px; background:rgba(255,255,255,0.05); border:none; color:#9ca3af; cursor:pointer; width:100%; font-size:14px;">Sair</button>
    </div>

    <div class="main-content">
      <!-- Timer -->
      <div class="card-glass ${timerRunning ? 'timer-glow' : ''}" style="border-radius:24px; padding:32px; text-align:center; margin-bottom:24px;">
        <p style="font-size:12px; color:#9ca3af; margin:0 0 8px;">TEMPO DE ESTUDO</p>
        <div data-timer-display style="font-size:64px; font-weight:700; font-family:monospace; margin-bottom:24px;">${formatTime(timerSeconds)}</div>
        <div style="display:flex; justify-content:center; gap:16px;">
          ${timerRunning
            ? `<button onclick="pauseTimer()" style="padding:12px 32px; background:#eab308; border:none; border-radius:12px; font-weight:600; font-size:16px; cursor:pointer;">⏸️ Pausar</button>
               <button onclick="stopTimer(null)" style="padding:12px 32px; background:#ef4444; border:none; border-radius:12px; font-weight:600; font-size:16px; color:white; cursor:pointer;">⏹️ Parar</button>`
            : `<button onclick="startTimer()" class="btn-primary" style="padding:12px 32px; border-radius:12px; font-weight:600; font-size:16px;">▶️ ${timerSeconds > 0 ? 'Continuar' : 'Iniciar'} Estudos</button>
               ${timerSeconds > 0 ? `<button onclick="stopTimer(null)" style="padding:12px 32px; background:rgba(255,255,255,0.1); border:none; border-radius:12px; font-weight:600; font-size:16px; color:white; cursor:pointer;">⏹️ Parar</button>` : ''}`}
        </div>
      </div>

      <!-- Ranking Global -->
      <div class="card-glass" style="border-radius:16px; padding:24px;">
        <h3 style="margin:0 0 16px; display:flex; align-items:center; gap:8px;">🏆 Ranking Geral</h3>
        ${globalRanking.length === 0
          ? `<p style="text-align:center; color:#9ca3af; padding:16px 0;">Nenhum dado de estudo ainda</p>`
          : globalRanking.map((u, i) => `
            <div class="${i===0?'ranking-gold':i===1?'ranking-silver':i===2?'ranking-bronze':''}" style="display:flex; align-items:center; gap:12px; padding:12px; border-radius:12px; margin-bottom:8px; ${i>2?'background:rgba(255,255,255,0.05)':''}">
              <span style="width:24px; font-weight:700;">${i+1}º</span>
              <span style="font-size:20px;">${u.avatar}</span>
              <span style="flex:1; font-weight:500;">${u.name}</span>
              <span style="font-family:monospace; font-size:14px;">${formatTime(u.total_study_time)}</span>
            </div>
          `).join('')}
      </div>
    </div>

    <!-- Modal Criar Grupo -->
    <div id="create-group-modal" class="modal-overlay hidden">
      <div class="card-glass" style="border-radius:16px; padding:24px; width:100%; max-width:420px;">
        <h3 style="margin:0 0 16px;">Criar Novo Grupo</h3>
        <label style="font-size:14px; color:#9ca3af;">Nome do Grupo</label>
        <input type="text" id="new-group-name" placeholder="Ex: Estudos de Medicina" style="margin-top:8px; margin-bottom:16px;">
        <div style="display:flex; gap:12px;">
          <button onclick="hideCreateGroupModal()" style="flex:1; padding:12px; background:rgba(255,255,255,0.1); border:none; border-radius:12px; color:white; cursor:pointer;">Cancelar</button>
          <button onclick="createGroup()" class="btn-primary" style="flex:1; padding:12px; border-radius:12px; font-weight:600;">Criar</button>
        </div>
      </div>
    </div>

    <!-- Modal Entrar no Grupo -->
    <div id="join-group-modal" class="modal-overlay hidden">
      <div class="card-glass" style="border-radius:16px; padding:24px; width:100%; max-width:420px;">
        <h3 style="margin:0 0 16px;">Entrar em um Grupo</h3>
        <label style="font-size:14px; color:#9ca3af;">ID do Grupo</label>
        <input type="text" id="join-group-id" placeholder="Cole o ID do grupo aqui" style="margin-top:8px; margin-bottom:16px;">
        <div style="display:flex; gap:12px;">
          <button onclick="hideJoinGroupModal()" style="flex:1; padding:12px; background:rgba(255,255,255,0.1); border:none; border-radius:12px; color:white; cursor:pointer;">Cancelar</button>
          <button onclick="joinGroup()" class="btn-primary" style="flex:1; padding:12px; border-radius:12px; font-weight:600;">Entrar</button>
        </div>
      </div>
    </div>
  `;
}

function showCreateGroupModal() { document.getElementById('create-group-modal').classList.remove('hidden'); }
function hideCreateGroupModal() { document.getElementById('create-group-modal').classList.add('hidden'); }
function showJoinGroupModal() { document.getElementById('join-group-modal').classList.remove('hidden'); }
function hideJoinGroupModal() { document.getElementById('join-group-modal').classList.add('hidden'); }

async function createGroup() {
  const name = document.getElementById('new-group-name').value.trim();
  if (!name) return;
  try {
    await API.createGroup(name);
    hideCreateGroupModal();
    renderCurrentScreen();
  } catch (e) { alert(e.message); }
}

async function joinGroup() {
  const id = document.getElementById('join-group-id').value.trim();
  if (!id) return;
  try {
    await API.joinGroup(id);
    hideJoinGroupModal();
    renderCurrentScreen();
  } catch (e) { alert(e.message); }
}