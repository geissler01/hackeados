import { Component, Output, EventEmitter, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-defense-simon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="simon-card">
      <div class="simon-header">
        <span class="alert-tag">¡SECUENCIA DE FRECUENCIA!</span>
        <p>Progreso: {{ playerIndex() }} / 4</p>
      </div>
      <div class="simon-grid">
        @for (color of colors; track color.id) {
          <button
            class="simon-btn"
            [style.background]="activeColor() === color.id ? color.hex : color.darkHex"
            [style.borderColor]="color.hex"
            [disabled]="isShowingSequence()"
            (click)="onPress(color.id)"
          >
            {{ color.name }}
          </button>
        }
      </div>
    </div>
  `,
  styles: [`
    .simon-card { background: #1a0508; border: 2px solid #ff003c; padding: 16px; border-radius: 8px; text-align: center; }
    .simon-header { margin-bottom: 12px; font-family: 'JetBrains Mono', monospace; }
    .alert-tag { color: #ff003c; font-weight: 800; font-size: 14px; }
    .simon-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; max-width: 260px; margin: 0 auto; }
    .simon-btn {
      height: 70px; border-radius: 8px; font-family: 'JetBrains Mono', monospace;
      font-weight: 700; color: #fff; cursor: pointer; border-width: 2px; border-style: solid;
      transition: all 0.1s ease;
    }
  `],
})
export class DefenseSimonComponent implements OnInit {
  @Output() completed = new EventEmitter<void>();
  readonly colors = [
    { id: 0, name: 'VERDE', hex: '#00ff88', darkHex: '#003d20' },
    { id: 1, name: 'CIAN', hex: '#00e5ff', darkHex: '#00373d' },
    { id: 2, name: 'ÁMBAR', hex: '#ffb700', darkHex: '#4d3700' },
    { id: 3, name: 'MAGENTA', hex: '#ff007f', darkHex: '#4d0026' },
  ];

  readonly sequence = signal<number[]>([]);
  readonly playerIndex = signal<number>(0);
  readonly activeColor = signal<number | null>(null);
  readonly isShowingSequence = signal<boolean>(true);

  ngOnInit(): void {
    const seq = Array.from({ length: 4 }, () => Math.floor(Math.random() * 4));
    this.sequence.set(seq);
    this.playSequence();
  }

  playSequence(): void {
    this.isShowingSequence.set(true);
    const seq = this.sequence();
    seq.forEach((colorId, i) => {
      setTimeout(() => this.activeColor.set(colorId), i * 450);
      setTimeout(() => this.activeColor.set(null), i * 450 + 300);
    });
    setTimeout(() => this.isShowingSequence.set(false), seq.length * 450 + 100);
  }

  onPress(colorId: number): void {
    if (this.isShowingSequence()) return;
    const target = this.sequence()[this.playerIndex()];

    if (colorId === target) {
      const nextIndex = this.playerIndex() + 1;
      this.playerIndex.set(nextIndex);
      if (nextIndex === 4) {
        this.completed.emit();
      }
    } else {
      this.playerIndex.set(0);
      this.playSequence();
    }
  }
}
