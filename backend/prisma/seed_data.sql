-- ==============================================================================
-- TelArena PostgreSQL Complete Seed Data Script
-- Safe & idempotent script: inserts all tournaments, teams, players, leaderboards,
-- matches, payouts (hall of fame), and registrations.
-- ==============================================================================

BEGIN;

-- 1. Verification Config
INSERT INTO "VerificationConfig" ("id", "autoApproveMin", "manualReviewMin", "updatedAt")
VALUES ('default_config', 60, 40, NOW())
ON CONFLICT ("id") DO UPDATE SET "autoApproveMin" = 60, "manualReviewMin" = 40, "updatedAt" = NOW();

-- 2. Players (Passwords: admin123, captain123, player123)
-- Admin
INSERT INTO "Player" ("id", "discordId", "discordUsername", "fullName", "age", "primaryLanguage", "freefireUid", "phone", "password", "role", "createdAt", "updatedAt")
VALUES ('usr_admin_01', 'dev_admin_1001', 'admin_test', 'Vikram Admin', 26, 'Telugu', '999888777', '9999900001', '$2b$10$ZC8uzi3xpCRTKg92LXJtOuZvBo3G02Dm0.JkQn4JJNa.lkcl4T6Ka', 'admin', NOW(), NOW())
ON CONFLICT ("phone") DO UPDATE SET "role" = 'admin', "fullName" = 'Vikram Admin';

-- Moderator
INSERT INTO "Player" ("id", "discordId", "discordUsername", "fullName", "age", "primaryLanguage", "freefireUid", "phone", "password", "role", "createdAt", "updatedAt")
VALUES ('usr_mod_01', 'dev_mod_1002', 'mod_test', 'Kiran Moderator', 24, 'Telugu', '999888776', '9999900002', '$2b$10$ZC8uzi3xpCRTKg92LXJtOuZvBo3G02Dm0.JkQn4JJNa.lkcl4T6Ka', 'moderator', NOW(), NOW())
ON CONFLICT ("phone") DO UPDATE SET "role" = 'moderator', "fullName" = 'Kiran Moderator';

-- Captain 1: Hyderabad Hawks (HHK)
INSERT INTO "Player" ("id", "discordId", "discordUsername", "fullName", "age", "primaryLanguage", "freefireUid", "phone", "password", "role", "createdAt", "updatedAt")
VALUES ('usr_hhk_capt', 'dev_captain_1003', 'captain_hhk', 'Suresh Captain', 22, 'Telugu', '888111222', '9876543210', '$2b$10$Ex3rj0mkfOcysuioKhKg0OE3dbLBiz7X.80h59vnbQTmiZTg5VTca', 'player', NOW(), NOW())
ON CONFLICT ("phone") DO UPDATE SET "fullName" = 'Suresh Captain';

-- HHK Squad Members
INSERT INTO "Player" ("id", "discordId", "discordUsername", "fullName", "age", "primaryLanguage", "freefireUid", "phone", "password", "role", "createdAt", "updatedAt")
VALUES 
  ('usr_hhk_p2', 'dev_player_1004', 'raju_sniper', 'Raju Sniper', 21, 'Telugu', '888111223', '9876543211', '$2b$10$dSZUwZ1Fgy.dY1zo6fQELuQV0arP8esIyAg1DL2JTBQKv4B5tU84e', 'player', NOW(), NOW()),
  ('usr_hhk_p3', 'dev_player_1005', 'mahesh_rush', 'Mahesh Rusher', 20, 'Telugu', '888111224', '9876543212', '$2b$10$dSZUwZ1Fgy.dY1zo6fQELuQV0arP8esIyAg1DL2JTBQKv4B5tU84e', 'player', NOW(), NOW()),
  ('usr_hhk_p4', 'dev_player_1006', 'pawan_flank', 'Pawan Flanker', 23, 'Telugu', '888111225', '9876543213', '$2b$10$dSZUwZ1Fgy.dY1zo6fQELuQV0arP8esIyAg1DL2JTBQKv4B5tU84e', 'player', NOW(), NOW())
