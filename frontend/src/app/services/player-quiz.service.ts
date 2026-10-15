import { Injectable, signal } from '@angular/core';
import { SocketService } from './socket.service';
import { AudioService } from './audio.service';
import { HapticsService } from './haptics.service';

@Injectable({ providedIn: 'root' })
export class PlayerQuizService {
  readonly currentQuestion = signal<any>(null);
  readonly score = signal(0);

  constructor(
    private socket: SocketService,
    private audio: AudioService,
    private haptics: HapticsService,
  ) {}

  async requestNextQuestion(): Promise<any> {
    const q: any = await this.socket.emitWithAck('quiz:request_question');
    if (q) this.currentQuestion.set(q);
    return q;
  }

  async submitAnswer(questionId: string, answerIndex: number): Promise<boolean> {
    const res: any = await this.socket.emitWithAck('quiz:submit_answer', { questionId, answerIndex });
    if (res?.correct) {
      this.audio.playCorrect();
      this.haptics.success();
      return true;
    }
    this.audio.playWrong();
    this.haptics.error();
    return false;
  }

  async pickCard(slot: number): Promise<any> {
    this.audio.playCardFlip();
    const res: any = await this.socket.emitWithAck('cards:pick', { slot });
    if (res?.newScore !== undefined) this.score.set(res.newScore);
    return res;
  }
}
