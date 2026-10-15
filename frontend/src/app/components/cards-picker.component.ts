import { Component, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface CardReward {
  type: 'POINTS' | 'MULTIPLIER' | 'NOTHING' | 'HACK';
  value: number;
  label: string;
}

@Component({
  selector: 'app-cards-picker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cards-wrapper">
      <h3 class="cards-title font-mono">> SELECCIONA UNA TARJETA DE SEGURIDAD _</h3>
      <div class="cards-grid">
        @for (slot of [0, 1, 2]; track slot) {
          <div
            class="card-container"
            [class.flipped]="isFlipped(slot)"
            [class.disabled]="selectedSlot() !== null && selectedSlot() !== slot && !allFlipped()"
            (click)="onSelect(slot)"
          >
            <div class="card-inner">
              <div class="card-face card-front">
                <div class="chip-icon">🔒</div>
                <div class="chip-band font-mono">CHIP-0{{ slot + 1 }}</div>
                <div class="circuit-lines"></div>
                <div class="card-label font-mono">[ DESCIFRAR ]</div>
              </div>
              <div class="card-face card-back" [class.chosen]="selectedSlot() === slot" [ngClass]="getCardType(slot)">
                <div class="revealed-icon">{{ getCardIcon(slot) }}</div>
                <div class="revealed-text font-mono">{{ getCardLabel(slot) }}</div>
                @if (selectedSlot() === slot) { <div class="chosen-badge font-mono">[ TU ELECCIÓN ]</div> }
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styleUrls: ['./cards-picker.component.css'],
})
export class CardsPickerComponent {
  @Output() pick = new EventEmitter<number>();
  readonly selectedSlot = signal<number | null>(null);
  readonly chosenFlipped = signal(false);
  readonly allFlipped = signal(false);
  readonly revealedCards = signal<CardReward[] | null>(null);

  onSelect(slot: number): void {
    if (this.selectedSlot() !== null) return;
    this.selectedSlot.set(slot);
    this.pick.emit(slot);
  }

  reveal(allCards: CardReward[]): void {
    this.revealedCards.set(allCards);
    this.chosenFlipped.set(true);
    setTimeout(() => this.allFlipped.set(true), 350);
  }

  isFlipped(slot: number): boolean {
    return (this.selectedSlot() === slot && this.chosenFlipped()) || this.allFlipped();
  }

  getCardIcon(slot: number): string {
    const card = this.revealedCards()?.[slot];
    if (!card) return '🔒';
    if (card.type === 'MULTIPLIER') return '⚡';
    if (card.type === 'POINTS') return '💰';
    if (card.type === 'HACK') return '🚨';
    return '💀';
  }

  getCardLabel(slot: number): string {
    return this.revealedCards()?.[slot]?.label || 'DESCIFRANDO...';
  }

  getCardType(slot: number): string {
    return (this.revealedCards()?.[slot]?.type || 'points').toLowerCase();
  }
}
