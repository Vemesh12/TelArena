# ⚙️ MBG Arena — NestJS Backend API

Backend REST API & Real-time WebSockets for MBG Arena Free Fire Esports Platform.

---

## 🔑 Pre-Seeded Mobile & Password Credentials

The database seed (`npx prisma db seed`) populates PostgreSQL with the following Mobile & Password accounts:

| Role | Mobile Number | Password | Username | System Access & Role Permissions |
| :--- | :--- | :--- | :--- | :--- |
| 👑⚡ `super_admin` | `9999900000` | `admin123` | `superadmin_test` | Full System Authority — Grant Admin & Moderator roles to any registered player in `/admin`. |
| 👑 `admin` | `9999900001` | `admin123` | `admin_test` | System Admin Access (`/admin`) — Tournament Creation, Dispute Resolution, Match Score Entry, Grant Mod roles. |
| ⚔️ `player` (Captain) | `9876543210` | `captain123` | `captain_hhk` | Squad Captain of *Hyderabad Hawks [HHK]*, 4-Man Squad Roster Management, Tournament Registration. |
| 🔨 `moderator` | `9999900002` | `mod123` | `mod_test` | Platform Moderator Access — TES Verification Review Queue & Room Credentials Release. |
| 🛡️ `player` | `9555544444` | `player123` | `player_test` | Standard Registered Player (TES status: `manual_review`, Score: 50/100). |

---

## 🧪 Mobile Login REST API Usage

To authenticate via API or cURL using Mobile Number & Password:

```bash
# Login as Super Admin
curl -X POST http://localhost:3001/auth/login-mobile \
  -H "Content-Type: application/json" \
  -d '{"phone": "9999900000", "password": "admin123"}'

# Login as System Admin
curl -X POST http://localhost:3001/auth/login-mobile \
  -H "Content-Type: application/json" \
  -d '{"phone": "9999900001", "password": "admin123"}'
```

---

## 🌱 Database Setup & Seeding

```bash
# 1. Sync database schema
npx prisma db push

# 2. Seed database with test accounts, teams, and tournaments
npx prisma db seed
# OR
npm run seed
```

---

## 🚀 Running Backend

```bash
# Development
npm run start:dev

# Production Build
npm run build
npm run start:prod
```

- API Base URL: `http://localhost:3001`
- Swagger Interactive Docs: `http://localhost:3001/api/docs`
