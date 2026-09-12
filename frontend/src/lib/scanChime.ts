export function playScanChime() {
  const AudioCtx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return;

  const ctx = new AudioCtx();
  const now = ctx.currentTime;
  const notes = [
    { freq: 784, at: 0, dur: 0.12 },
    { freq: 988, at: 0.1, dur: 0.14 },
    { freq: 1318.5, at: 0.22, dur: 0.28 },
  ];

  for (const note of notes) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = note.freq;
    gain.gain.setValueAtTime(0.0001, now + note.at);
    gain.gain.exponentialRampToValueAtTime(0.16, now + note.at + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + note.at + note.dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + note.at);
    osc.stop(now + note.at + note.dur + 0.02);
  }

  window.setTimeout(() => void ctx.close(), 800);
}

export function pulseScanHaptic() {
  if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
    navigator.vibrate([18, 40, 28]);
  }
}
