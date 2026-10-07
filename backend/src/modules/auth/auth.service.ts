import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PlayersService } from '../players/players.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly playersService: PlayersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateDiscordUser(profile: any) {
    const { id, username, avatar } = profile;
    let player = await this.playersService.findByDiscordId(id);
    if (!player) {
      player = await this.playersService.create({
        discordId: id,
        discordUsername: username,
        discordAvatar: avatar
          ? `https://cdn.discordapp.com/avatars/${id}/${avatar}.png`
          : null,
      });
    }
    return player;
  }

  login(player: any) {
    if (player.suspended) {
      throw new ForbiddenException(
        player.suspendedReason
          ? `Your account has been suspended: ${player.suspendedReason}`
          : 'Your account has been suspended. Contact support for assistance.',
      );
    }
    const payload = { sub: player.id, role: player.role };
    return {
      access_token: this.jwtService.sign(payload),
      player,
    };
  }

  async devLogin(role: string = 'player', username?: string) {
    if (process.env.NODE_ENV === 'production') {
      throw new ForbiddenException('Dev login is strictly disabled in production');
    }
    const allowedDevRoles = ['player', 'moderator', 'admin'];
    const safeRole = allowedDevRoles.includes(role) ? role : 'player';
    const devUsername = username || (safeRole === 'admin' ? 'admin_test' : safeRole === 'moderator' ? 'mod_test' : 'captain_hhk');
    let player = await this.playersService.findByDiscordUsername(devUsername);
    if (!player) {
      player = await this.playersService.create({
        discordId: `dev_${safeRole}_${Date.now()}`,
        discordUsername: devUsername,
        discordAvatar: null,
      });
      if (safeRole && safeRole !== 'player') {
        await this.playersService.updateRole(player.id, safeRole);
      }
    }
    return this.login(player);
  }

  async registerNewPlayer(data: {
    discordUsername: string;
    fullName?: string;
    freefireUid?: string;
    phone?: string;
    age?: number;
    primaryLanguage?: string;
  }) {
    let player = await this.playersService.findByDiscordUsername(data.discordUsername);
    if (!player) {
      player = await this.playersService.create({
        discordId: `user_${Date.now()}`,
        discordUsername: data.discordUsername,
      });
    }

    await this.playersService.updateOnboarding(player.id, {
      fullName: data.fullName || data.discordUsername,
      age: data.age ? Number(data.age) : 20,
      primaryLanguage: data.primaryLanguage || 'Telugu',
      freefireUid: data.freefireUid,
      phone: data.phone,
    });

    // All self-registrations default strictly to 'player' role
    await this.playersService.updateRole(player.id, 'player');

    const updatedPlayer = await this.playersService.findById(player.id);
    return this.login(updatedPlayer);
  }

  async loginWithMobile(phone: string, password?: string) {
    const cleanPhone = phone.trim();
    let player = await this.playersService.findByPhone(cleanPhone);
    if (!player) {
      player = await this.playersService.findByDiscordUsername(cleanPhone);
    }
    if (!player) {
      throw new BadRequestException('Account not found with this mobile number or username');
    }

    if (!password) {
      throw new BadRequestException('Password is required to sign in');
    }

    if (!player.password) {
      throw new BadRequestException(
        'This account was registered via Discord or has no password configured. Please sign in with Discord or reset your password.',
      );
    }

    const isBcrypt = player.password.startsWith('$2');
    const isMatch = isBcrypt
      ? await bcrypt.compare(password, player.password)
      : player.password === password;

    if (!isMatch) {
      throw new BadRequestException('Incorrect mobile number or password');
    }

    // Automatically upgrade legacy plaintext password to secure bcrypt hash
    if (!isBcrypt) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await this.playersService.updatePassword(player.id, hashedPassword);
    }

    return this.login(player);
  }

  async registerWithMobile(data: {
    phone: string;
    password: string;
    discordUsername: string;
    fullName?: string;
    freefireUid?: string;
  }) {
    const cleanPhone = data.phone.trim();
    const existingPhone = await this.playersService.findByPhone(cleanPhone);
    if (existingPhone) {
      throw new BadRequestException('An account with this mobile number already exists');
    }

    let player = await this.playersService.create({
      discordId: `phone_${Date.now()}`,
      discordUsername: data.discordUsername,
    });

    await this.playersService.updateOnboarding(player.id, {
      phone: cleanPhone,
      fullName: data.fullName || data.discordUsername,
      freefireUid: data.freefireUid,
    });

    await this.playersService.updateRole(player.id, 'player');

    // Hash password with bcrypt (cost factor 10)
    const hashedPassword = await bcrypt.hash(data.password, 10);
    await this.playersService.updatePassword(player.id, hashedPassword);

    const updatedPlayer = await this.playersService.findById(player.id);
    return this.login(updatedPlayer);
  }

  async getProfile(playerId: string) {
    return this.playersService.findById(playerId);
  }
}
