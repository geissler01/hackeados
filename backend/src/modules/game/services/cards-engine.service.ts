import { Injectable } from '@nestjs/common';

export interface CardReward {
  type: 'POINTS' | 'MULTIPLIER' | 'NOTHING' | 'HACK';
  value: number;
  label: string;
}

@Injectable()
export class CardsEngineService {
  drawCard(currentScore: number, timeRemaining: number): CardReward {
    const isLateGame = timeRemaining <= 90;
    const roll = Math.random() * 100;

    if (isLateGame) {
      if (roll < 15) return { type: 'POINTS', value: 50, label: '+50 Créditos' };
      if (roll < 30) return { type: 'POINTS', value: 100, label: '+100 Créditos' };
      if (roll < 50) return { type: 'MULTIPLIER', value: 2, label: '¡Duplicador x2!' };
      if (roll < 68) return { type: 'MULTIPLIER', value: 3, label: '¡Triplicador x3!' };
      if (roll < 80) return { type: 'MULTIPLIER', value: 4, label: '¡Cuadruplicador x4!' };
      if (roll < 88) return { type: 'MULTIPLIER', value: 5, label: '¡Pentamultiplicador x5!' };
      if (roll < 97) return { type: 'HACK', value: 0, label: '¡HACK INICIADO!' };
      return { type: 'NOTHING', value: 0, label: '0 Créditos (Vacío)' };
    }

    if (roll < 30) return { type: 'POINTS', value: 20, label: '+20 Créditos' };
    if (roll < 52) return { type: 'POINTS', value: 50, label: '+50 Créditos' };
    if (roll < 64) return { type: 'POINTS', value: 100, label: '+100 Créditos' };
    if (roll < 76) return { type: 'MULTIPLIER', value: 2, label: '¡Duplicador x2!' };
    if (roll < 85) return { type: 'MULTIPLIER', value: 3, label: '¡Triplicador x3!' };
    if (roll < 91) return { type: 'MULTIPLIER', value: 4, label: '¡Cuadruplicador x4!' };
    if (roll < 95) return { type: 'MULTIPLIER', value: 5, label: '¡Pentamultiplicador x5!' };
    if (roll < 98) return { type: 'HACK', value: 0, label: '¡HACK INICIADO!' };
    return { type: 'NOTHING', value: 0, label: '0 Créditos (Vacío)' };
  }

  drawThreeCards(currentScore: number, timeRemaining: number, chosenSlot: number = 0): { chosenReward: CardReward; cards: CardReward[] } {
    const chosenReward = this.drawCard(currentScore, timeRemaining);
    const cards: CardReward[] = [
      this.drawCard(currentScore, timeRemaining),
      this.drawCard(currentScore, timeRemaining),
      this.drawCard(currentScore, timeRemaining),
    ];
    const idx = Math.max(0, Math.min(chosenSlot, 2));
    cards[idx] = chosenReward;
    return { chosenReward, cards };
  }

  applyReward(currentScore: number, reward: CardReward): number {
    switch (reward.type) {
      case 'POINTS': return currentScore + reward.value;
      case 'MULTIPLIER': return currentScore === 0 ? reward.value * 20 : currentScore * reward.value;
      default: return currentScore;
    }
  }
}
