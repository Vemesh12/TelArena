# 🎮 MBG Arena — Free Fire Esports Platform

MBG Arena is a premier Telugu Free Fire esports tournament platform built with **Next.js 14**, **TailwindCSS**, **TypeScript**, **NestJS**, and **Prisma ORM (PostgreSQL)**.

---

## 🔑 Pre-Seeded Mobile & Password Test Credentials

You can log in to test any role using the **Mobile Login** form in the top navbar authentication modal. Enter the corresponding **Mobile Number** and **Password**:

| Role | Mobile Number | Password | Username | Key Pages & Role Permissions |
| :--- | :--- | :--- | :--- | :--- |
| 👑⚡ **Super Admin** | `9999900000` | `admin123` | `superadmin_test` | **Full Platform Authority** — Grant Admin & Moderator access to any player in `/admin`. |
| 👑 **System Admin** | `9999900001` | `admin123` | `admin_test` | **System Admin** — Create Tournaments (Module E), TES Queue, Match Scores (Module I), Grant Mod access. |
| ⚔️ **Squad Captain** | `9876543210` | `captain123` | `captain_hhk` | **Team Leader** — Manage squad roster in `/teams`, Register squad, View room code/pass in `/dashboard`. |
| 🔨 **Moderator** | `9999900002` | `mod123` | `mod_test` | **Moderator** — Review pending player verifications and monitor match room scores. |
| 🛡️ **Player** | `9555544444` | `player123` | `player_test` | **Standard Player** — Complete 3-step Telugu Eligibility Score (TES) engine in `/verify`. |

---

## 🚀 Step-by-Step Testing Guide

### 1. How to Test as Super Admin 👑⚡
1. Click **Login** in the top navigation bar.
2. Enter Mobile **`9999900000`** and Password **`admin123`** (or click the Super Admin reference button to auto-fill).
3. Click **`LOGIN TO ACCOUNT →`**.
4. Navigate to **Admin Control Panel** (`/admin`) → **Player Roles & Management** tab.
5. Search for any registered player and click **`Give Admin Access 👑`** or **`Give Mod Access 🔨`**.

### 2. How to Test as System Admin 👑
1. Click **Login** in the top navigation bar.
2. Select **👑 System Admin (`admin_test`)**.
3. Navigate to `/admin` — Create new tournaments, enter custom room match scores, and review pending TES verifications.

### 3. How to Test as Squad Captain ⚔️
1. Click **Login** in the top navigation bar.
2. Select **⚔️ Squad Captain (`captain_hhk`)**.
3. Navigate to **Team HQ** (`/teams`) to manage the *Hyderabad Hawks* 4-player squad roster.
4. Navigate to **Tournaments** (`/tournaments/1`) and click **Register Confirmed Squad**.
5. Check **Player Dashboard** (`/dashboard`) to view scheduled match custom room code & password release.

### 4. How to Test as New Player 🛡️
1. Click **Login** in the top navigation bar or **Sign Up** to create a custom account.
2. Select **🛡️ Standard Player (`player_test`)**.
3. Navigate to **Verification** (`/verify`) to test the 3-step Telugu Eligibility Score (TES) engine.

---

## 🛠️ Database Setup & Re-Seeding

The database is powered by PostgreSQL via Prisma. To re-seed test data at any time:

```bash
# From the backend directory:
cd backend
npx prisma db push
npx prisma db seed
```

---

## 💻 Local Development Commands

### Backend Server (NestJS)
```bash
cd backend
npm run start:dev
```
- API Endpoint: `http://localhost:3001`
- Swagger Interactive Docs: `http://localhost:3001/api/docs`

### Frontend Server (Next.js)
```bash
cd frontend
npm run dev
```
- Web Application URL: `http://localhost:3000` (or `http://localhost:3002` if port 3000 is occupied)

---

## 🔧 Applied System Fixes

1. **Modal Layout & Vertical Scroll Fix**:
   - Fixed modal viewport height (`max-h-[85vh]`) and scroll behavior so top headers and action buttons are never cut off or clipped.
2. **NestJS Module Dependency Resolution**:
   - Fixed `TournamentsController` dependency error by importing `TeamsModule` into `TournamentsModule`, `DisputesModule`, and `RoomsModule`.
3. **One-Click Instant Authentication**:
   - Implemented `/auth/dev-login` REST endpoint and frontend modal integration for seamless local testing without Discord OAuth setup.
4. **Full Screen 1920px Fluid Responsive Design**:
   - Updated layout structure across all pages to fill 100% full screen width up to 1920px canvas, responsive across mobile, tablet, desktop, and 4K displays.
