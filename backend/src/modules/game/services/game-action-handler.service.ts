import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { RoomsService } from '../../rooms/rooms.service';
import { GameCoordinatorService } from './game-coordinator.service';
import { HackEngineService } from './hack-engine.service';
import { GameTickerService } from './game-ticker.service';

@Injectable()
export class GameActionHandlerService {
  constructor(
    private readonly rooms: RoomsService,
    private readonly coordinator: GameCoordinatorService,
    private readonly hackEngine: HackEngineService,
    private readonly ticker: GameTickerService,
  ) {}

  requestQuestion(client: Socket) {
    const room = this.rooms.getRoomBySocket(client.id);
    const p = room?.players.get(client.id);
    if (!room || !p || room.status !== 'PLAYING') return null;
    const q = room.questionsPool[p.currentQuestionIndex % room.questionsPool.length];
    p.currentQuestionIndex += 1;
    return { id: q.id, questionText: q.questionText, options: q.options };
  }

  submitAnswer(client: Socket, data: { questionId: string; answerIndex: number }) {
    const room = this.rooms.getRoomBySocket(client.id);
    const p = room?.players.get(client.id);
    return room && p ? this.coordinator.processAnswer(p, room, data.questionId, data.answerIndex) : null;
  }

  pickCard(server: Server, client: Socket, data?: { slot?: number }) {
    const room = this.rooms.getRoomBySocket(client.id);
    const p = room?.players.get(client.id);
    if (!room || !p) return null;

    const slot = typeof data?.slot === 'number' ? data.slot : 0;
    const res = this.coordinator.pickCard(p, room, slot);
    if (res.reward.type === 'MULTIPLIER') {
      this.ticker.broadcastMultiplier(server, room.roomCode, p.nickname, res.reward.value);
    } else if (res.hackData) {
      const victim = room.players.get(res.hackData.targetSocketId);
      if (victim) {
        victim.isDefending = true;
        victim.activeAttackerSocketId = p.socketId;
        p.activeTargetSocketId = victim.socketId;
      }
      this.ticker.broadcastHackInitiated(server, room.roomCode, p.nickname, res.hackData.targetNickname);
      server.to(res.hackData.targetSocketId).emit('hack:alert_victim', {
        attackerNickname: p.nickname,
        minigameType: res.hackData.minigameType,
        durationSeconds: 5,
      });
    }
    return res;
  }

  hackGuess(server: Server, client: Socket, data: { targetSocketId: string; guessedPassword: string }) {
    const room = this.rooms.getRoomBySocket(client.id);
    const attacker = room?.players.get(client.id);
    const victim = room?.players.get(data.targetSocketId);
    if (!attacker || !victim) return { success: false, stolenPoints: 0 };

    attacker.activeTargetSocketId = undefined;
    const wasDefending = victim.isDefending;
    victim.isDefending = false;
    victim.activeAttackerSocketId = undefined;
    const guess = (data.guessedPassword || '').trim().toUpperCase();
    const real = (victim.password || '').trim().toUpperCase();

    if (wasDefending && real === guess) {
      const stolen = this.hackEngine.resolveHackSuccess(attacker, victim);
      this.ticker.broadcastHackSuccess(server, room.roomCode, attacker.nickname, victim.nickname, stolen);
      server.to(victim.socketId).emit('hack:breach_confirmed', { stolenPoints: stolen, attackerNickname: attacker.nickname });
      return { success: true, stolenPoints: stolen };
    }

    server.to(victim.socketId).emit('hack:defense_cleared', { success: true, message: `${attacker.nickname} falló la clave` });
    return { success: false, stolenPoints: 0, message: 'Clave incorrecta' };
  }

  defenseComplete(server: Server, client: Socket) {
    const room = this.rooms.getRoomBySocket(client.id);
    const victim = room?.players.get(client.id);
    if (victim) {
      victim.isDefending = false;
      const attackerId = victim.activeAttackerSocketId;
      victim.activeAttackerSocketId = undefined;
      victim.activeMinigame = undefined;

      this.ticker.broadcastDefenseSuccess(server, room.roomCode, victim.nickname);
      client.emit('hack:defense_cleared', { success: true });

      if (attackerId) {
        const attacker = room.players.get(attackerId);
        if (attacker) attacker.activeTargetSocketId = undefined;
        server.to(attackerId).emit('hack:aborted', { reason: 'DEFENSE_BLOCKED', message: `${victim.nickname} bloqueó tu señal!` });
      }
    }
  }

  hackTimeout(server: Server, client: Socket, data?: { targetSocketId?: string }) {
    const room = this.rooms.getRoomBySocket(client.id);
    const attacker = room?.players.get(client.id);
    const targetId = data?.targetSocketId || attacker?.activeTargetSocketId;
    const victim = targetId ? room?.players.get(targetId) : undefined;

    if (attacker) attacker.activeTargetSocketId = undefined;
    if (victim && victim.isDefending) {
      victim.isDefending = false;
      victim.activeAttackerSocketId = undefined;
      victim.activeMinigame = undefined;
      server.to(victim.socketId).emit('hack:defense_cleared', { success: true, message: 'Ataque expirado' });
    }
    return { success: false, message: 'Tiempo agotado' };
  }
}
