import {
  Controller, Get, Post, Patch, Body, Param, Query, UseGuards, BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TournamentsService } from './tournaments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { TeamsService } from '../teams/teams.service';
import {
  CreateTournamentDto, UpdateTournamentDto, UpdateTournamentStatusDto,
  UpdateScoringConfigDto, RegisterTeamDto,
} from './dto/tournament.dto';

@ApiTags('Tournaments')
@Controller('tournaments')
export class TournamentsController {
  constructor(
    private readonly tournamentsService: TournamentsService,
    private readonly teamsService: TeamsService,
  ) {}

  // Public routes
  @Get()
  findAll(@Query('status') status?: string) {
    return this.tournamentsService.findAll(status);
  }

  // Mine registrations must be ABOVE :id route so Express doesn't treat 'mine' as tournamentId
  @Get('mine/registrations')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getMyRegistrations(@CurrentUser() user: any) {
    const team = await this.teamsService.getMyTeam(user.sub);
    if (!team) return [];
    return this.tournamentsService.getMyRegistrations(team.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tournamentsService.findById(id);
  }

  @Get(':id/registrations')
  getRegistrations(@Param('id') id: string) {
    return this.tournamentsService.getRegistrations(id);
  }

  // Admin routes — Module E
  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  create(@CurrentUser() user: any, @Body() body: CreateTournamentDto) {
    return this.tournamentsService.create(body as any, user.sub, user.role);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() body: UpdateTournamentDto) {
    return this.tournamentsService.update(id, body, user.sub, user.role);
  }

  @Patch(':id/status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  updateStatus(@CurrentUser() user: any, @Param('id') id: string, @Body() body: UpdateTournamentStatusDto) {
    return this.tournamentsService.updateStatus(id, body.status, user.sub, user.role);
  }

  @Patch(':id/scoring')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  updateScoring(@CurrentUser() user: any, @Param('id') id: string, @Body() body: UpdateScoringConfigDto) {
    return this.tournamentsService.updateScoringConfig(id, body, user.sub, user.role);
  }

  @Post(':id/clone')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  clone(@CurrentUser() user: any, @Param('id') id: string) {
    return this.tournamentsService.clone(id, user.sub, user.role);
  }

  // Player routes — Module F
  @Post(':id/register')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async register(@CurrentUser() user: any, @Param('id') id: string, @Body() body: RegisterTeamDto) {
    let teamId = body?.teamId;
    if (!teamId) {
      const team = await this.teamsService.getMyTeam(user.sub);
      if (team) {
        teamId = team.id;
      }
    }

    if (!teamId) {
      throw new BadRequestException(
        'You must be in a confirmed team to register. Please create or join a squad on the Teams page (/teams).',
      );
    }

    return this.tournamentsService.registerTeam(id, teamId, body?.metadata);
  }

  @Patch(':id/registrations/:regId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  async updateRegistrationStatus(
    @Param('regId') regId: string,
    @Body('status') status: string,
  ) {
    return this.tournamentsService.updateRegistrationStatus(regId, status);
  }
}
