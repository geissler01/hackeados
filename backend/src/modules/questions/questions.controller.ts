import { Controller, Get } from '@nestjs/common';
import { QuestionsService } from './questions.service';

@Controller('categories')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Get()
  async getCategories() {
    return this.questionsService.getAllCategories();
  }
}
