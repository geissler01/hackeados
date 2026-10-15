import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  template: `
    <div class="home-container">
      <div class="terminal-box">
        <h1 class="glitch-title">HACKEADOS</h1>
        <p class="subtitle">> SISTEMA DE TRIVIA COMPETITIVA PvP _</p>

        <div class="actions">
          <button class="btn-cyber btn-primary font-mono" (click)="router.navigate(['/join'])">
            [ UNIRSE A UNA PARTIDA ]
          </button>
          <button class="btn-cyber btn-secondary font-mono" (click)="router.navigate(['/host'])">
            [ CREAR SALA ]
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .home-container {
      display: flex; align-items: center; justify-content: center;
      min-height: 100vh; padding: 20px; background: radial-gradient(circle at center, #142028 0%, #0a0d0f 100%);
    }
    .terminal-box {
      max-width: 440px; width: 100%; background: var(--bg-surface);
      border: 1px solid var(--border-subtle); border-radius: 12px;
      padding: 36px 24px; text-align: center; box-shadow: 0 0 30px rgba(0, 255, 136, 0.1);
    }
    .glitch-title {
      font-family: 'JetBrains Mono', monospace; font-size: 38px;
      font-weight: 800; color: var(--accent-primary); letter-spacing: 2px; margin-bottom: 6px;
    }
    .subtitle { color: var(--text-muted); font-size: 13px; font-family: 'JetBrains Mono', monospace; margin-bottom: 32px; }
    .actions { display: flex; flex-direction: column; gap: 14px; }
    .btn-primary { background: var(--accent-primary); color: var(--bg-app); font-size: 16px; }
    .btn-secondary { border-color: var(--border-subtle); color: var(--text-primary); font-size: 15px; }
  `],
})
export class HomePage {
  constructor(public router: Router) {}
}
