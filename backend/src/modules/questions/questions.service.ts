import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Question } from '../../database/entities/question.entity';
import { Category } from '../../database/entities/category.entity';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepo: Repository<Question>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  async loadQuestionsForMatch(categoryId: string, limit: number = 120): Promise<Question[]> {
    let questions = await this.questionRepo
      .createQueryBuilder('q')
      .where('q.category_id = :categoryId', { categoryId })
      .orderBy('q.times_used', 'ASC')
      .addOrderBy('RANDOM()')
      .limit(limit)
      .getMany();

    if (!questions.length) {
      questions = await this.questionRepo
        .createQueryBuilder('q')
        .orderBy('q.times_used', 'ASC')
        .addOrderBy('RANDOM()')
        .limit(limit)
        .getMany();
    }
    return questions;
  }

  async incrementTimesUsed(questionIds: string[]): Promise<void> {
    if (!questionIds.length) return;
    await this.questionRepo
      .createQueryBuilder()
      .update(Question)
      .set({ timesUsed: () => 'times_used + 1' })
      .where({ id: In(questionIds) })
      .execute();
  }

  async getCategoryQuestionsCount(categoryId: string): Promise<number> {
    return this.questionRepo.count({ where: { categoryId } });
  }

  async getAllCategories(): Promise<Category[]> {
    return this.categoryRepo.find();
  }
}
