import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from '../../database/entities/question.entity';
import { Category } from '../../database/entities/category.entity';
import { Subtopic } from '../../database/entities/subtopic.entity';
import { QuestionsService } from './questions.service';
import { QuestionsController } from './questions.controller';

import { AiModule } from '../ai/ai.module';

@Module({
  imports: [TypeOrmModule.forFeature([Question, Category, Subtopic]), AiModule],
  controllers: [QuestionsController],
  providers: [QuestionsService],
  exports: [QuestionsService],
})
export class QuestionsModule {}
