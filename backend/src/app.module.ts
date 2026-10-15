import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from './config/database.config';
import { RoomsModule } from './modules/rooms/rooms.module';
import { QuestionsModule } from './modules/questions/questions.module';
import { GameModule } from './modules/game/game.module';
import { AiModule } from './modules/ai/ai.module';
import { LeaderboardModule } from './modules/leaderboard/leaderboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env', '../.env'] }),
    TypeOrmModule.forRoot(getDatabaseConfig()),
    RoomsModule,
    QuestionsModule,
    GameModule,
    AiModule,
    LeaderboardModule,
  ],
})
export class AppModule {}
