import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TickerMessage {
  text: string;
  type: 'hack' | 'defense' | 'reward' | 'info';
  timestamp: number;
}

@Component({
  selector: 'app-game-ticker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ticker-wrapper" *ngIf="messages && messages.length > 0">
      <div class="ticker-badge font-mono">LIVE</div>
      <div class="ticker-content font-mono" [ngClass]="latestMessage.type">
        {{ latestMessage.text }}
      </div>
    </div>
  `,
  styles: [`
    .ticker-wrapper {
      display: flex; align-items: center; gap: 8px;
      background: rgba(18, 24, 28, 0.95); border: 1px solid var(--border-subtle);
      border-radius: 6px; padding: 6px 12px; margin-bottom: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3); animation: fadeIn 0.3s ease-out;
    }
    .ticker-badge {
      background: var(--accent-danger); color: #fff; font-size: 10px;
      font-weight: bold; padding: 2px 6px; border-radius: 4px; letter-spacing: 1px;
    }
    .ticker-content {
      font-size: 12px; white-space: nowrap; overflow: hidden;
      text-overflow: ellipsis; flex: 1; color: var(--text-primary);
    }
    .ticker-content.hack { color: var(--accent-danger); font-weight: bold; }
    .ticker-content.defense { color: var(--accent-primary); }
    .ticker-content.reward { color: #ffb700; font-weight: bold; }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `],
})
export class GameTickerComponent {
  @Input() messages: TickerMessage[] = [];

  get latestMessage(): TickerMessage {
    return this.messages[this.messages.length - 1] || { text: '', type: 'info', timestamp: 0 };
  }
}
