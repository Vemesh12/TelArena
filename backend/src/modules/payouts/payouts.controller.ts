import { Controller, Get, Post, Patch, Body, Param, UseGuards, Res } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PayoutsService } from './payouts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdatePayoutStatusDto } from './dto/update-payout-status.dto';

@ApiTags('Payouts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payouts')
export class PayoutsController {
  constructor(private readonly payoutsService: PayoutsService) {}

  @Post('tournament/:id/finalize')
  @UseGuards(RolesGuard)
  @Roles('admin', 'super_admin')
  finalize(@Param('id') id: string) {
    return this.payoutsService.finalizeTournamentPayouts(id);
  }

  @Get('tournament/:id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'super_admin', 'moderator')
  getPayouts(@Param('id') id: string) {
    return this.payoutsService.getPayouts(id);
  }

  @Get('mine')
  getMyPayouts(@CurrentUser() user: any) {
    return this.payoutsService.getMyPayouts(user.sub);
  }

  @Get('tournament/:id/export')
  @UseGuards(RolesGuard)
  @Roles('admin', 'super_admin', 'moderator')
  async exportPayouts(@Param('id') id: string, @Res() res: Response) {
    const csv = await this.payoutsService.exportPayoutsCsv(id);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="payouts-${id}.csv"`);
    res.send(csv);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('admin', 'super_admin')
  updateStatus(@Param('id') id: string, @Body() body: UpdatePayoutStatusDto) {
    return this.payoutsService.updatePayoutStatus(id, body);
  }
}
