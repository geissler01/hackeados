import { Injectable } from '@nestjs/common';
import { GameRoom } from '../../rooms/models/game-room.model';
import { PlayerLiveState } from '../../rooms/models/player-state.model';

export interface HackTargetData {
  targetSocketId: string;
  targetNickname: string;
  targetScore: number;
  options: string[]; // 3 opciones de clave
  minigameType: 'matrix' | 'simon' | 'slider';
}

@Injectable()
export class HackEngineService {
  selectTargetAndOptions(room: GameRoom, attackerSocketId: string): HackTargetData | null {
    const candidates: PlayerLiveState[] = Array.from(room.players.values())
      .filter((p: PlayerLiveState) => p.socketId !== attackerSocketId && p.connected && !p.isDefending);

    if (candidates.length === 0) return null;

    candidates.sort((a: PlayerLiveState, b: PlayerLiveState) => b.score - a.score);
    const target: PlayerLiveState = candidates[Math.floor(Math.random() * Math.min(candidates.length, 3))];

    // Asegurar que la víctima siempre tenga una contraseña asignada de la sala
    if (!target.password) {
      target.password = room.passwordsPool[Math.floor(Math.random() * room.passwordsPool.length)];
    }

    const normalizedTarget = target.password.trim().toUpperCase();
    const distractors = room.passwordsPool
      .filter((p) => p && p.trim().toUpperCase() !== normalizedTarget)
      .sort(() => Math.random() - 0.5)
      .slice(0, 2);

    const options = [target.password, ...distractors].sort(() => Math.random() - 0.5);

    // Asignar aleatoriamente 1 de los 3 minijuegos
    const minigames: ('matrix' | 'simon' | 'slider')[] = ['matrix', 'simon', 'slider'];
    const minigameType = minigames[Math.floor(Math.random() * minigames.length)];

    return {
      targetSocketId: target.socketId,
      targetNickname: target.nickname,
      targetScore: target.score,
      options,
      minigameType,
    };
  }

  resolveHackSuccess(attacker: PlayerLiveState, victim: PlayerLiveState, percentage: number = 0.25): number {
    const stolenPoints = Math.floor(victim.score * percentage);
    victim.score = Math.max(0, victim.score - stolenPoints);
    attacker.score += stolenPoints;
    attacker.hacksSucceeded += 1;
    victim.timesHacked += 1;
    return stolenPoints;
  }
}
