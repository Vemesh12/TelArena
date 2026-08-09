import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { MatchesService } from './matches.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { EnterResultsDto } from './dto/enter-results.dto';

@ApiTags('Matches')
@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get('admin/all')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin', 'moderator')
  getAllMatches() {
    return this.matchesService.getAllMatches();
  }

  @Get(':id')
  getMatch(@Param('id') id: string) {
    return this.matchesService.getMatch(id);
  }

  @Get('group/:groupId')
  getGroupMatches(@Param('groupId') groupId: string) {
    return this.matchesService.getGroupMatches(groupId);
  }

  @Post('group/:groupId/room/:roomId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin', 'moderator')
  createMatch(@Param('groupId') groupId: string, @Param('roomId') roomId: string) {
    return this.matchesService.createMatch(groupId, roomId);
  }

  @Post(':id/results')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin', 'moderator')
  enterResults(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: EnterResultsDto,
  ) {
    return this.matchesService.enterResults(id, body.results, user.sub, user.role);
  }

  @Patch('results/:resultId/finalize')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin', 'moderator')
  finalizeResult(@CurrentUser() user: any, @Param('resultId') resultId: string) {
    return this.matchesService.finalizeResult(resultId, user.sub, user.role);
  }

  @Patch('results/:resultId/flag')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  flagDisputed(@Param('resultId') resultId: string) {
    return this.matchesService.flagDisputed(resultId);
  }
}
