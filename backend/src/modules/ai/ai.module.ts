import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from '../../database/entities/question.entity';
import { Subtopic } from '../../database/entities/subtopic.entity';
import { AiService } from './ai.service';

@Module({
  imports: [TypeOrmModule.forFeature([Question, Subtopic])],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
