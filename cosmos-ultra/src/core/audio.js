import { state } from "./state.js";

class AudioSystem {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.ambientOsc = null;
    this.ambientGain = null;
    this.started = false;
  }

  async start() {
    if (this.started || !state.get("settings.soundEnabled")) return;

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    this.ctx = new AudioContext();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.18;
    this.master.connect(this.ctx.destination);

    this.started = true;
    this.startAmbient();
  }

  startAmbient() {
    if (!this.ctx || this.ambientOsc) return;

    this.ambientOsc = this.ctx.createOscillator();
    this.ambientGain = this.ctx.createGain();

    this.ambientOsc.type = "sine";
    this.ambientOsc.frequency.value = 35;
    this.ambientGain.gain.value = 0.015;

    this.ambientOsc.connect(this.ambientGain);
    this.ambientGain.connect(this.master);
    this.ambientOsc.start();
  }

  stopAmbient() {
    if (!this.ambientOsc) return;
    this.ambientOsc.stop();
    this.ambientOsc.disconnect();
    this.ambientGain.disconnect();
    this.ambientOsc = null;
    this.ambientGain = null;
  }

  tone(frequency = 600, duration = 0.08, type = "triangle", gain = 0.06) {
    if (!this.ctx || !this.master || !state.get("settings.soundEnabled")) return;

    const osc = this.ctx.createOscillator();
    const amp = this.ctx.createGain();

    osc.type = type;
    osc.frequency.value = frequency;
    amp.gain.setValueAtTime(gain, this.ctx.currentTime);
    amp.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

    osc.connect(amp);
    amp.connect(this.master);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  click() {
    this.tone(600, 0.06, "triangle", 0.08);
  }

  refresh() {
    this.tone(440, 0.07, "sine", 0.05);
    setTimeout(() => this.tone(880, 0.07, "sine", 0.04), 80);
  }

  alert() {
    [0, 120, 240].forEach((delay) => {
      setTimeout(() => this.tone(220, 0.09, "square", 0.08), delay);
    });
  }

  achievement() {
    [261.63, 329.63, 392, 523.25].forEach((freq, index) => {
      setTimeout(() => this.tone(freq, 0.1, "triangle", 0.08), index * 110);
    });
  }

  error() {
    if (!this.ctx || !this.master) return;

    const osc = this.ctx.createOscillator();
    const amp = this.ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(220, this.ctx.currentTime + 0.2);
    amp.gain.setValueAtTime(0.08, this.ctx.currentTime);
    amp.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.22);

    osc.connect(amp);
    amp.connect(this.master);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.22);
  }

  setEnabled(enabled) {
    state.set("settings.soundEnabled", enabled);

    if (!enabled) {
      this.stopAmbient();
      return;
    }

    this.start();
  }
}

export const audio = new AudioSystem();

document.addEventListener("pointerdown", () => audio.start(), { once: true });
document.addEventListener("click", (event) => {
  if (event.target.closest("button, a, input, select, textarea")) {
    audio.click();
  }
});
