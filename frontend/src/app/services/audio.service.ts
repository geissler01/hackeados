import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AudioService {
  private ctx?: AudioContext;

  private initCtx(): AudioContext {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    return this.ctx!;
  }

  playTone(freq: number, type: OscillatorType, duration: number, gainValue = 0.1): void {
    try {
      const ctx = this.initCtx();
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(gainValue, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Ignorar si el audio está silenciado por el navegador
    }
  }

  playCorrect(): void {
    this.playTone(523.25, 'triangle', 0.1, 0.15); // C5
    setTimeout(() => this.playTone(659.25, 'triangle', 0.15, 0.15), 100); // E5
  }

  playWrong(): void {
    this.playTone(180, 'sawtooth', 0.25, 0.2);
  }

  playCardFlip(): void {
    this.playTone(800, 'sine', 0.08, 0.1);
  }

  playBreachAlarm(): void {
    this.playTone(880, 'sawtooth', 0.15, 0.2);
    setTimeout(() => this.playTone(440, 'sawtooth', 0.15, 0.2), 160);
  }

  playWin(): void {
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 'square', 0.2, 0.15), idx * 120);
    });
  }
}
