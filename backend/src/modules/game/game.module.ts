import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { GameTimerService } from './services/game-timer.service';
import { CardsEngineService } from './services/cards-engine.service';
import { HackEngineService } from './services/hack-engine.service';
import { GameCoordinatorService } from './services/game-coordinator.service';
import { GameTickerService } from './services/game-ticker.service';
import { GameDisconnectHandlerService } from './services/game-disconnect-handler.service';
import { GameActionHandlerService } from './services/game-action-handler.service';
import { RoomsModule } from '../rooms/rooms.module';
import { QuestionsModule } from '../questions/questions.module';

@Module({
  imports: [RoomsModule, QuestionsModule],
  providers: [
    GameGateway,
    GameTimerService,
    CardsEngineService,
    HackEngineService,
    GameCoordinatorService,
    GameTickerService,
    GameDisconnectHandlerService,
    GameActionHandlerService,
  ],
})
export class GameModule {}
