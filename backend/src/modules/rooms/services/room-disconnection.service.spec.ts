import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RoomDisconnectionService, HOST_GRACE_PERIOD_MS, ABANDONED_TIMEOUT_MS } from './room-disconnection.service';
import { GameRoom } from '../models/game-room.model';
import { PlayerLiveState } from '../models/player-state.model';

describe('RoomDisconnectionService', () => {
  let service: RoomDisconnectionService;
  let room: GameRoom;

  beforeEach(() => {
    vi.useFakeTimers();
    service = new RoomDisconnectionService();
    room = new GameRoom('TEST99', 'host-sock-1', 'tecnologia');
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debe esperar 20 segundos de gracia antes de traspasar el host al siguiente jugador', () => {
    const p1 = new PlayerLiveState('p1-sock', 'JUGADOR_1', 1);
    room.players.set('p1-sock', p1);

    const onPromote = vi.fn();
    const onDestroy = vi.fn();

    service.scheduleHostGrace(room, onPromote, onDestroy);

    vi.advanceTimersByTime(19_000);
    expect(onPromote).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1_500);
    expect(onPromote).toHaveBeenCalledWith(p1);
    expect(room.hostSocketId).toBe('p1-sock');
  });

  it('debe cancelar el temporizador de gracia si el host reconecta antes de 20s', () => {
    const onPromote = vi.fn();
    const onDestroy = vi.fn();

    service.scheduleHostGrace(room, onPromote, onDestroy);
    vi.advanceTimersByTime(10_000);

    service.cancelTimersOnReconnect(room.roomCode);
    vi.advanceTimersByTime(15_000);

    expect(onPromote).not.toHaveBeenCalled();
  });

  it('debe esperar 5 minutos antes de destruir una sala abandonada sin jugadores', () => {
    const onDestroy = vi.fn();
    service.scheduleAbandoned(room, onDestroy);

    vi.advanceTimersByTime(299_000); // 4 minutos 59s
    expect(onDestroy).not.toHaveBeenCalled();

    vi.advanceTimersByTime(2_000); // Supera 5 minutos (300s)
    expect(onDestroy).toHaveBeenCalled();
    expect(room.status).toBe('ENDED');
  });
});
