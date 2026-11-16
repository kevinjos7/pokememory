// ============================================================================
// UTILIDADES DEL TEMPORIZADOR
// ============================================================================
let timerInterval = null;
let secondsElapsed = 0;

export function formatTime(totalSeconds) {
  const min = Math.floor(totalSeconds / 60);
  const sec = totalSeconds % 60;
  return `${min}m ${sec}s`;
}

export function startTimer(onTick) {
  stopTimer();
  secondsElapsed = 0;
  onTick(formatTime(0));

  timerInterval = setInterval(() => {
    secondsElapsed++;
    onTick(formatTime(secondsElapsed));
  }, 1000);
}

export function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

export function getSecondsElapsed() {
  return secondsElapsed;
}
