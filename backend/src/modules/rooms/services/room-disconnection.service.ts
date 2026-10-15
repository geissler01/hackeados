import { Injectable, Logger } from '@nestjs/common';
import { GameRoom } from '../models/game-room.model';
import { PlayerLiveState } from '../models/player-state.model';

export const HOST_GRACE_PERIOD_MS = 20_000; // 20 segundos
export const ABANDONED_TIMEOUT_MS = 300_000; // 5 minutos (300s)

@Injectable()
export class RoomDisconnectionService {
  private readonly logger = new Logger(RoomDisconnectionService.name);
  private hostTimers: Map<string, NodeJS.Timeout> = new Map();
  private abandonedTimers: Map<string, NodeJS.Timeout> = new Map();

  scheduleHostGrace(
    room: GameRoom,
    onPromote: (newHost: PlayerLiveState) => void,
    onDestroy: () => void,
  ): void {
    this.cancelHostTimer(room.roomCode);
    this.logger.warn(`Host desconectado en sala ${room.roomCode}. Esperando 20s de gracia...`);

    const timer = setTimeout(() => {
      this.hostTimers.delete(room.roomCode);
      const nextPlayer = Array.from(room.players.values()).find((p) => p.connected);

      if (nextPlayer) {
        room.hostSocketId = nextPlayer.socketId;
        this.logger.log(`Host traspasado a ${nextPlayer.nickname} en sala ${room.roomCode}`);
        onPromote(nextPlayer);
      } else {
        this.scheduleAbandoned(room, onDestroy);
      }
    }, HOST_GRACE_PERIOD_MS);

    this.hostTimers.set(room.roomCode, timer);
  }

  scheduleAbandoned(room: GameRoom, onDestroy: () => void): void {
    if (this.abandonedTimers.has(room.roomCode)) return;
    this.logger.warn(`Sala ${room.roomCode} sin nodos activos. Auto-cierre en 5 minutos...`);

    const timer = setTimeout(() => {
      this.abandonedTimers.delete(room.roomCode);
      room.status = 'ENDED';
      this.logger.log(`Sala ${room.roomCode} destruida por inactividad tras 5 minutos.`);
      onDestroy();
    }, ABANDONED_TIMEOUT_MS);

    this.abandonedTimers.set(room.roomCode, timer);
  }

  cancelTimersOnReconnect(roomCode: string): void {
    this.cancelHostTimer(roomCode);
    this.cancelAbandonedTimer(roomCode);
  }

  cancelHostTimer(roomCode: string): void {
    const t = this.hostTimers.get(roomCode);
    if (t) {
      clearTimeout(t);
      this.hostTimers.delete(roomCode);
    }
  }

  cancelAbandonedTimer(roomCode: string): void {
    const t = this.abandonedTimers.get(roomCode);
    if (t) {
      clearTimeout(t);
      this.abandonedTimers.delete(roomCode);
    }
  }
}
