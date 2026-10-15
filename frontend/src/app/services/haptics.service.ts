import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class HapticsService {
  vibrate(pattern: number | number[]): void {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Fallback silencioso si el navegador bloquea la vibración
      }
    }
  }

  success(): void {
    this.vibrate(40);
  }

  error(): void {
    this.vibrate([80, 50, 80]);
  }

  breachAlarm(): void {
    this.vibrate([150, 100, 150, 100, 300]);
  }
}
