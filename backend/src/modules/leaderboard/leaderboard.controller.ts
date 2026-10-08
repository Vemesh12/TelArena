import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { LeaderboardService } from './leaderboard.service';

@ApiTags('Leaderboard')
@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get('global/teams')
  getGlobalTeamRankings(@Query('limit') limit?: string) {
    return this.leaderboardService.getGlobalTeamRankings(limit ? parseInt(limit, 10) : 50);
  }

  @Get('teams/rankings')
  getGlobalTeamRankingsAlias(@Query('limit') limit?: string) {
    return this.leaderboardService.getGlobalTeamRankings(limit ? parseInt(limit, 10) : 50);
  }

  @Get('recent-winners')
  getRecentWinners(@Query('limit') limit?: string) {
    return this.leaderboardService.getRecentWinners(limit ? parseInt(limit, 10) : 5);
  }

  @Get('teams/:teamId/rating')
  getTeamOverallRating(@Param('teamId') teamId: string) {
    return this.leaderboardService.getTeamOverallRating(teamId);
  }

  @Get('tournament/:tournamentId')
  getTournamentLeaderboard(
    @Param('tournamentId') tournamentId: string,
    @Query('stageId') stageId?: string,
  ) {
    return this.leaderboardService.getTournamentLeaderboard(tournamentId, stageId);
  }

  @Get('tournament/:tournamentId/export')
  async exportCsv(
    @Param('tournamentId') tournamentId: string,
    @Query('stageId') stageId: string,
    @Res() res: Response,
  ) {
    const csv = await this.leaderboardService.exportCsv(tournamentId, stageId);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="leaderboard-${tournamentId}.csv"`);
    res.send(csv);
  }

  @Get('export')
  async exportGlobalCsv(@Res() res: Response) {
    const csv = await this.leaderboardService.exportGlobalCsv();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="leaderboard-global.csv"');
    res.send(csv);
  }
}
