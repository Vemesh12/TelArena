# TeluguArena - Custom Esports Tournament Platform

TeluguArena is a state-of-the-art competitive gaming platform designed in the premium, high-impact **Firestorm Esports** aesthetic. It automates tournament discovery, player registration, Anti-Eligibility regional checks, custom match room release, live standings leaderboards, score dispute appeals, and audited financial payouts.

---

## 📁 Project Structure

This repository is organized as a monorepo:
* **`/backend`**: NestJS API server built with TypeScript, Prisma ORM, BullMQ queues, and Socket.io.
* **`/frontend`**: Next.js client application built with React, Tailwind CSS, Framer Motion, and Lucide icons.

---

## 🛠️ Prerequisites

Make sure you have the following installed on your machine:
* **Node.js** (v18.x or v20.x recommended)
* **PostgreSQL** (Local or Neon DB)
* **Redis** (Local or Upstash Redis - required for BullMQ room release queues)

---

## 🚀 Local Quickstart Setup

### 1. Database & Backend Setup
1. Open your terminal in the `/backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy environment configuration and update database connection keys:
   * Rename `.env.example` to `.env` and configure:
     * `DATABASE_URL` (PostgreSQL connection string)
     * `REDIS_URL` (Redis server url, e.g. `redis://localhost:6379`)
     * `JWT_SECRET` (Secure random hash string)
     * `TELECOM_API_KEY` (Telecom circle API validation key)
     * `SUPABASE_URL` and `SUPABASE_KEY` (For image uploader bucket)
4. Push database tables and run the database seeder:
   ```bash
   npx prisma db push
   npx prisma db seed
   ```
5. Start the development backend:
   ```bash
   npm start
   ```
   * The backend will start on [http://localhost:3001](http://localhost:3001).

---

### 2. Frontend client Setup
1. Open a new terminal in the `/frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy environment configuration:
   * Create a `.env.local` file and add:
     ```env
     NEXT_PUBLIC_API_URL="http://localhost:3001"
     ```
4. Start the development client:
   ```bash
   npm run dev
   ```
   * The frontend will start on [http://localhost:3000](http://localhost:3000).

---

## 🌐 Production Deployment Guide

Follow this guide to deploy TeluguArena to production:

### Step A: Provision Neon DB (PostgreSQL)
1. Go to [Neon.tech](https://neon.tech/) and create a project.
2. Copy the **Connection String** from the dashboard.

### Step B: Provision Redis (Upstash)
1. Go to [Upstash Console](https://upstash.com/) and create a **Redis database** instance.
2. Copy the secure **Redis connection URL** (`rediss://default:...`).

### Step C: Deploy Backend (Render)
1. Go to [Render Console](https://render.com/) and create a **New Web Service**.
2. Select your repository, and configure:
   * **Root Directory**: `backend`
   * **Build Command**: `npm install && npm run build && npx prisma generate`
   * **Start Command**: `npx prisma db push && npm run start:prod`
3. Add the following **Environment Variables**:
   * `DATABASE_URL` (Neon PostgreSQL string)
   * `REDIS_URL` (Upstash Redis URL)
   * `JWT_SECRET` (Random secure key)
   * `FRONTEND_URL` (Set this to your live Vercel URL once generated)
   * `SUPABASE_URL` & `SUPABASE_KEY` (Supabase storage endpoints)
   * `DISCORD_CLIENT_ID` & `DISCORD_CLIENT_SECRET` (For Discord login integration)
   * `DISCORD_CALLBACK_URL` (`https://your-backend.onrender.com/auth/discord/callback`)

### Step D: Deploy Frontend (Vercel)
1. Go to [Vercel Dashboard](https://vercel.com/) and create a project.
2. Select your repository, choose the `frontend` folder as the Root Directory, and build.
3. Configure the following environment variable:
   * `NEXT_PUBLIC_API_URL`: Set to your live Render backend URL (`https://your-backend.onrender.com`).
4. Click **Deploy**.
