import { Controller, Get, Patch, Body, Param, UseGuards, BadRequestException, ForbiddenException, Res } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdateRoleDto, SeedGroupsDto, BatchRoomsDto, ResolveDisputeAdminDto, SuspendPlayerDto } from './dto/admin.dto';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'super_admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  getDashboard() {
    return this.adminService.getDashboardStats();
  }

  @Get('upcoming-rooms')
  getUpcomingRooms() {
    return this.adminService.getUpcomingRoomReleases();
  }

  @Get('pending-results')
  getPendingResults() {
    return this.adminService.getPendingResultEntry();
  }

  @Get('players')
  getPlayers() {
    return this.adminService.getPlayerList();
  }

  @Get('players/export')
  async exportPlayers(@Res() res: Response) {
    const csv = await this.adminService.exportPlayersCsv();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="players.csv"');
    res.send(csv);
  }

  @Patch('players/:id/role')
  async updateRole(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: UpdateRoleDto,
  ) {
    if (user.sub === id) {
      throw new ForbiddenException('You cannot modify your own account role.');
    }
    const targetPlayer = await this.adminService.getPlayerById(id);
    if (targetPlayer?.role === 'super_admin' && user.role !== 'super_admin') {
      throw new ForbiddenException('Only a Super Admin can modify a Super Admin account.');
    }
    if (user.role !== 'super_admin' && (body.role === 'admin' || body.role === 'super_admin')) {
      throw new ForbiddenException('Super Admin permissions are required to assign Admin or Super Admin roles.');
    }
    return this.adminService.updatePlayerRole(id, body.role, user.sub, user.role);
  }

  @Patch('players/:id/suspend')
  async setSuspended(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: SuspendPlayerDto,
  ) {
    if (user.sub === id) {
      throw new ForbiddenException('You cannot suspend your own account.');
    }
    const targetPlayer = await this.adminService.getPlayerById(id);
    if (targetPlayer?.role === 'super_admin' && user.role !== 'super_admin') {
      throw new ForbiddenException('Only a Super Admin can suspend a Super Admin account.');
    }
    return this.adminService.setSuspended(id, body.suspended, body.reason, user.sub, user.role);
  }

  @Patch('verifications/:id/approve')
  approveVerification(@CurrentUser() user: any, @Param('id') id: string) {
    return this.adminService.approveVerification(id, user.sub, user.role);
  }

  @Patch('verifications/:id/reject')
  rejectVerification(@CurrentUser() user: any, @Param('id') id: string) {
    return this.adminService.rejectVerification(id, user.sub, user.role);
  }

  @Get('audit-logs')
  getAuditLogs() {
    return this.adminService.getAuditLogs();
  }

  @Patch('seed-groups')
  seedGroups(
    @Body() body: SeedGroupsDto,
  ) {
    return this.adminService.seedGroups(body.tournamentId, body.stageId, body.groupCount || 4);
  }

  @Patch('batch-rooms')
  batchRooms(
    @Body() body: BatchRoomsDto,
  ) {
    return this.adminService.batchCreateRooms(body.stageId, body.scheduledAt, body.releaseMinutes);
  }

  @Patch('disputes/:id/resolve')
  resolveDispute(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: ResolveDisputeAdminDto,
  ) {
    return this.adminService.resolveDispute(id, body.resolution, body.status, user.sub);
  }
}

