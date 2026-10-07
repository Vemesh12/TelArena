import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Res,
  UseGuards,
  Redirect,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UpdateOnboardingDto } from './dto/onboarding.dto';
import { DevLoginDto, LoginMobileDto, RegisterDto } from './dto/auth.dto';
import { PlayersService } from '../players/players.service';
import { CurrentUser } from './decorators/current-user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly playersService: PlayersService,
  ) { }

  @Get('discord')
  @UseGuards(AuthGuard('discord'))
  discordLogin() {
    // Redirects to Discord OAuth
  }

  @Get('discord/callback')
  @UseGuards(AuthGuard('discord'))
  discordCallback(@Req() req, @Res() res) {
    const auth = this.authService.login(req.user);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return res.redirect(`${frontendUrl}/auth/callback?access_token=${auth.access_token}`);
  }

  @Post('dev-login')
  devLogin(@Body() body: DevLoginDto) {
    if (process.env.NODE_ENV === 'production') {
      throw new ForbiddenException('Dev login endpoint is disabled in production environment');
    }
    return this.authService.devLogin(body?.role, body?.username);
  }

  @Post('login-mobile')
  loginMobile(@Body() body: LoginMobileDto) {
    return this.authService.loginWithMobile(body.phone, body.password);
  }

  @Post('register')
  register(@Body() body: RegisterDto) {
    if (body.phone && body.password) {
      return this.authService.registerWithMobile(body as any);
    }
    return this.authService.registerNewPlayer(body);
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  getMe(@CurrentUser() user: any) {
    return this.authService.getProfile(user.sub);
  }

  @Post('onboarding')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  completeOnboarding(
    @CurrentUser() user: any,
    @Body() dto: UpdateOnboardingDto,
  ) {
    return this.playersService.updateOnboarding(user.sub, dto);
  }
}
