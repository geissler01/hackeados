import { Injectable, signal } from '@angular/core';
import { SocketService } from './socket.service';
import { HapticsService } from './haptics.service';
import { AudioService } from './audio.service';

@Injectable({ providedIn: 'root' })
export class PlayerDuelService {
  readonly hackCountdown = signal(5);
  readonly hackOptions = signal<any>(null);
  readonly victimMinigame = signal<'matrix' | 'simon' | 'slider'>('matrix');
  private hackTimer?: any;

  constructor(
    private socket: SocketService,
    private haptics: HapticsService,
    private audio: AudioService,
  ) {}

  startHacking(data: any, onTimeout: () => void): void {
    this.hackOptions.set(data);
    this.hackCountdown.set(5);
    clearInterval(this.hackTimer);
    this.hackTimer = setInterval(() => {
      this.hackCountdown.update((c) => {
        if (c <= 1) {
          this.cancelHacking();
          this.socket.emit('hack:timeout', { targetSocketId: data.targetSocketId });
          onTimeout();
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  }

  cancelHacking(): void {
    clearInterval(this.hackTimer);
  }

  async submitGuess(guess: string): Promise<{ success: boolean; stolenPoints?: number }> {
    this.cancelHacking();
    const targetSocketId = this.hackOptions()?.targetSocketId;
    return await this.socket.emitWithAck('hack:guess_password', { targetSocketId, guessedPassword: guess });
  }

  triggerDefense(minigameType: 'matrix' | 'simon' | 'slider'): void {
    this.victimMinigame.set(minigameType);
    this.haptics.breachAlarm();
    this.audio.playBreachAlarm();
  }

  completeDefense(): void {
    this.socket.emit('hack:defense_complete');
  }
}
