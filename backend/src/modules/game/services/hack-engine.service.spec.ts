import { describe, it, expect, beforeEach } from 'vitest';
import { HackEngineService } from './hack-engine.service';
import { GameRoom } from '../../rooms/models/game-room.model';
import { PlayerLiveState } from '../../rooms/models/player-state.model';

describe('HackEngineService', () => {
  let service: HackEngineService;
  let room: GameRoom;

  beforeEach(() => {
    service = new HackEngineService();
    room = new GameRoom('TEST01', 'host', 'tecnologia');
  });

  it('debe generar exactamente 3 opciones de contraseña incluyendo la real de la víctima', () => {
    const attacker = new PlayerLiveState('sock-1', 'HACKER', 1);
    const victim = new PlayerLiveState('sock-2', 'VICTIM', 2);
    victim.password = 'FIREWALL_X';
    victim.score = 1000;

    room.players.set(attacker.socketId, attacker);
    room.players.set(victim.socketId, victim);

    const hackData = service.selectTargetAndOptions(room, attacker.socketId);
    expect(hackData).not.toBeNull();
    expect(hackData?.options).toHaveLength(3);
    expect(hackData?.options).toContain('FIREWALL_X');
    expect(['matrix', 'simon', 'slider']).toContain(hackData?.minigameType);
  });

  it('debe sustraer exactamente el 25% de créditos a la víctima y sumarlos al atacante', () => {
    const attacker = new PlayerLiveState('sock-1', 'HACKER', 1);
    const victim = new PlayerLiveState('sock-2', 'VICTIM', 2);
    attacker.score = 500;
    victim.score = 2000;

    const stolen = service.resolveHackSuccess(attacker, victim, 0.25);
    expect(stolen).toBe(500);
    expect(victim.score).toBe(1500);
    expect(attacker.score).toBe(1000);
    expect(attacker.hacksSucceeded).toBe(1);
    expect(victim.timesHacked).toBe(1);
  });
});
