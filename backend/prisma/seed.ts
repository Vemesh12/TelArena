import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting TeluguArena Database Seeding with bcrypt password hashing...');

  const hashedAdminPass = bcrypt.hashSync('admin123', 10);
  const hashedModPass = bcrypt.hashSync('mod123', 10);
  const hashedCaptainPass = bcrypt.hashSync('captain123', 10);
  const hashedPlayerPass = bcrypt.hashSync('player123', 10);

  // 1. Verification Config
  await prisma.verificationConfig.upsert({
    where: { id: 'default_config' },
    update: {},
    create: {
      id: 'default_config',
      autoApproveMin: 60,
      manualReviewMin: 40,
    },
  });

  // 2. Test Accounts / Players
  const superAdmin = await prisma.player.upsert({
    where: { discordId: 'dev_superadmin_1000' },
    update: { phone: '9999900000', password: hashedAdminPass, role: 'super_admin' },
    create: {
      discordId: 'dev_superadmin_1000',
      discordUsername: 'superadmin_test',
      fullName: 'Super Administrator',
      age: 30,
      primaryLanguage: 'Telugu',
      freefireUid: '999999999',
      phone: '9999900000',
      password: hashedAdminPass,
      role: 'super_admin',
      verification: {
        create: {
          status: 'approved',
          tesScore: 100,
          tesDecision: 'Super Admin Full System Authority',
          freefireVerified: true,
          otpVerified: true,
          telecomCircle: 'Andhra Pradesh & Telangana',
        },
      },
    },
  });

  if (process.env.SEED_PRODUCTION === 'true') {
    console.log('🚀 Production Seeding Complete: Verification Config & Master Admin account seeded.');
    console.log('----------------------------------------------------');
    return;
  }

  const admin = await prisma.player.upsert({
    where: { discordId: 'dev_admin_1001' },
    update: { phone: '9999900001', password: hashedAdminPass, role: 'admin' },
    create: {
      discordId: 'dev_admin_1001',
      discordUsername: 'admin_test',
      fullName: 'Vikram Admin',
      age: 26,
      primaryLanguage: 'Telugu',
      freefireUid: '999888777',
      phone: '9999900001',
      password: hashedAdminPass,
      role: 'admin',
      verification: {
        create: {
          status: 'approved',
          tesScore: 100,
          tesDecision: 'Admin Granted Full Verification',
          freefireVerified: true,
          otpVerified: true,
          telecomCircle: 'Andhra Pradesh & Telangana',
        },
      },
    },
  });

  const moderator = await prisma.player.upsert({
    where: { discordId: 'dev_mod_1002' },
    update: { phone: '9999900002', password: hashedModPass, role: 'moderator' },
    create: {
      discordId: 'dev_mod_1002',
      discordUsername: 'mod_test',
      fullName: 'Kiran Moderator',
      age: 24,
      primaryLanguage: 'Telugu',
      freefireUid: '999888776',
      phone: '9999900002',
      password: hashedModPass,
      role: 'moderator',
      verification: {
        create: {
          status: 'approved',
          tesScore: 95,
          tesDecision: 'Moderator Status Approved',
          freefireVerified: true,
          otpVerified: true,
          telecomCircle: 'Andhra Pradesh & Telangana',
        },
      },
    },
  });

  const captainHHK = await prisma.player.upsert({
    where: { discordId: 'dev_captain_1003' },
    update: { phone: '9876543210', password: hashedCaptainPass, role: 'player' },
    create: {
      discordId: 'dev_captain_1003',
      discordUsername: 'captain_hhk',
      fullName: 'Suresh Captain',
      age: 22,
      primaryLanguage: 'Telugu',
      freefireUid: '888111222',
      phone: '9876543210',
      password: hashedCaptainPass,
      role: 'player',
      verification: {
        create: {
          status: 'auto_approved',
          tesScore: 85,
          tesDecision: 'Auto-Approved: High Telugu Signal',
          freefireVerified: true,
          otpVerified: true,
          telecomCircle: 'Andhra Pradesh & Telangana',
        },
      },
    },
  });

  const p2 = await prisma.player.upsert({
    where: { discordId: 'dev_player_1004' },
    update: { password: hashedPlayerPass },
    create: {
      discordId: 'dev_player_1004',
      discordUsername: 'player_hhk2',
      fullName: 'Raju Sniper',
      age: 21,
      primaryLanguage: 'Telugu',
      freefireUid: '888111223',
      phone: '9876543211',
      password: hashedPlayerPass,
      role: 'player',
      verification: {
        create: {
          status: 'auto_approved',
          tesScore: 78,
          tesDecision: 'Auto-Approved',
          freefireVerified: true,
          otpVerified: true,
          telecomCircle: 'Andhra Pradesh & Telangana',
        },
      },
    },
  });

  const p3 = await prisma.player.upsert({
    where: { discordId: 'dev_player_1005' },
    update: { password: hashedPlayerPass },
    create: {
      discordId: 'dev_player_1005',
      discordUsername: 'player_hhk3',
      fullName: 'Mahesh Rusher',
      age: 20,
      primaryLanguage: 'Telugu',
      freefireUid: '888111224',
      phone: '9876543212',
      password: hashedPlayerPass,
      role: 'player',
      verification: {
        create: {
          status: 'auto_approved',
          tesScore: 72,
          tesDecision: 'Auto-Approved',
          freefireVerified: true,
          otpVerified: true,
          telecomCircle: 'Andhra Pradesh & Telangana',
        },
      },
    },
  });

  const p4 = await prisma.player.upsert({
    where: { discordId: 'dev_player_1006' },
    update: { password: hashedPlayerPass },
    create: {
      discordId: 'dev_player_1006',
      discordUsername: 'player_hhk4',
      fullName: 'Pawan Flanker',
      age: 23,
      primaryLanguage: 'Telugu',
      freefireUid: '888111225',
      phone: '9876543213',
      password: hashedPlayerPass,
      role: 'player',
      verification: {
        create: {
          status: 'auto_approved',
          tesScore: 68,
          tesDecision: 'Auto-Approved',
          freefireVerified: true,
          otpVerified: true,
          telecomCircle: 'Andhra Pradesh & Telangana',
        },
      },
    },
  });

  const devPlayer = await prisma.player.upsert({
    where: { discordId: 'dev_player_1008' },
    update: { phone: '9555544444', password: hashedPlayerPass, role: 'player' },
    create: {
      discordId: 'dev_player_1008',
      discordUsername: 'player_test',
      fullName: 'Test Player',
      age: 19,
      primaryLanguage: 'Telugu',
      freefireUid: '666111222',
      phone: '9555544444',
      password: hashedPlayerPass,
      role: 'player',
      verification: {
        create: {
          status: 'manual_review',
          tesScore: 50,
          tesDecision: 'Pending Manual Audit (40-59 TES Score)',
          freefireVerified: true,
          otpVerified: false,
        },
      },
    },
  });

  // 3. Test Team
  // 3. Teams (6 active squads)
  const teamsData = [
    { name: 'Hyderabad Hawks', tag: 'HHK', inviteCode: 'HHK-SQUAD-2026', capt: captainHHK },
    { name: 'Vizag Vipers', tag: 'VVP', inviteCode: 'VVP-SQUAD-2026', capt: p2 },
    { name: 'Warangal Warriors', tag: 'WWR', inviteCode: 'WWR-SQUAD-2026', capt: p3 },
    { name: 'Nellore Ninjas', tag: 'NNJ', inviteCode: 'NNJ-SQUAD-2026', capt: p4 },
    { name: 'Vijayawada Vultures', tag: 'VJV', inviteCode: 'VJV-SQUAD-2026', capt: devPlayer },
    { name: 'Telangana Tigers', tag: 'TGR', inviteCode: 'TGR-SQUAD-2026', capt: captainHHK },
  ];

  const createdTeams: any[] = [];
  for (const t of teamsData) {
    const tm = await prisma.team.upsert({
      where: { tag: t.tag },
      update: { status: 'confirmed' },
      create: {
        name: t.name,
        tag: t.tag,
        status: 'confirmed',
        inviteCode: t.inviteCode,
        captainId: t.capt.id,
        members: {
          create: [{ playerId: t.capt.id, isCore: true }],
        },
      },
    });
    createdTeams.push(tm);
  }

  // 4. Test Tournaments
  await prisma.payout.deleteMany();
  await prisma.matchResult.deleteMany();
  await prisma.match.deleteMany();
  await prisma.roomSlot.deleteMany();
  await prisma.room.deleteMany();
  await prisma.groupTeam.deleteMany();
  await prisma.group.deleteMany();
  await prisma.stageStanding.deleteMany();
  await prisma.stage.deleteMany();
  await prisma.scoringConfig.deleteMany();
  await prisma.tournamentRegistration.deleteMany();
  await prisma.tournament.deleteMany();

  const t1 = await prisma.tournament.create({
    data: {
      name: 'TeluguArena Pro Series Season 1',
      description: 'The flagship Telugu Free Fire championship with ₹50,000 prize pool.',
      format: 'squad',
      status: 'ongoing',
      prizePool: 50000,
      maxTeams: 48,
      eligibilityEnabled: true,
      rulebook: 'Standard TeluguArena Free Fire rules: 1 point per kill, placement points 1st: 12, 2nd: 9, 3rd: 8. Emulators prohibited.',
      scoringConfig: {
        create: {
          placementTable: { '1': 12, '2': 9, '3': 8, '4': 7, '5': 6, '6': 5, '7': 4, '8': 3, '9': 2, '10': 1 },
          killPoints: 1,
        },
      },
      registrations: {
        create: createdTeams.map((team) => ({ teamId: team.id, status: 'confirmed' })),
      },
    },
  });

  const t2 = await prisma.tournament.create({
    data: {
      name: 'TeluguArena Solo Cup 2026',
      description: 'Solo Free Fire tournament for individual aim gods.',
      format: 'solo',
      status: 'published',
      prizePool: 15000,
      maxTeams: 60,
      eligibilityEnabled: true,
      rulebook: 'Solo format. Mobile devices only.',
      scoringConfig: {
        create: {
          placementTable: { '1': 15, '2': 12, '3': 10, '4': 8, '5': 6 },
          killPoints: 1,
        },
      },
    },
  });

  const t3 = await prisma.tournament.create({
    data: {
      name: 'Andhra-Telangana Duo Clash',
      description: '2v2 duo survival series with fast progression and verified credentials.',
      format: 'duo',
      status: 'registration_open',
      prizePool: 25000,
      maxTeams: 24,
      eligibilityEnabled: true,
      scoringConfig: {
        create: {
          placementTable: { '1': 12, '2': 9, '3': 8, '4': 7, '5': 6 },
          killPoints: 1,
        },
      },
    },
  });

  const t4 = await prisma.tournament.create({
    data: {
      name: 'Winter Championship Grand Finals',
      description: 'Concluded winter showdown with audited cash payouts distributed.',
      format: 'squad',
      status: 'completed',
      prizePool: 75000,
      maxTeams: 48,
      eligibilityEnabled: true,
      scoringConfig: {
        create: {
          placementTable: { '1': 12, '2': 9, '3': 8, '4': 7, '5': 6 },
          killPoints: 1,
        },
      },
    },
  });

  // 5. Stages, Groups, Rooms, Matches
  const stg1 = await prisma.stage.create({
    data: {
      tournamentId: t1.id,
      name: 'Qualifiers (Round 1)',
      order: 1,
      status: 'completed',
      published: true,
    },
  });

  const stg2 = await prisma.stage.create({
    data: {
      tournamentId: t1.id,
      name: 'Semi-Finals (Group Stage)',
      order: 2,
      status: 'active',
      published: true,
    },
  });

  const grp1 = await prisma.group.create({
    data: {
      stageId: stg1.id,
      name: 'Group Alpha (Bermuda)',
      teams: {
        create: createdTeams.map((team) => ({ teamId: team.id })),
      },
    },
  });

  const room1 = await prisma.room.create({
    data: {
      stageId: stg1.id,
      roomCode: '9812734',
      password: 'ffarena88',
      map: 'Bermuda',
      scheduledAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      slots: {
        create: createdTeams.map((team, idx) => ({
          teamId: team.id,
          slotNo: idx + 1,
          checkedIn: true,
        })),
      },
    },
  });

  const match1 = await prisma.match.create({
    data: {
      groupId: grp1.id,
      roomId: room1.id,
      playedAt: new Date(Date.now() - 90 * 60 * 1000),
    },
  });

  const matchScores = [
    { placement: 1, kills: 14, placementPts: 12, killPts: 14, totalPts: 26 },
    { placement: 2, kills: 10, placementPts: 9, killPts: 10, totalPts: 19 },
    { placement: 3, kills: 8, placementPts: 8, killPts: 8, totalPts: 16 },
    { placement: 4, kills: 6, placementPts: 7, killPts: 6, totalPts: 13 },
    { placement: 5, kills: 4, placementPts: 6, killPts: 4, totalPts: 10 },
    { placement: 6, kills: 3, placementPts: 5, killPts: 3, totalPts: 8 },
  ];

  for (let i = 0; i < createdTeams.length; i++) {
    const sc = matchScores[i] || matchScores[matchScores.length - 1];
    await prisma.matchResult.create({
      data: {
        matchId: match1.id,
        teamId: createdTeams[i].id,
        placement: sc.placement,
        kills: sc.kills,
        placementPts: sc.placementPts,
        killPts: sc.killPts,
        totalPts: sc.totalPts,
        status: 'finalized',
        finalizedAt: new Date(),
      },
    });
  }

  // 6. Stage Standings (powers Season Rankings & Global Leaderboard)
  const teamStandings = [56, 45, 38, 29, 22, 17];
  for (let i = 0; i < createdTeams.length; i++) {
    await prisma.stageStanding.create({
      data: {
        stageId: stg1.id,
        teamId: createdTeams[i].id,
        totalPts: teamStandings[i],
        totalKills: Math.round(teamStandings[i] * 0.5),
        matchesPlayed: 2,
        bestPlacement: i + 1,
        rank: i + 1,
      },
    });
  }

  // 7. Payouts (powers Hall of Fame & Recent Winners)
  await prisma.payout.createMany({
    data: [
      {
        tournamentId: t4.id,
        teamId: createdTeams[0].id,
        playerId: captainHHK.id,
        amount: 35000,
        placement: 1,
        status: 'paid',
        txRef: 'UPI-TELARENA-99881',
        paidAt: new Date(),
      },
      {
        tournamentId: t4.id,
        teamId: createdTeams[1].id,
        playerId: p2.id,
        amount: 20000,
        placement: 2,
        status: 'paid',
        txRef: 'UPI-TELARENA-99882',
        paidAt: new Date(),
      },
      {
        tournamentId: t4.id,
        teamId: createdTeams[2].id,
        playerId: p3.id,
        amount: 10000,
        placement: 3,
        status: 'paid',
        txRef: 'UPI-TELARENA-99883',
        paidAt: new Date(),
      },
    ],
  });

  console.log('✅ Seed Completed Successfully!');
  console.log('----------------------------------------------------');
  console.log('Test Accounts Seeded:');
  console.log('  👑 Admin:     username: admin_test    (role: admin, pass: admin123)');
  console.log('  🔨 Moderator: username: mod_test      (role: moderator, pass: admin123)');
  console.log('  ⚔️ Captain:   username: captain_hhk   (role: player, Team: Hyderabad Hawks, pass: captain123)');
  console.log('----------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Seed Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
