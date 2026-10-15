import { describe, it, expect, beforeEach } from 'vitest';
import { RoomsService } from './rooms.service';

describe('RoomsService', () => {
  let service: RoomsService;

  beforeEach(() => {
    service = new RoomsService();
  });

  it('debe crear una sala con código único de 6 caracteres', () => {
    const room = service.createRoom('host-123', { categoryId: 'tecnologia' });
    expect(room.roomCode).toHaveLength(6);
    expect(room.categoryId).toBe('tecnologia');
    expect(service.canStart(room.roomCode)).toBe(false);
  });

  it('debe registrar al host como jugador si isHostPlaying es true', () => {
    const room = service.createRoom('host-123', {
      categoryId: 'tecnologia',
      isHostPlaying: true,
      hostNickname: 'SUPER_HOST_2026',
      hostAvatarId: 5,
    });
    expect(room.players.size).toBe(1);
    const hostPlayer = room.players.get('host-123');
    expect(hostPlayer?.nickname).toBe('SUPER_HOST_2026');
  });

  it('debe permitir unirse con un apodo de hasta 20 caracteres', () => {
    const room = service.createRoom('host-123', { categoryId: 'tecnologia' });
    const longNick = 'CYBER_HACKER_PRO_99';
    const { player } = service.joinRoom('player-1', {
      roomCode: room.roomCode,
      nickname: longNick,
      avatarId: 3,
    });
    expect(player.nickname).toBe(longNick);
  });

  it('debe permitir iniciar con Host jugando + 1 jugador (total 2)', () => {
    const room = service.createRoom('host-123', { categoryId: 'tecnologia' });
    service.setHostPlayerRole(room.roomCode, 'host-123', true, 'ANFITRION_PAPA', 7);
    expect(room.players.size).toBe(1);
    expect(service.canStart(room.roomCode)).toBe(false);

    service.joinRoom('p1', { roomCode: room.roomCode, nickname: 'HACKER123', avatarId: 2 });
    expect(room.players.size).toBe(2);
    expect(service.canStart(room.roomCode)).toBe(true);

    // Si el host sale de modo jugador, vuelve a requerir otro jugador
    service.setHostPlayerRole(room.roomCode, 'host-123', false);
    expect(room.players.size).toBe(1);
    expect(service.canStart(room.roomCode)).toBe(false);
  });

  it('debe reconectar al Host con un nuevo socketId sin cambiar el código PIN', () => {
    const room = service.createRoom('old-host-sock', { categoryId: 'tecnologia' });
    const code = room.roomCode;
    const reconnected = service.reconnectHost(code, 'new-host-sock');
    expect(reconnected).toBeDefined();
    expect(reconnected?.roomCode).toBe(code);
    expect(reconnected?.hostSocketId).toBe('new-host-sock');
    expect(service.getRoomBySocket('new-host-sock')?.roomCode).toBe(code);
  });

  it('debe reconectar al Jugador por nickname actualizando su socket', () => {
    const room = service.createRoom('host', { categoryId: 'tecnologia' });
    service.joinRoom('old-sock-p1', { roomCode: room.roomCode, nickname: 'NEO_99', avatarId: 2 });

    const result = service.reconnectPlayer(room.roomCode, 'NEO_99', 'new-sock-p1');
    expect(result).toBeDefined();
    expect(result?.player.socketId).toBe('new-sock-p1');
    expect(room.players.get('new-sock-p1')?.nickname).toBe('NEO_99');
    expect(room.players.has('old-sock-p1')).toBe(false);
  });
});
