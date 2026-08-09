import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RoomsService } from './rooms.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { TeamsService } from '../teams/teams.service';
import { CreateRoomDto, AssignSlotsDto, UpdateRoomDto } from './dto/room.dto';

@ApiTags('Rooms')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('rooms')
export class RoomsController {
  constructor(
    private readonly roomsService: RoomsService,
    private readonly teamsService: TeamsService,
  ) {}

  @Post('stage/:stageId')
  @UseGuards(RolesGuard)
  @Roles('admin', 'super_admin', 'moderator')
  createRoom(@Param('stageId') stageId: string, @Body() body: CreateRoomDto) {
    return this.roomsService.createRoom(stageId, { ...body, scheduledAt: new Date(body.scheduledAt) });
  }

  @Post(':roomId/slots')
  @UseGuards(RolesGuard)
  @Roles('admin', 'super_admin', 'moderator')
  assignSlots(@Param('roomId') roomId: string, @Body() body: AssignSlotsDto) {
    return this.roomsService.assignSlots(roomId, body.slots);
  }

  @Get(':roomId/admin')
  @UseGuards(RolesGuard)
  @Roles('admin', 'super_admin', 'moderator')
  getAdminView(@Param('roomId') roomId: string) {
    return this.roomsService.getRoomAdmin(roomId);
  }

  @Get(':roomId/my-slot')
  async getMySlot(@CurrentUser() user: any, @Param('roomId') roomId: string) {
    const team = await this.teamsService.getMyTeam(user.sub);
    return this.roomsService.getRoomForTeam(roomId, team.id);
  }

  @Get('next-match')
  async getNextMatch(@CurrentUser() user: any) {
    const team = await this.teamsService.getMyTeam(user.sub);
    if (!team) return null;
    return this.roomsService.getMyNextMatch(team.id);
  }

  @Post('check-in')
  async checkInSquad(@CurrentUser() user: any) {
    const team = await this.teamsService.getMyTeam(user.sub);
    if (!team) throw new Error('You must be on a team to check in');
    return this.roomsService.checkInSquad(team.id);
  }

  @Patch(':roomId/no-show/:teamId')
  @UseGuards(RolesGuard)
  @Roles('admin', 'super_admin', 'moderator')
  markNoShow(@Param('roomId') roomId: string, @Param('teamId') teamId: string) {
    return this.roomsService.markNoShow(roomId, teamId);
  }

  @Patch(':roomId')
  @UseGuards(RolesGuard)
  @Roles('admin', 'super_admin', 'moderator')
  updateRoom(@Param('roomId') roomId: string, @Body() body: UpdateRoomDto) {
    return this.roomsService.updateRoom(roomId, body);
  }
}
