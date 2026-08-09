import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { StagesService } from './stages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateStageDto, GenerateGroupsDto } from './dto/stage.dto';
import { GenerateBracketDto, ReportBracketResultDto } from './dto/bracket.dto';

@ApiTags('Stages')
@Controller('stages')
export class StagesController {
  constructor(private readonly stagesService: StagesService) {}

  @Get('tournament/:tournamentId')
  getStages(@Param('tournamentId') tournamentId: string) {
    return this.stagesService.getStages(tournamentId);
  }

  @Post('tournament/:tournamentId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  createStage(@Param('tournamentId') tournamentId: string, @Body() body: CreateStageDto) {
    return this.stagesService.createStage(tournamentId, {
      ...body,
      date: body.date ? new Date(body.date) : undefined,
    });
  }

  @Post(':stageId/generate-groups')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin', 'moderator')
  generateGroups(@Param('stageId') stageId: string, @Body() body: GenerateGroupsDto) {
    return this.stagesService.generateGroups(stageId, body.groupCount);
  }

  @Get(':stageId/bracket')
  getBracket(@Param('stageId') stageId: string) {
    return this.stagesService.getBracket(stageId);
  }

  @Post(':stageId/generate-bracket')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin', 'moderator')
  generateBracket(@Param('stageId') stageId: string, @Body() body: GenerateBracketDto) {
    return this.stagesService.generateBracket(stageId, body.seededTeamIds);
  }

  @Patch('bracket-matches/:matchId/result')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin', 'moderator')
  reportBracketResult(@Param('matchId') matchId: string, @Body() body: ReportBracketResultDto) {
    return this.stagesService.reportBracketResult(matchId, body.winnerId, body.scoreA, body.scoreB);
  }

  @Patch(':stageId/publish')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  publishStage(@Param('stageId') stageId: string) {
    return this.stagesService.publishStage(stageId);
  }

  @Patch(':stageId/complete')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  completeStage(@Param('stageId') stageId: string) {
    return this.stagesService.completeStage(stageId);
  }
}
