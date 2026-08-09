import {
  Injectable, BadRequestException, NotFoundException, ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TesService } from '../verification/tes.service';

@Injectable()
export class TeamsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tesService: TesService,
  ) {}

  async createTeam(captainId: string, data: { name: string; tag: string; logoUrl?: string }) {
    // Check captain not already in a core team
    const existing = await this.prisma.teamMember.findFirst({
      where: { playerId: captainId, isCore: true },
    });
    if (existing) throw new BadRequestException('You are already a core member of a team');

    const team = await this.prisma.team.create({
      data: {
        ...data,
        captainId,
        members: { create: { playerId: captainId, isCore: true } },
      },
      include: { members: { include: { player: { include: { verification: true } } } } },
    });
    return this.computeTeamStatus(team);
  }

  async joinByInvite(playerId: string, inviteCode: string) {
    const team = await this.prisma.team.findUnique({ where: { inviteCode } });
    if (!team) throw new NotFoundException('Invalid invite code');

    const existing = await this.prisma.teamMember.findFirst({
      where: { playerId, isCore: true },
    });
    if (existing) throw new BadRequestException('Already a core member of another team');

    const memberCount = await this.prisma.teamMember.count({ where: { teamId: team.id, isCore: true } });
    if (memberCount >= 4) throw new BadRequestException('Team roster is full (max 4 core members)');

    await this.prisma.teamMember.create({
      data: { teamId: team.id, playerId, isCore: true },
    });

    return this.getTeam(team.id);
  }

  async joinAsSubstitute(playerId: string, inviteCode: string) {
    const team = await this.prisma.team.findUnique({ where: { inviteCode } });
    if (!team) throw new NotFoundException('Invalid invite code');

    const alreadyOnTeam = await this.prisma.teamMember.findFirst({
      where: { teamId: team.id, playerId },
    });
    if (alreadyOnTeam) throw new BadRequestException('Already a member of this team');

    const subCount = await this.prisma.teamMember.count({ where: { teamId: team.id, isCore: false } });
    if (subCount >= 2) throw new BadRequestException('Team already has the maximum of 2 substitutes');

    await this.prisma.teamMember.create({
      data: { teamId: team.id, playerId, isCore: false },
    });

    return this.getTeam(team.id);
  }

  async promoteSubstitute(captainId: string, teamId: string, memberId: string) {
    const team = await this.prisma.team.findUnique({ where: { id: teamId } });
    if (!team) throw new NotFoundException('Team not found');
    if (team.captainId !== captainId) throw new ForbiddenException('Only captain can promote substitutes');

    const member = await this.prisma.teamMember.findFirst({ where: { teamId, playerId: memberId } });
    if (!member) throw new NotFoundException('Player is not a member of this team');
    if (member.isCore) throw new BadRequestException('Player is already a core member');

    const coreCount = await this.prisma.teamMember.count({ where: { teamId, isCore: true } });
    if (coreCount >= 4) throw new BadRequestException('Core roster is full (max 4). Demote a core member first.');

    await this.prisma.teamMember.update({ where: { id: member.id }, data: { isCore: true } });
    return this.getTeam(teamId);
  }

  async demoteToSubstitute(captainId: string, teamId: string, memberId: string) {
    const team = await this.prisma.team.findUnique({ where: { id: teamId } });
    if (!team) throw new NotFoundException('Team not found');
    if (team.captainId !== captainId) throw new ForbiddenException('Only captain can demote core members');
    if (memberId === captainId) throw new BadRequestException('Captain cannot demote themselves');

    const member = await this.prisma.teamMember.findFirst({ where: { teamId, playerId: memberId } });
    if (!member) throw new NotFoundException('Player is not a member of this team');

    const subCount = await this.prisma.teamMember.count({ where: { teamId, isCore: false } });
    if (subCount >= 2) throw new BadRequestException('Team already has the maximum of 2 substitutes');

    await this.prisma.teamMember.update({ where: { id: member.id }, data: { isCore: false } });
    return this.getTeam(teamId);
  }

  async getTeam(teamId: string) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        captain: true,
        members: { include: { player: { include: { verification: true } } } },
      },
    });
    if (!team) throw new NotFoundException('Team not found');
    return this.computeTeamStatus(team);
  }

  async getMyTeam(playerId: string) {
    const membership = await this.prisma.teamMember.findFirst({
      where: { playerId, isCore: true },
      include: {
        team: {
          include: {
            captain: true,
            members: { include: { player: { include: { verification: true } } } },
          },
        },
      },
    });
    if (!membership) return null;
    return this.computeTeamStatus(membership.team);
  }

  async removeMember(captainId: string, teamId: string, memberId: string) {
    const team = await this.prisma.team.findUnique({ where: { id: teamId } });
    if (!team) throw new NotFoundException('Team not found');
    if (team.captainId !== captainId) throw new ForbiddenException('Only captain can remove members');
    if (memberId === captainId) throw new BadRequestException('Captain cannot remove themselves');

    await this.prisma.teamMember.deleteMany({
      where: { teamId, playerId: memberId },
    });
    return this.getTeam(teamId);
  }

  async vouchMember(captainId: string, teamId: string, memberId: string) {
    const team = await this.prisma.team.findUnique({ where: { id: teamId } });
    if (!team) throw new NotFoundException('Team not found');
    if (team.captainId !== captainId) throw new ForbiddenException('Only captain can vouch');

    // Re-run TES with captainVouched=true signal
    const verif = await this.prisma.verification.findUnique({ where: { playerId: memberId } });
    if (!verif) throw new NotFoundException('Player has no verification record');

    const { score, decision, signals, friendlyMessage } = await this.tesService.computeScore({
      freefireVerified: verif.freefireVerified,
      otpVerified: verif.otpVerified,
      telecomCircleMatch: verif.telecomCircle?.includes('AP') || verif.telecomCircle?.includes('Telangana') || false,
      captainVouched: true,
    });

    await this.prisma.verification.update({
      where: { playerId: memberId },
      data: { tesScore: score, tesDecision: friendlyMessage, status: decision as any, signals },
    });

    return { score, decision, friendlyMessage };
  }

  private computeTeamStatus(team: any) {
    const coreMembers = team.members.filter((m: any) => m.isCore);
    const approvedCount = coreMembers.filter(
      (m: any) =>
        m.player?.verification?.status === 'auto_approved' ||
        m.player?.verification?.status === 'approved',
    ).length;

    let status = 'forming';
    if (approvedCount >= 3) status = 'confirmed';
    else if (coreMembers.length >= 2) status = 'pending';

    return {
      ...team,
      computedStatus: status,
      approvedCount,
      totalCore: coreMembers.length,
      verificationProgress: `${approvedCount} of ${coreMembers.length} verified`,
    };
  }
}
