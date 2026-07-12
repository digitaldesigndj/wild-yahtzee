/**
 * Web Audio API synthesizer for Wild Yahtzee sound effects.
 * Synthesizes retro arcade-style tones programmatically.
 */

class AudioSynth {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    // Resume context if suspended (browser security policies)
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  playRoll() {
    const ctx = this.init();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Simulate tumbling dice with rapid low clicks
    const clicks = 5;
    for (let i = 0; i < clicks; i++) {
      const time = now + i * 0.1;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(120 - i * 15, time);
      osc.frequency.exponentialRampToValueAtTime(40, time + 0.08);

      gain.gain.setValueAtTime(0.15, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(time);
      osc.stop(time + 0.08);
    }
  }

  playHold() {
    const ctx = this.init();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.08); // G5

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  playWild() {
    const ctx = this.init();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Sparkling magic sound (arpeggio of fast, high notes)
    const notes = [587.33, 698.46, 880.00, 1046.50, 1396.91]; // D5, F5, A5, C6, F6
    notes.forEach((freq, i) => {
      const time = now + i * 0.06;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0.08, time);
      gain.gain.exponentialRampToValueAtTime(0.005, time + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(time);
      osc.stop(time + 0.25);
    });
  }

  playScore() {
    const ctx = this.init();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Harmonious major arpeggio
    const chord = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
    chord.forEach((freq, i) => {
      const time = now + i * 0.1;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, time + 0.3);

      gain.gain.setValueAtTime(0.1, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(time);
      osc.stop(time + 0.3);
    });
  }

  playYahtzee() {
    const ctx = this.init();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Triumphant fanfare!
    const notes = [
      { f: 523.25, d: 0.15 }, // C5
      { f: 523.25, d: 0.15 }, // C5
      { f: 523.25, d: 0.15 }, // C5
      { f: 659.25, d: 0.3 },  // E5
      { f: 587.33, d: 0.3 },  // D5
      { f: 783.99, d: 0.6 },  // G5
    ];

    let current = now;
    notes.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, current);

      gain.gain.setValueAtTime(0.12, current);
      gain.gain.exponentialRampToValueAtTime(0.005, current + note.d);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(current);
      osc.stop(current + note.d);

      current += note.d - 0.05;
    });
  }

  playGameOver() {
    const ctx = this.init();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Extended celebratory theme
    const melody = [
      440.00, 493.88, 523.25, 587.33, 659.25, 698.46, 783.99, 880.00
    ]; // A4 to A5 ascending scale

    melody.forEach((freq, i) => {
      const time = now + i * 0.12;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0.1, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(time);
      osc.stop(time + 0.4);
    });
  }
}

export const audio = new AudioSynth();
