import { Controller, Get, Post, Param, Query } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { AiService } from '../ai/ai.service';

@Controller('categories')
export class QuestionsController {
  constructor(
    private readonly questionsService: QuestionsService,
    private readonly aiService: AiService,
  ) {}

  @Get()
  async getCategories() {
    return this.questionsService.getAllCategories();
  }

  @Get(':id/generate')
  @Post(':id/generate')
  async generateQuestions(@Param('id') categoryId: string, @Query('count') count?: string) {
    const qty = count ? parseInt(count, 10) : 15;
    const inserted = await this.aiService.generateBatch(categoryId, qty);
    const total = await this.questionsService.getCategoryQuestionsCount(categoryId);
    return { success: true, categoryId, inserted, totalQuestions: total };
  }
}
