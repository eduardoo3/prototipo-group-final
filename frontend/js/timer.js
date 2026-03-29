// Gerenciamento do cronômetro
let timerInterval = null;
let timerSeconds = 0;
let timerRunning = false;

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function updateTimerDisplay() {
  document.querySelectorAll('[data-timer-display]').forEach(el => {
    el.textContent = formatTime(timerSeconds);
  });
}

function startTimer() {
  if (timerRunning) return;
  timerRunning = true;
  timerInterval = setInterval(() => {
    timerSeconds++;
    updateTimerDisplay();
  }, 1000);
  renderCurrentScreen();
}

function pauseTimer() {
  timerRunning = false;
  clearInterval(timerInterval);
  renderCurrentScreen();
}

async function stopTimer(groupId = null) {
  timerRunning = false;
  clearInterval(timerInterval);
  if (timerSeconds > 0) {
    try {
      await API.saveSession(timerSeconds, groupId);
    } catch (e) { console.error('Erro ao salvar sessão:', e); }
  }
  timerSeconds = 0;
  renderCurrentScreen();
}

function resetTimerSilent() {
  timerRunning = false;
  clearInterval(timerInterval);
  timerSeconds = 0;
}