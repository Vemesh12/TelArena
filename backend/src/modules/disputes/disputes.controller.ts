import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DisputesService } from './disputes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { TeamsService } from '../teams/teams.service';
import { RaiseDisputeDto, ResolveDisputeDto } from './dto/dispute.dto';

@ApiTags('Disputes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('disputes')
export class DisputesController {
  constructor(
    private readonly disputesService: DisputesService,
    private readonly teamsService: TeamsService,
  ) {}

  @Post()
  async raise(
    @CurrentUser() user: any,
    @Body() body: RaiseDisputeDto,
  ) {
    const team = await this.teamsService.getMyTeam(user.sub);
    if (!team) throw new BadRequestException('You must be on a team to raise a dispute');
    return this.disputesService.raise({ ...body, teamId: team.id, raisedById: user.sub });
  }

  @Get('mine')
  async getMyDisputes(@CurrentUser() user: any) {
    const team = await this.teamsService.getMyTeam(user.sub);
    if (!team) return [];
    return this.disputesService.getMyDisputes(team.id);
  }

  @Get('queue')
  @UseGuards(RolesGuard)
  @Roles('admin', 'super_admin', 'moderator')
  getQueue(@Query('status') status?: string) {
    return this.disputesService.getQueue(status);
  }

  @Get('escalated')
  @UseGuards(RolesGuard)
  @Roles('admin', 'super_admin')
  getEscalated() {
    return this.disputesService.getEscalated();
  }

  @Patch(':id/resolve')
  @UseGuards(RolesGuard)
  @Roles('admin', 'super_admin', 'moderator')
  resolve(@CurrentUser() user: any, @Param('id') id: string, @Body() body: ResolveDisputeDto) {
    return this.disputesService.resolve(id, body, user.sub, user.role);
  }

  @Patch(':id/escalate')
  @UseGuards(RolesGuard)
  @Roles('admin', 'super_admin', 'moderator')
  escalate(@Param('id') id: string) {
    return this.disputesService.escalate(id);
  }

  @Patch(':id/request-evidence')
  @UseGuards(RolesGuard)
  @Roles('admin', 'super_admin', 'moderator')
  requestEvidence(@Param('id') id: string) {
    return this.disputesService.requestEvidence(id);
  }
}
