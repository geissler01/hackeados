import { PlayerLiveState } from './player-state.model';
import { Question } from '../../../database/entities/question.entity';
import { generatePasswordsPool } from '../utils/password-generator.util';

export type RoomStatus = 'LOBBY' | 'PASSWORD_SETUP' | 'PLAYING' | 'ENDED';

export class GameRoom {
  roomCode: string;
  hostSocketId: string;
  categoryId: string;
  theme: 'matrix-emerald' | 'cyber-arcade' | 'amber-crt' = 'matrix-emerald';
  durationSeconds: number = 300;
  timeRemaining: number = 300;
  status: RoomStatus = 'LOBBY';
  createdAt: number = Date.now();
  startedAt?: number;
  endedAt?: number;

  questionsPool: Question[] = [];
  players: Map<string, PlayerLiveState> = new Map();
  passwordsPool: string[] = [];

  constructor(roomCode: string, hostSocketId: string, categoryId: string, durationSeconds: number = 300) {
    this.roomCode = roomCode;
    this.hostSocketId = hostSocketId;
    this.categoryId = categoryId;
    this.durationSeconds = durationSeconds;
    this.timeRemaining = durationSeconds;
    this.passwordsPool = generatePasswordsPool(35);
  }

  getLeaderboard() {
    return Array.from(this.players.values())
      .sort((a, b) => b.score - a.score)
      .map((p, index) => ({
        rank: index + 1,
        nickname: p.nickname,
        avatarId: p.avatarId,
        score: p.score,
        accuracy: p.accuracy,
        isDefending: p.isDefending,
      }));
  }
}
