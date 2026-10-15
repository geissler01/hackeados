import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArcadeRecord } from '../../database/entities/arcade-record.entity';
import { GameSession } from '../../database/entities/game-session.entity';

@Injectable()
export class LeaderboardService {
  constructor(
    @InjectRepository(ArcadeRecord)
    private readonly recordRepo: Repository<ArcadeRecord>,
    @InjectRepository(GameSession)
    private readonly sessionRepo: Repository<GameSession>,
  ) {}

  async getTopRecords(limit: number = 10, categoryId?: string): Promise<ArcadeRecord[]> {
    const qb = this.recordRepo.createQueryBuilder('r')
      .orderBy('r.score', 'DESC')
      .limit(limit);

    if (categoryId) {
      qb.where('r.category_id = :categoryId', { categoryId });
    }

    return qb.getMany();
  }

  async recordArcadeScore(arcadeTag: string, score: number, accuracy: number, hacks: number, categoryId?: string): Promise<ArcadeRecord> {
    const tag = arcadeTag.trim().toUpperCase().slice(0, 10);
    const existing = await this.recordRepo.findOne({ where: { arcadeTag: tag } });

    if (existing) {
      if (score > existing.score) {
        existing.score = score;
        existing.accuracyPercentage = accuracy;
        existing.hacksCount = hacks;
        return this.recordRepo.save(existing);
      }
      return existing;
    }

    const newRecord = this.recordRepo.create({
      arcadeTag: tag,
      score,
      accuracyPercentage: accuracy,
      hacksCount: hacks,
      categoryId,
    });
    return this.recordRepo.save(newRecord);
  }

  async saveGameSession(sessionData: Partial<GameSession>): Promise<GameSession> {
    const session = this.sessionRepo.create(sessionData);
    return this.sessionRepo.save(session);
  }
}
