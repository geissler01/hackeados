export class PlayerLiveState {
  socketId: string;
  nickname: string;
  avatarId: number;
  score: number = 0;
  password: string = '';
  questionsAnswered: number = 0;
  questionsCorrect: number = 0;
  hacksAttempted: number = 0;
  hacksSucceeded: number = 0;
  timesHacked: number = 0;
  isDefending: boolean = false;
  activeMinigame?: 'matrix' | 'simon' | 'slider';
  activeAttackerSocketId?: string;
  activeTargetSocketId?: string;
  currentQuestionIndex: number = 0;
  connected: boolean = true;
  disconnectedAt?: number;

  constructor(socketId: string, nickname: string, avatarId: number = 1) {
    this.socketId = socketId;
    this.nickname = nickname.trim().toUpperCase().slice(0, 20);
    this.avatarId = Math.min(Math.max(avatarId, 1), 20);
  }

  get accuracy(): number {
    if (this.questionsAnswered === 0) return 0;
    return Number(((this.questionsCorrect / this.questionsAnswered) * 100).toFixed(2));
  }
}