ON CONFLICT ("phone") DO NOTHING;

-- Captain 2: Vizag Vipers (VVP)
INSERT INTO "Player" ("id", "discordId", "discordUsername", "fullName", "age", "primaryLanguage", "freefireUid", "phone", "password", "role", "createdAt", "updatedAt")
VALUES ('usr_vvp_capt', 'dev_captain_2001', 'captain_vvp', 'Tarun Captain', 23, 'Telugu', '888222111', '9876543220', '$2b$10$Ex3rj0mkfOcysuioKhKg0OE3dbLBiz7X.80h59vnbQTmiZTg5VTca', 'player', NOW(), NOW())
ON CONFLICT ("phone") DO UPDATE SET "fullName" = 'Tarun Captain';

-- Captain 3: Warangal Warriors (WWR)
INSERT INTO "Player" ("id", "discordId", "discordUsername", "fullName", "age", "primaryLanguage", "freefireUid", "phone", "password", "role", "createdAt", "updatedAt")
VALUES ('usr_wwr_capt', 'dev_captain_3001', 'captain_wwr', 'Praveen Captain', 22, 'Telugu', '888333111', '9876543230', '$2b$10$Ex3rj0mkfOcysuioKhKg0OE3dbLBiz7X.80h59vnbQTmiZTg5VTca', 'player', NOW(), NOW())
ON CONFLICT ("phone") DO UPDATE SET "fullName" = 'Praveen Captain';

-- Captain 4: Nellore Ninjas (NNJ)
INSERT INTO "Player" ("id", "discordId", "discordUsername", "fullName", "age", "primaryLanguage", "freefireUid", "phone", "password", "role", "createdAt", "updatedAt")
VALUES ('usr_nnj_capt', 'dev_captain_4001', 'captain_nnj', 'Dinesh Captain', 21, 'Telugu', '888444111', '9876543240', '$2b$10$Ex3rj0mkfOcysuioKhKg0OE3dbLBiz7X.80h59vnbQTmiZTg5VTca', 'player', NOW(), NOW())
ON CONFLICT ("phone") DO UPDATE SET "fullName" = 'Dinesh Captain';

-- Captain 5: Vijayawada Vultures (VJV)
INSERT INTO "Player" ("id", "discordId", "discordUsername", "fullName", "age", "primaryLanguage", "freefireUid", "phone", "password", "role", "createdAt", "updatedAt")
VALUES ('usr_vjv_capt', 'dev_captain_5001', 'captain_vjv', 'Varun Captain', 24, 'Telugu', '888555111', '9876543250', '$2b$10$Ex3rj0mkfOcysuioKhKg0OE3dbLBiz7X.80h59vnbQTmiZTg5VTca', 'player', NOW(), NOW())
ON CONFLICT ("phone") DO UPDATE SET "fullName" = 'Varun Captain';

-- Captain 6: Telangana Tigers (TGR)
INSERT INTO "Player" ("id", "discordId", "discordUsername", "fullName", "age", "primaryLanguage", "freefireUid", "phone", "password", "role", "createdAt", "updatedAt")
VALUES ('usr_tgr_capt', 'dev_captain_6001', 'captain_tgr', 'Sai Captain', 22, 'Telugu', '888666111', '9876543260', '$2b$10$Ex3rj0mkfOcysuioKhKg0OE3dbLBiz7X.80h59vnbQTmiZTg5VTca', 'player', NOW(), NOW())
ON CONFLICT ("phone") DO UPDATE SET "fullName" = 'Sai Captain';

