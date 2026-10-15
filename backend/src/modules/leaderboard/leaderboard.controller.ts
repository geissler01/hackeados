import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';

@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get('top')
  async getTop(@Query('category') category?: string, @Query('limit') limit: number = 10) {
    return this.leaderboardService.getTopRecords(limit, category);
  }

  @Post('claim')
  async claimScore(
    @Body() body: { arcadeTag: string; score: number; accuracy: number; hacks: number; categoryId?: string },
  ) {
    return this.leaderboardService.recordArcadeScore(
      body.arcadeTag,
      body.score,
      body.accuracy,
      body.hacks,
      body.categoryId,
    );
  }
}
