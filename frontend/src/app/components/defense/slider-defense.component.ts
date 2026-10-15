import { Component, Output, EventEmitter, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-defense-slider',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="slider-card">
      <div class="slider-header">
        <span class="alert-tag">¡CALIBRA LA FRECUENCIA!</span>
        <p>Detén la aguja dentro de la zona verde</p>
      </div>
      <div class="track">
        <div class="green-zone"></div>
        <div class="needle" [style.left.%]="position()"></div>
      </div>
      <button class="btn-lock" (click)="onLock()">
        [ BLOQUEAR SEÑAL ]
      </button>
    </div>
  `,
  styles: [`
    .slider-card { background: #1a0508; border: 2px solid #ff003c; padding: 16px; border-radius: 8px; text-align: center; }
    .slider-header { margin-bottom: 16px; font-family: 'JetBrains Mono', monospace; }
    .alert-tag { color: #ff003c; font-weight: 800; font-size: 14px; }
    .track {
      position: relative; height: 36px; background: #2a0b10; border: 1px solid #ff003c;
      border-radius: 18px; margin: 16px 0; overflow: hidden;
    }
    .green-zone { position: absolute; left: 35%; width: 30%; height: 100%; background: rgba(0, 255, 136, 0.4); border: 1px dashed #00ff88; }
    .needle { position: absolute; top: 0; width: 6px; height: 100%; background: #fff; transform: translateX(-50%); box-shadow: 0 0 8px #fff; }
    .btn-lock {
      width: 100%; background: #ff003c; color: #fff; border: none; padding: 14px;
      border-radius: 6px; font-weight: 800; font-family: 'JetBrains Mono', monospace; cursor: pointer;
    }
    .btn-lock:active { transform: scale(0.98); }
  `],
})
export class DefenseSliderComponent implements OnInit, OnDestroy {
  @Output() completed = new EventEmitter<void>();
  readonly position = signal<number>(0);
  private direction = 1;
  private intervalId?: any;

  ngOnInit(): void {
    this.intervalId = setInterval(() => {
      let next = this.position() + this.direction * 3.5;
      if (next >= 100) { next = 100; this.direction = -1; }
      if (next <= 0) { next = 0; this.direction = 1; }
      this.position.set(next);
    }, 25);
  }

  ngOnDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  onLock(): void {
    const pos = this.position();
    if (pos >= 35 && pos <= 65) {
      if (this.intervalId) clearInterval(this.intervalId);
      this.completed.emit();
    }
  }
}