-- 3. Player Verifications
INSERT INTO "Verification" ("id", "playerId", "status", "tesScore", "tesDecision", "freefireVerified", "otpVerified", "telecomCircle", "createdAt", "updatedAt")
VALUES
  ('ver_admin', 'usr_admin_01', 'approved', 100, 'Admin Full Access', true, true, 'Andhra Pradesh & Telangana', NOW(), NOW()),
  ('ver_mod', 'usr_mod_01', 'approved', 95, 'Moderator Access', true, true, 'Andhra Pradesh & Telangana', NOW(), NOW()),
  ('ver_hhk', 'usr_hhk_capt', 'auto_approved', 85, 'Auto-Approved High Signal', true, true, 'Andhra Pradesh & Telangana', NOW(), NOW()),
  ('ver_hhk_2', 'usr_hhk_p2', 'auto_approved', 80, 'Auto-Approved', true, true, 'Andhra Pradesh & Telangana', NOW(), NOW()),
  ('ver_hhk_3', 'usr_hhk_p3', 'auto_approved', 78, 'Auto-Approved', true, true, 'Andhra Pradesh & Telangana', NOW(), NOW()),
  ('ver_hhk_4', 'usr_hhk_p4', 'auto_approved', 75, 'Auto-Approved', true, true, 'Andhra Pradesh & Telangana', NOW(), NOW()),
  ('ver_vvp', 'usr_vvp_capt', 'auto_approved', 82, 'Auto-Approved', true, true, 'Andhra Pradesh & Telangana', NOW(), NOW()),
  ('ver_wwr', 'usr_wwr_capt', 'auto_approved', 88, 'Auto-Approved', true, true, 'Andhra Pradesh & Telangana', NOW(), NOW()),
  ('ver_nnj', 'usr_nnj_capt', 'auto_approved', 84, 'Auto-Approved', true, true, 'Andhra Pradesh & Telangana', NOW(), NOW()),
  ('ver_vjv', 'usr_vjv_capt', 'auto_approved', 86, 'Auto-Approved', true, true, 'Andhra Pradesh & Telangana', NOW(), NOW()),
  ('ver_tgr', 'usr_tgr_capt', 'auto_approved', 80, 'Auto-Approved', true, true, 'Andhra Pradesh & Telangana', NOW(), NOW())
ON CONFLICT ("playerId") DO UPDATE SET "status" = 'auto_approved', "freefireVerified" = true, "otpVerified" = true;

-- 4. Teams
INSERT INTO "Team" ("id", "name", "tag", "status", "inviteCode", "captainId", "createdAt", "updatedAt")
VALUES
  ('team_hhk', 'Hyderabad Hawks', 'HHK', 'confirmed', 'HHK-SQUAD-2026', 'usr_hhk_capt', NOW(), NOW()),
  ('team_vvp', 'Vizag Vipers', 'VVP', 'confirmed', 'VVP-SQUAD-2026', 'usr_vvp_capt', NOW(), NOW()),
  ('team_wwr', 'Warangal Warriors', 'WWR', 'confirmed', 'WWR-SQUAD-2026', 'usr_wwr_capt', NOW(), NOW()),
  ('team_nnj', 'Nellore Ninjas', 'NNJ', 'confirmed', 'NNJ-SQUAD-2026', 'usr_nnj_capt', NOW(), NOW()),
  ('team_vjv', 'Vijayawada Vultures', 'VJV', 'confirmed', 'VJV-SQUAD-2026', 'usr_vjv_capt', NOW(), NOW()),
  ('team_tgr', 'Telangana Tigers', 'TGR', 'confirmed', 'TGR-SQUAD-2026', 'usr_tgr_capt', NOW(), NOW())
ON CONFLICT ("tag") DO UPDATE SET "name" = EXCLUDED."name", "status" = 'confirmed';

-- Team Members
INSERT INTO "TeamMember" ("id", "teamId", "playerId", "isCore", "joinedAt")
VALUES
  ('tm_hhk_1', 'team_hhk', 'usr_hhk_capt', true, NOW()),
  ('tm_hhk_2', 'team_hhk', 'usr_hhk_p2', true, NOW()),
  ('tm_hhk_3', 'team_hhk', 'usr_hhk_p3', true, NOW()),
  ('tm_hhk_4', 'team_hhk', 'usr_hhk_p4', true, NOW()),
  ('tm_vvp_1', 'team_vvp', 'usr_vvp_capt', true, NOW()),
  ('tm_wwr_1', 'team_wwr', 'usr_wwr_capt', true, NOW()),
  ('tm_nnj_1', 'team_nnj', 'usr_nnj_capt', true, NOW()),
  ('tm_vjv_1', 'team_vjv', 'usr_vjv_capt', true, NOW()),
  ('tm_tgr_1', 'team_tgr', 'usr_tgr_capt', true, NOW())
