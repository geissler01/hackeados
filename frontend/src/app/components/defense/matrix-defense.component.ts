import { Component, Output, EventEmitter, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-defense-matrix',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="matrix-card">
      <div class="matrix-header">
        <span class="alert-tag">¡PURGA EL FIREWALL!</span>
        <p>Toca en orden: <strong class="target-num">{{ currentExpected() }}</strong></p>
      </div>
      <div class="grid">
        @for (num of numbers(); track num) {
          <button
            class="cell"
            [class.cleared]="num < currentExpected()"
            (click)="onPress(num)"
          >
            {{ num < currentExpected() ? '✔' : num }}
          </button>
        }
      </div>
    </div>
  `,
  styles: [`
    .matrix-card { background: #1a0508; border: 2px solid #ff003c; padding: 16px; border-radius: 8px; text-align: center; }
    .matrix-header { margin-bottom: 12px; font-family: 'JetBrains Mono', monospace; }
    .alert-tag { color: #ff003c; font-weight: 800; font-size: 14px; text-transform: uppercase; }
    .target-num { color: #00ff88; font-size: 20px; }
    .grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }
    .cell {
      background: #2a0b10; color: #fff; border: 1px solid #ff003c; border-radius: 6px;
      font-size: 20px; font-weight: 700; height: 56px; font-family: 'JetBrains Mono', monospace;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
    }
    .cell.cleared { background: #00ff88; color: #0a0d0f; border-color: #00ff88; opacity: 0.6; }
  `],
})
export class DefenseMatrixComponent implements OnInit {
  @Output() completed = new EventEmitter<void>();
  readonly numbers = signal<number[]>([]);
  readonly currentExpected = signal<number>(1);

  ngOnInit(): void {
    const list = Array.from({ length: 10 }, (_, i) => i + 1).sort(() => Math.random() - 0.5);
    this.numbers.set(list);
  }

  onPress(num: number): void {
    if (num === this.currentExpected()) {
      if (num === 10) {
        this.completed.emit();
      } else {
        this.currentExpected.update((v) => v + 1);
      }
    } else if (num > this.currentExpected()) {
      // Error: reiniciar a 1
      this.currentExpected.set(1);
    }
  }
}
