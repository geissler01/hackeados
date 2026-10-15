import { Injectable, Logger } from '@nestjs/common';
import { GameRoom } from '../../rooms/models/game-room.model';

@Injectable()
export class GameTimerService {
  private readonly logger = new Logger(GameTimerService.name);
  private timers: Map<string, NodeJS.Timeout> = new Map();

  startTimer(
    room: GameRoom,
    onTick: (timeRemaining: number) => void,
    onEnd: () => void,
  ): void {
    this.stopTimer(room.roomCode);

    const interval = setInterval(() => {
      room.timeRemaining -= 1;
      onTick(room.timeRemaining);

      if (room.timeRemaining <= 0) {
        this.stopTimer(room.roomCode);
        room.status = 'ENDED';
        room.endedAt = Date.now();
        onEnd();
      }
    }, 1000);

    this.timers.set(room.roomCode, interval);
  }

  stopTimer(roomCode: string): void {
    const existing = this.timers.get(roomCode);
    if (existing) {
      clearInterval(existing);
      this.timers.delete(roomCode);
    }
  }
}