ON CONFLICT ("teamId", "playerId") DO NOTHING;

-- 5. Tournaments
INSERT INTO "Tournament" ("id", "name", "description", "format", "status", "maxTeams", "eligibilityEnabled", "prizePool", "entryFee", "createdAt", "updatedAt")
VALUES
  ('trn_pro_s1', 'TeluguArena Pro Series Season 1', 'Flagship regional Free Fire championship with verified squads, audited rooms, and guaranteed cash prize pool.', 'squad', 'ongoing', 48, true, 50000, 0, NOW(), NOW()),
  ('trn_solo_c1', 'TeluguArena Solo Cup 2026', 'High-intensity solo Free Fire battle for the sharpest marksmen across Andhra & Telangana.', 'solo', 'published', 60, true, 15000, 49, NOW(), NOW()),
  ('trn_duo_c1', 'Andhra-Telangana Duo Clash', '2v2 duo survival series with instant bracket progression and fast rooms.', 'duo', 'registration_open', 24, true, 25000, 0, NOW(), NOW()),
  ('trn_winter_f1', 'Winter Championship Grand Finals', 'Concluded premier winter showdown. All standings finalized and verified payouts distributed.', 'squad', 'completed', 48, true, 75000, 99, NOW(), NOW())
ON CONFLICT ("id") DO UPDATE SET "status" = EXCLUDED."status", "prizePool" = EXCLUDED."prizePool";

-- Scoring Configs
INSERT INTO "ScoringConfig" ("id", "tournamentId", "placementTable", "killPoints")
VALUES
  ('sc_pro_s1', 'trn_pro_s1', '{"1":12,"2":9,"3":8,"4":7,"5":6,"6":5,"7":4,"8":3,"9":2,"10":1}'::json, 1),
  ('sc_solo_c1', 'trn_solo_c1', '{"1":15,"2":12,"3":10,"4":8,"5":6}'::json, 1),
  ('sc_duo_c1', 'trn_duo_c1', '{"1":12,"2":9,"3":8,"4":7,"5":6}'::json, 1),
  ('sc_winter_f1', 'trn_winter_f1', '{"1":12,"2":9,"3":8,"4":7,"5":6}'::json, 1)
ON CONFLICT ("tournamentId") DO NOTHING;

-- Tournament Registrations
INSERT INTO "TournamentRegistration" ("id", "tournamentId", "teamId", "status", "createdAt")
VALUES
  ('reg_pro_1', 'trn_pro_s1', 'team_hhk', 'confirmed', NOW()),
  ('reg_pro_2', 'trn_pro_s1', 'team_vvp', 'confirmed', NOW()),
  ('reg_pro_3', 'trn_pro_s1', 'team_wwr', 'confirmed', NOW()),
  ('reg_pro_4', 'trn_pro_s1', 'team_nnj', 'confirmed', NOW()),
  ('reg_pro_5', 'trn_pro_s1', 'team_vjv', 'confirmed', NOW()),
  ('reg_pro_6', 'trn_pro_s1', 'team_tgr', 'confirmed', NOW()),
  ('reg_wnt_1', 'trn_winter_f1', 'team_hhk', 'confirmed', NOW()),
  ('reg_wnt_2', 'trn_winter_f1', 'team_vvp', 'confirmed', NOW()),
  ('reg_wnt_3', 'trn_winter_f1', 'team_wwr', 'confirmed', NOW()),
  ('reg_duo_1', 'trn_duo_c1', 'team_hhk', 'confirmed', NOW()),
  ('reg_duo_2', 'trn_duo_c1', 'team_vvp', 'confirmed', NOW())
ON CONFLICT ("tournamentId", "teamId") DO NOTHING;

