async function renderHomeScreen() {
  const groups = await API.myGroups().catch(() => []);
  const stats = await API.myStats().catch(() => ({ today_time: 0, total_time: 0 }));

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
    <div style="display:flex; height:100%; position:relative;">

      <!-- Sidebar esquerda -->
      <div style="width:110px; flex-shrink:0; border-right:1px solid rgba(255,255,255,0.1); padding:10px 6px; display:flex; flex-direction:column; background:rgba(0,0,0,0.2); overflow-y:auto;">
        
        <!-- Avatar do usuário -->
        <div style="text-align:center; margin-bottom:12px;">
          <div style="font-size:32px;">${currentUser.avatar}</div>
          <p style="font-size:10px; font-weight:600; margin:2px 0 0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${currentUser.name.split(' ')[0]}</p>
        </div>

        <!-- Label grupos -->
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px;">
          <span style="font-size:9px; color:#9ca3af; font-weight:600;">GRUPOS</span>
          <button onclick="showCreateGroupModal()" style="color:#e94560; background:none; border:none; font-size:18px; cursor:pointer; line-height:1;">+</button>
        </div>

        <!-- Lista de grupos -->
        <div style="flex:1; overflow-y:auto;">
          ${groups.length === 0
            ? `<p style="font-size:10px; color:#6b7280; text-align:center; padding:8px 0;">Nenhum grupo</p>`
            : groups.map(g => `
              <button onclick="openGroup('${g.id}','${g.group_name}')" style="width:100%; text-align:center; padding:8px 4px; border-radius:10px; background:rgba(255,255,255,0.05); border:none; color:white; cursor:pointer; margin-bottom:6px;">
                <div style="font-size:20px; margin-bottom:2px;">👥</div>
                <p style="font-size:10px; font-weight:500; margin:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${g.group_name}</p>
                <p style="font-size:9px; color:#9ca3af; margin:0;">${g.member_count} membros</p>
              </button>
            `).join('')}

          <button onclick="showJoinGroupModal()" style="width:100%; padding:8px 4px; border-radius:10px; border:1px dashed rgba(255,255,255,0.2); background:none; color:#9ca3af; cursor:pointer; font-size:10px;">
            + Entrar
          </button>
        </div>

        <!-- Botão sair -->
        <button onclick="logout()" style="margin-top:8px; padding:6px 4px; border-radius:10px; background:rgba(255,255,255,0.05); border:none; color:#9ca3af; cursor:pointer; font-size:10px;">Sair</button>
      </div>

      <!-- Conteúdo principal -->
      <div style="flex:1; padding:12px; overflow-y:auto;">
        
        <!-- Timer -->
        <div class="card-glass ${timerRunning ? 'timer-glow' : ''}" style="border-radius:16px; padding:16px; text-align:center; margin-bottom:12px;">
          <p style="font-size:10px; color:#9ca3af; margin:0 0 4px;">TEMPO DE ESTUDO</p>
          <div data-timer-display style="font-size:40px; font-weight:700; font-family:monospace; margin-bottom:12px;">${formatTime(timerSeconds)}</div>
          <div style="display:flex; justify-content:center; gap:8px;">
            ${timerRunning
              ? `<button onclick="pauseTimer()" style="padding:8px 16px; background:#eab308; border:none; border-radius:10px; font-weight:600; font-size:13px; cursor:pointer;">⏸️ Pausar</button>
                 <button onclick="stopTimer(null)" style="padding:8px 16px; background:#ef4444; border:none; border-radius:10px; font-weight:600; font-size:13px; color:white; cursor:pointer;">⏹️ Parar</button>`
              : `<button onclick="startTimer()" class="btn-primary" style="padding:8px 16px; border-radius:10px; font-weight:600; font-size:13px;">▶️ ${timerSeconds > 0 ? 'Continuar' : 'Iniciar'}</button>
                 ${timerSeconds > 0 ? `<button onclick="stopTimer(null)" style="padding:8px 16px; background:rgba(255,255,255,0.1); border:none; border-radius:10px; font-weight:600; font-size:13px; color:white; cursor:pointer;">⏹️ Parar</button>` : ''}`}
          </div>
        </div>

        <!-- Ranking Global -->
        <div class="card-glass" style="border-radius:16px; padding:14px;">
          <h3 style="margin:0 0 10px; font-size:14px; display:flex; align-items:center; gap:6px;">🏆 Ranking Geral</h3>
          ${globalRanking.length === 0
            ? `<p style="text-align:center; color:#9ca3af; padding:12px 0; font-size:13px;">Nenhum dado ainda</p>`
            : globalRanking.map((u, i) => `
              <div class="${i===0?'ranking-gold':i===1?'ranking-silver':i===2?'ranking-bronze':''}" style="display:flex; align-items:center; gap:8px; padding:8px; border-radius:10px; margin-bottom:6px; ${i>2?'background:rgba(255,255,255,0.05)':''}">
                <span style="width:18px; font-weight:700; font-size:12px;">${i+1}º</span>
                <span style="font-size:16px;">${u.avatar}</span>
                <span style="flex:1; font-weight:500; font-size:12px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${u.name}</span>
                <span style="font-family:monospace; font-size:11px;">${formatTime(u.total_study_time)}</span>
              </div>
            `).join('')}
        </div>
      </div>
    </div>

    <!-- Modal Criar Grupo -->
    <div id="create-group-modal" class="modal-overlay hidden">
      <div class="card-glass" style="border-radius:16px; padding:20px; width:100%;">
        <h3 style="margin:0 0 12px; font-size:16px;">Criar Novo Grupo</h3>
        <label style="font-size:13px; color:#9ca3af;">Nome do Grupo</label>
        <input type="text" id="new-group-name" placeholder="Ex: Estudos de Medicina" style="margin-top:6px; margin-bottom:14px;">
        <div style="display:flex; gap:10px;">
          <button onclick="hideCreateGroupModal()" style="flex:1; padding:10px; background:rgba(255,255,255,0.1); border:none; border-radius:10px; color:white; cursor:pointer; font-size:13px;">Cancelar</button>
          <button onclick="createGroup()" class="btn-primary" style="flex:1; padding:10px; border-radius:10px; font-weight:600; font-size:13px;">Criar</button>
        </div>
      </div>
    </div>

    <!-- Modal Entrar no Grupo -->
    <div id="join-group-modal" class="modal-overlay hidden">
      <div class="card-glass" style="border-radius:16px; padding:20px; width:100%;">
        <h3 style="margin:0 0 12px; font-size:16px;">Entrar em um Grupo</h3>
        <label style="font-size:13px; color:#9ca3af;">ID do Grupo</label>
        <input type="text" id="join-group-id" placeholder="Cole o ID aqui" style="margin-top:6px; margin-bottom:14px;">
        <div style="display:flex; gap:10px;">
          <button onclick="hideJoinGroupModal()" style="flex:1; padding:10px; background:rgba(255,255,255,0.1); border:none; border-radius:10px; color:white; cursor:pointer; font-size:13px;">Cancelar</button>
          <button onclick="joinGroup()" class="btn-primary" style="flex:1; padding:10px; border-radius:10px; font-weight:600; font-size:13px;">Entrar</button>
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