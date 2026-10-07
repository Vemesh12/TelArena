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
  const hhkTeam = await prisma.team.upsert({
    where: { tag: 'HHK' },
    update: {},
    create: {
      name: 'Hyderabad Hawks',
      tag: 'HHK',
      status: 'confirmed',
      inviteCode: 'HHK-SQUAD-2026',
      captainId: captainHHK.id,
      members: {
        create: [
          { playerId: captainHHK.id, isCore: true },
          { playerId: p2.id, isCore: true },
          { playerId: p3.id, isCore: true },
          { playerId: p4.id, isCore: true },
        ],
      },
    },
  });

  // 4. Test Tournaments (Clean up old ones first to prevent duplicates on multiple seed runs)
  await prisma.scoringConfig.deleteMany();
  await prisma.tournamentRegistration.deleteMany();
  await prisma.tournament.deleteMany();

  const t1 = await prisma.tournament.create({
    data: {
      name: 'TeluguArena Pro Series Season 1',
      description: 'The flagship Telugu Free Fire championship with ₹50,000 prize pool.',
      format: 'squad',
      status: 'registration_open',
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
        create: [
          { teamId: hhkTeam.id, status: 'confirmed' },
        ],
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

  console.log('✅ Seed Completed Successfully!');
  console.log('----------------------------------------------------');
  console.log('Test Accounts Seeded:');
  console.log('  👑 Admin:     username: admin_test    (role: admin)');
  console.log('  🔨 Moderator: username: mod_test      (role: moderator)');
  console.log('  ⚔️ Captain:   username: captain_hhk   (role: player, Team: Hyderabad Hawks [HHK])');
  console.log('  🛡️ Player:    username: player_test   (role: player, TES status: manual_review)');
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