-- 6. Stages & Groups
INSERT INTO "Stage" ("id", "tournamentId", "name", "order", "status", "published", "createdAt", "updatedAt")
VALUES
  ('stg_pro_q1', 'trn_pro_s1', 'Qualifiers (Round 1)', 1, 'completed', true, NOW(), NOW()),
  ('stg_pro_s1', 'trn_pro_s1', 'Semi-Finals (Group Stage)', 2, 'active', true, NOW(), NOW()),
  ('stg_pro_f1', 'trn_pro_s1', 'Grand Finals', 3, 'upcoming', true, NOW(), NOW()),
  ('stg_wnt_f1', 'trn_winter_f1', 'Championship Finals', 1, 'completed', true, NOW(), NOW())
ON CONFLICT ("id") DO UPDATE SET "status" = EXCLUDED."status";

-- Groups
INSERT INTO "Group" ("id", "stageId", "name")
VALUES
  ('grp_pro_a', 'stg_pro_q1', 'Group Alpha (Bermuda)'),
  ('grp_pro_b', 'stg_pro_s1', 'Semi-Finals Group 1'),
  ('grp_wnt_1', 'stg_wnt_f1', 'Grand Finals Lobby')
ON CONFLICT ("id") DO NOTHING;

-- Group Teams
INSERT INTO "GroupTeam" ("id", "groupId", "teamId")
VALUES
  ('gt_1', 'grp_pro_a', 'team_hhk'),
  ('gt_2', 'grp_pro_a', 'team_vvp'),
  ('gt_3', 'grp_pro_a', 'team_wwr'),
  ('gt_4', 'grp_pro_a', 'team_nnj'),
  ('gt_5', 'grp_pro_a', 'team_vjv'),
  ('gt_6', 'grp_pro_a', 'team_tgr'),
  ('gt_7', 'grp_wnt_1', 'team_hhk'),
  ('gt_8', 'grp_wnt_1', 'team_vvp'),
  ('gt_9', 'grp_wnt_1', 'team_wwr')
ON CONFLICT ("groupId", "teamId") DO NOTHING;

-- 7. Rooms & Room Slots
INSERT INTO "Room" ("id", "stageId", "roomCode", "password", "map", "scheduledAt", "releaseMinutes", "createdAt")
VALUES
  ('room_pro_01', 'stg_pro_q1', '9812734', 'ffarena88', 'Bermuda', NOW() - INTERVAL '2 hours', 15, NOW()),
  ('room_wnt_01', 'stg_wnt_f1', '7645129', 'winfinals', 'Purgatory', NOW() - INTERVAL '1 day', 15, NOW())
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "RoomSlot" ("id", "roomId", "teamId", "slotNo", "checkedIn", "checkedInAt")
VALUES
  ('slot_1', 'room_pro_01', 'team_hhk', 1, true, NOW() - INTERVAL '2 hours'),
  ('slot_2', 'room_pro_01', 'team_vvp', 2, true, NOW() - INTERVAL '2 hours'),
  ('slot_3', 'room_pro_01', 'team_wwr', 3, true, NOW() - INTERVAL '2 hours'),
  ('slot_4', 'room_pro_01', 'team_nnj', 4, true, NOW() - INTERVAL '2 hours'),
  ('slot_5', 'room_pro_01', 'team_vjv', 5, true, NOW() - INTERVAL '2 hours'),
  ('slot_6', 'room_pro_01', 'team_tgr', 6, true, NOW() - INTERVAL '2 hours')
ON CONFLICT ("roomId", "teamId") DO NOTHING;

