import { Injectable } from '@nestjs/common';
import { RoomsService } from '../../rooms/rooms.service';
import { QuestionsService } from '../../questions/questions.service';
import { CardsEngineService, CardReward } from './cards-engine.service';
import { HackEngineService, HackTargetData } from './hack-engine.service';
import { GameRoom } from '../../rooms/models/game-room.model';
import { PlayerLiveState } from '../../rooms/models/player-state.model';

@Injectable()
export class GameCoordinatorService {
  constructor(
    private readonly roomsService: RoomsService,
    private readonly questionsService: QuestionsService,
    private readonly cardsEngine: CardsEngineService,
    private readonly hackEngine: HackEngineService,
  ) {}

  async startGame(roomCode: string): Promise<GameRoom> {
    const room = this.roomsService.getRoom(roomCode);
    if (!room) throw new Error('Sala no encontrada');

    room.questionsPool = await this.questionsService.loadQuestionsForMatch(room.categoryId);
    room.status = 'PASSWORD_SETUP';
    return room;
  }

  processAnswer(player: PlayerLiveState, room: GameRoom, questionId: string, answerIndex: number) {
    const question = room.questionsPool.find((q) => q.id === questionId);
    if (!question) return { correct: false, correctAnswerIndex: 0 };

    player.questionsAnswered += 1;
    const isCorrect = question.correctIndex === answerIndex;
    if (isCorrect) player.questionsCorrect += 1;
    return { correct: isCorrect, correctAnswerIndex: question.correctIndex };
  }

  pickCard(player: PlayerLiveState, room: GameRoom, chosenSlot: number = 0): { reward: CardReward; allCards: CardReward[]; newScore: number; hackData?: HackTargetData } {
    const { chosenReward, cards } = this.cardsEngine.drawThreeCards(player.score, room.timeRemaining, chosenSlot);
    player.score = this.cardsEngine.applyReward(player.score, chosenReward);

    let hackData: HackTargetData | undefined;
    if (chosenReward.type === 'HACK') {
      const target = this.hackEngine.selectTargetAndOptions(room, player.socketId);
      if (target) {
        hackData = target;
        player.hacksAttempted += 1;
        const victim = room.players.get(target.targetSocketId);
        if (victim) {
          victim.isDefending = true;
          victim.activeMinigame = target.minigameType;
        }
      }
    }

    return { reward: chosenReward, allCards: cards, newScore: player.score, hackData };
  }
}
