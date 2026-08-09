import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TeamsService } from './teams.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateTeamDto } from './dto/create-team.dto';

@ApiTags('Teams')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() body: CreateTeamDto) {
    return this.teamsService.createTeam(user.sub, body);
  }

  @Post('join/:inviteCode')
  joinByInvite(@CurrentUser() user: any, @Param('inviteCode') inviteCode: string) {
    return this.teamsService.joinByInvite(user.sub, inviteCode);
  }

  @Post('join/:inviteCode/substitute')
  joinAsSubstitute(@CurrentUser() user: any, @Param('inviteCode') inviteCode: string) {
    return this.teamsService.joinAsSubstitute(user.sub, inviteCode);
  }

  @Patch(':teamId/members/:memberId/promote')
  promoteSubstitute(
    @CurrentUser() user: any,
    @Param('teamId') teamId: string,
    @Param('memberId') memberId: string,
  ) {
    return this.teamsService.promoteSubstitute(user.sub, teamId, memberId);
  }

  @Patch(':teamId/members/:memberId/demote')
  demoteToSubstitute(
    @CurrentUser() user: any,
    @Param('teamId') teamId: string,
    @Param('memberId') memberId: string,
  ) {
    return this.teamsService.demoteToSubstitute(user.sub, teamId, memberId);
  }

  @Get('mine')
  getMyTeam(@CurrentUser() user: any) {
    return this.teamsService.getMyTeam(user.sub);
  }

  @Get(':id')
  getTeam(@Param('id') id: string) {
    return this.teamsService.getTeam(id);
  }

  @Delete(':teamId/members/:memberId')
  removeMember(
    @CurrentUser() user: any,
    @Param('teamId') teamId: string,
    @Param('memberId') memberId: string,
  ) {
    return this.teamsService.removeMember(user.sub, teamId, memberId);
  }

  @Post(':teamId/vouch/:memberId')
  vouchMember(
    @CurrentUser() user: any,
    @Param('teamId') teamId: string,
    @Param('memberId') memberId: string,
  ) {
    return this.teamsService.vouchMember(user.sub, teamId, memberId);
  }
}
