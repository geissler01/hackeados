import { describe, it, expect, beforeEach } from 'vitest';
import { CardsEngineService } from './cards-engine.service';

describe('CardsEngineService', () => {
  let service: CardsEngineService;

  beforeEach(() => {
    service = new CardsEngineService();
  });

  it('debe devolver una recompensa válida al sacar carta', () => {
    const reward = service.drawCard(100, 200);
    expect(['POINTS', 'MULTIPLIER', 'NOTHING', 'HACK']).toContain(reward.type);
    expect(reward.label).toBeDefined();
  });

  it('debe generar exactamente 3 cartas al llamar drawThreeCards con la elegida en la posición indicada', () => {
    const { chosenReward, cards } = service.drawThreeCards(100, 200, 1);
    expect(cards).toHaveLength(3);
    expect(cards[1]).toEqual(chosenReward);
    cards.forEach((c) => expect(['POINTS', 'MULTIPLIER', 'NOTHING', 'HACK']).toContain(c.type));
  });

  it('debe aplicar puntos fijos correctamente al saldo', () => {
    const newScore = service.applyReward(100, { type: 'POINTS', value: 50, label: '+50' });
    expect(newScore).toBe(150);
  });

  it('debe multiplicar correctamente el saldo actual', () => {
    const doubled = service.applyReward(200, { type: 'MULTIPLIER', value: 2, label: 'x2' });
    expect(doubled).toBe(400);

    const tripled = service.applyReward(300, { type: 'MULTIPLIER', value: 3, label: 'x3' });
    expect(tripled).toBe(900);

    const quad = service.applyReward(250, { type: 'MULTIPLIER', value: 4, label: 'x4' });
    expect(quad).toBe(1000);

    const penta = service.applyReward(100, { type: 'MULTIPLIER', value: 5, label: 'x5' });
    expect(penta).toBe(500);
  });

  it('si el saldo es 0 y sale multiplicador debe asignar una base de créditos (20 * mult)', () => {
    const fromZeroX2 = service.applyReward(0, { type: 'MULTIPLIER', value: 2, label: 'x2' });
    expect(fromZeroX2).toBe(40);

    const fromZeroX5 = service.applyReward(0, { type: 'MULTIPLIER', value: 5, label: 'x5' });
    expect(fromZeroX5).toBe(100);
  });
});
