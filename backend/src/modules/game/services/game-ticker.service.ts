import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

export type TickerEventType = 'hack' | 'defense' | 'reward' | 'info';

export interface GameEventPayload {
  text: string;
  type: TickerEventType;
  timestamp: number;
}

@Injectable()
export class GameTickerService {
  emit(server: Server, roomCode: string, text: string, type: TickerEventType = 'info'): void {
    const payload: GameEventPayload = { text, type, timestamp: Date.now() };
    server.to(roomCode).emit('game:event_broadcast', payload);
  }

  broadcastMultiplier(server: Server, roomCode: string, nickname: string, mult: number): void {
    this.emit(server, roomCode, `⚡ ${nickname} activó un Multiplicador x${mult}`, 'reward');
  }

  broadcastHackInitiated(server: Server, roomCode: string, attacker: string, victim: string): void {
    this.emit(server, roomCode, `⚠️ ${attacker} desplegó un ciberataque contra ${victim}`, 'hack');
  }

  broadcastHackSuccess(server: Server, roomCode: string, attacker: string, victim: string, pts: number): void {
    this.emit(server, roomCode, `🚨 ${attacker} hackeó el sistema de ${victim} (+${pts.toLocaleString()} PTS)`, 'hack');
  }

  broadcastDefenseSuccess(server: Server, roomCode: string, victim: string): void {
    this.emit(server, roomCode, `🛡️ ${victim} repelió la intrusión con su Firewall`, 'defense');
  }
}