-- 8. Matches & Finalized Match Results
INSERT INTO "Match" ("id", "groupId", "roomId", "playedAt", "createdAt")
VALUES
  ('match_pro_01', 'grp_pro_a', 'room_pro_01', NOW() - INTERVAL '100 minutes', NOW()),
  ('match_wnt_01', 'grp_wnt_1', 'room_wnt_01', NOW() - INTERVAL '1 day', NOW())
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "MatchResult" ("id", "matchId", "teamId", "placement", "kills", "placementPts", "killPts", "totalPts", "status", "finalizedAt", "createdAt", "updatedAt")
VALUES
  ('res_p1_hhk', 'match_pro_01', 'team_hhk', 1, 14, 12, 14, 26, 'finalized', NOW() - INTERVAL '90 minutes', NOW(), NOW()),
  ('res_p1_vvp', 'match_pro_01', 'team_vvp', 2, 10, 9, 10, 19, 'finalized', NOW() - INTERVAL '90 minutes', NOW(), NOW()),
  ('res_p1_wwr', 'match_pro_01', 'team_wwr', 3, 8, 8, 8, 16, 'finalized', NOW() - INTERVAL '90 minutes', NOW(), NOW()),
  ('res_p1_nnj', 'match_pro_01', 'team_nnj', 4, 6, 7, 6, 13, 'finalized', NOW() - INTERVAL '90 minutes', NOW(), NOW()),
  ('res_p1_vjv', 'match_pro_01', 'team_vjv', 5, 4, 6, 4, 10, 'finalized', NOW() - INTERVAL '90 minutes', NOW(), NOW()),
  ('res_p1_tgr', 'match_pro_01', 'team_tgr', 6, 3, 5, 3, 8, 'finalized', NOW() - INTERVAL '90 minutes', NOW(), NOW())
ON CONFLICT ("matchId", "teamId") DO UPDATE SET "totalPts" = EXCLUDED."totalPts", "status" = 'finalized';

-- 9. Stage Standings (Powers the Season Leaderboard & Global Team Rankings)
INSERT INTO "StageStanding" ("id", "stageId", "teamId", "totalPts", "totalKills", "matchesPlayed", "bestPlacement", "rank")
VALUES
  ('stnd_hhk', 'stg_pro_q1', 'team_hhk', 56, 32, 2, 1, 1),
  ('stnd_vvp', 'stg_pro_q1', 'team_vvp', 45, 24, 2, 2, 2),
  ('stnd_wwr', 'stg_pro_q1', 'team_wwr', 38, 19, 2, 3, 3),
  ('stnd_nnj', 'stg_pro_q1', 'team_nnj', 29, 14, 2, 4, 4),
  ('stnd_vjv', 'stg_pro_q1', 'team_vjv', 22, 10, 2, 5, 5),
  ('stnd_tgr', 'stg_pro_q1', 'team_tgr', 17, 8, 2, 6, 6)
ON CONFLICT ("id") DO UPDATE SET "totalPts" = EXCLUDED."totalPts", "rank" = EXCLUDED."rank";

-- 10. Payouts (Powers the Hall of Fame & Recent Winners section)
INSERT INTO "Payout" ("id", "tournamentId", "teamId", "playerId", "amount", "placement", "status", "txRef", "paidAt", "createdAt", "updatedAt")
VALUES
  ('pay_wnt_1', 'trn_winter_f1', 'team_hhk', 'usr_hhk_capt', 35000, 1, 'paid', 'UPI-TELARENA-99881', NOW() - INTERVAL '1 day', NOW(), NOW()),
  ('pay_wnt_2', 'trn_winter_f1', 'team_vvp', 'usr_vvp_capt', 20000, 2, 'paid', 'UPI-TELARENA-99882', NOW() - INTERVAL '1 day', NOW(), NOW()),
  ('pay_wnt_3', 'trn_winter_f1', 'team_wwr', 'usr_wwr_capt', 10000, 3, 'paid', 'UPI-TELARENA-99883', NOW() - INTERVAL '1 day', NOW(), NOW())
ON CONFLICT ("id") DO UPDATE SET "status" = 'paid', "amount" = EXCLUDED."amount";

-- 11. Announcements
INSERT INTO "Announcement" ("id", "tournamentId", "title", "body", "published", "createdAt", "updatedAt")
VALUES
  ('ann_1', 'trn_pro_s1', 'Season 1 Qualifiers Concluded — Semi-Finals Live!', 'Top squads from Group Alpha and Beta have advanced to Semi-Finals. Check room credentials 15 minutes before scheduled match times.', true, NOW(), NOW()),
  ('ann_2', 'trn_winter_f1', 'Winter Championship Grand Finals Payouts Dispatched', 'All cash prize winnings have been audited and disbursed to team captains via UPI.', true, NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

COMMIT;
