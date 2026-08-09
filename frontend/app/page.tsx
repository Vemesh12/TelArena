"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Trophy, Users, ShieldCheck, ArrowRight, Swords, Wallet, Star,
  TrendingUp, TrendingDown, Minus, Crown, Sparkles,
} from "lucide-react";
import { CountdownTimer } from "@/components/ui/CountdownTimer";
import { HeroVisual } from "@/components/ui/HeroVisual";
import { StatCallout } from "@/components/ui/StatCallout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Footer } from "@/components/ui/Footer";
import { TournamentCard, type TournamentCardData } from "@/components/tournaments/TournamentCard";
import { api } from "@/lib/api";

const NEXT_TOURNAMENT_DATE = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000);

const featuredTournaments: TournamentCardData[] = [
  { id: "demo-1", name: "TelArena Pro Series — Season 1", format: "squad", prizePool: 50000, status: "registration_open", registrations: 32, maxTeams: 48, entryFee: 0, map: "Erangel", organizer: "TelArena", difficulty: "Pro" },
  { id: "demo-2", name: "TelArena Solo Cup", format: "solo", prizePool: 15000, status: "published", registrations: 12, maxTeams: 60, entryFee: 49, map: "Bermuda", organizer: "TelArena", difficulty: "Intermediate" },
  { id: "demo-3", name: "TelArena Duo Clash", format: "duo", prizePool: 25000, status: "ongoing", registrations: 24, maxTeams: 24, entryFee: 0, map: "Miramar", organizer: "TelArena", difficulty: "Pro" },
  { id: "demo-4", name: "Rookie Rumble — Open Qualifiers", format: "squad", prizePool: 8000, status: "published", registrations: 41, maxTeams: 64, entryFee: 0, map: "Sanhok", organizer: "Community", difficulty: "Beginner" },
];

const steps = [
  { icon: ShieldCheck, title: "Verify", body: "Link your Free Fire / BGMI UID and confirm your identity in under 2 minutes." },
  { icon: Users, title: "Build a Squad", body: "Create or join a team, vouch teammates, and lock your roster." },
  { icon: Swords, title: "Compete", body: "Register for a bracket, receive room credentials, and play it out." },
  { icon: Wallet, title: "Get Paid", body: "Standings are audited and payouts land directly with your captain." },
];

const leaderboardPreview = [
  { rank: 1, team: "Hyderabad Hawks", tag: "HHK", pts: 842, trend: "up" as const },
  { rank: 2, team: "Vizag Vipers", tag: "VVP", pts: 789, trend: "up" as const },
  { rank: 3, team: "Warangal Warriors", tag: "WWR", pts: 756, trend: "down" as const },
  { rank: 4, team: "Nellore Ninjas", tag: "NNJ", pts: 701, trend: "same" as const },
  { rank: 5, team: "Vijayawada Vultures", tag: "VJV", pts: 664, trend: "up" as const },
];

const recentWinners = [
  { team: "Hyderabad Hawks", event: "Pro Series Season 1", prize: 25000, placement: "1st Place" },
  { team: "Vizag Vipers", event: "Pro Series Season 1", prize: 15000, placement: "2nd Place" },
  { team: "Warangal Warriors", event: "Solo Cup Finale", prize: 8000, placement: "1st Place" },
];

const testimonials = [
  { quote: "First platform where room codes and payouts actually arrived on time, every single match.", author: "Squad Captain, Hyderabad Hawks" },
  { quote: "Verification took two minutes and I was registered for my first bracket the same day.", author: "Solo Player, Vizag" },
  { quote: "Disputes get reviewed with actual evidence, not just admin vibes. Feels legitimate.", author: "Team Manager, Warangal Warriors" },
];

const faqs = [
  { q: "How do I get paid after winning?", a: "Once standings are finalized by admins, payout records are generated automatically and your team captain receives funds via UPI within 48 hours." },
  { q: "What if I don't have a full squad?", a: "You can join an open team via invite code, or register solo/duo formats depending on the tournament type." },
  { q: "How does identity verification work?", a: "We check your Free Fire UID ownership, mobile OTP, and telecom circle signals to compute an eligibility score — most players are auto-approved instantly." },
  { q: "What happens if there's a scoring dispute?", a: "Raise a dispute with evidence directly from your dashboard. Moderators review and can amend standings before payouts are finalized." },
];

const sponsors = ["ASUS ROG", "Corsair", "Razer", "HP OMEN", "AMD", "Discord"];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

function trendIcon(trend: "up" | "down" | "same") {
  if (trend === "up") return <TrendingUp className="w-3.5 h-3.5 text-status-success" />;
  if (trend === "down") return <TrendingDown className="w-3.5 h-3.5 text-status-error" />;
  return <Minus className="w-3.5 h-3.5 text-text-muted" />;
}

export default function HomePage() {
  const [liveTournaments, setLiveTournaments] = useState<TournamentCardData[]>(featuredTournaments);

  useEffect(() => {
    api.getTournaments()
      .then((res: any) => {
        if (Array.isArray(res) && res.length > 0) {
          setLiveTournaments(
            res.slice(0, 4).map((t: any) => ({
              id: t.id,
              name: t.name,
              format: t.format,
              prizePool: t.prizePool,
              status: t.status,
              registrations: t._count?.registrations ?? 0,
              maxTeams: t.maxTeams,
            })),
          );
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen">
      {/* ─── Hero ─── */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden pt-20">
        <div className="absolute inset-0 bg-bg-primary" />
        <div className="absolute inset-0 neon-grid grid-fade-mask opacity-60" />
        <HeroVisual className="absolute inset-0 opacity-[0.35] lg:hidden pointer-events-none" />
        <div className="absolute -top-40 right-0 w-[560px] h-[560px] rounded-full bg-accent-red/[0.08] blur-[120px]" />
        <div className="absolute top-1/3 -left-40 w-[420px] h-[420px] rounded-full bg-accent-cyan/[0.06] blur-[120px]" />

        <div className="relative w-full max-w-container mx-auto px-6 lg:px-10 grid lg:grid-cols-12 gap-12 items-center">
          {/* Left — Copy */}
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.08 } } }}
            className="lg:col-span-6"
          >
            <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-line mb-7">
              <span className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse" />
              <span className="font-mono text-xs text-text-secondary tracking-wide">Season 1 · Live Now</span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="font-display font-semibold text-[3.25rem] sm:text-[4rem] leading-[1.02] tracking-tight text-text-primary mb-6"
            >
              India&apos;s most<br />
              trusted esports<br />
              <span className="text-accent-red">arena.</span>
            </motion.h1>

            <motion.p variants={fadeUp} transition={{ duration: 0.5 }} className="font-body text-text-secondary text-lg max-w-md leading-relaxed mb-9">
              Verified BGMI &amp; Free Fire tournaments with real prize pools, audited results,
              and payouts that actually land. Built for players who play to win.
            </motion.p>

            <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="flex flex-wrap items-center gap-3">
              <Link href="/tournaments">
                <Button variant="primary" size="lg">
                  Explore Tournaments <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/leaderboard">
                <Button variant="secondary" size="lg">View Leaderboard</Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Right — Floating cards + countdown */}
          <div className="lg:col-span-6 relative h-[440px] hidden lg:block">
            <HeroVisual className="absolute -inset-x-16 -inset-y-10 pointer-events-none" />

            <motion.div
              initial={{ opacity: 0, y: 30, rotate: -4 }}
              animate={{ opacity: 1, y: 0, rotate: -4 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              whileHover={{ rotate: 0, scale: 1.02 }}
              className="absolute top-6 right-8 w-72 card-angular p-4 shadow-card-hover"
            >
              <div className="flex items-center justify-between mb-3">
                <Badge variant="live" pulse>Live</Badge>
                <span className="font-mono text-xs text-text-muted">Grp B · Match 3</span>
              </div>
              <p className="font-display font-semibold text-sm text-text-primary mb-1">TelArena Duo Clash</p>
              <div className="flex items-center justify-between text-xs text-text-secondary font-mono">
                <span>24/24 teams</span>
                <span className="text-accent-cyan">₹25,000 pool</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30, rotate: 3 }}
              animate={{ opacity: 1, y: 0, rotate: 3 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ rotate: 0, scale: 1.02 }}
              className="absolute top-40 left-2 w-64 card-angular p-4 shadow-card-hover"
            >
              <div className="flex items-center gap-2 mb-3">
                <Crown className="w-4 h-4 text-rank-gold" />
                <span className="font-display text-xs font-semibold text-text-primary">Top Squad This Week</span>
              </div>
              <p className="font-display font-semibold text-lg text-text-primary">Hyderabad Hawks</p>
              <p className="font-mono text-xs text-accent-cyan mt-1">842 pts · 5 wins</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="absolute bottom-0 right-4 w-80 card-angular p-5"
            >
              <p className="font-mono text-xs text-text-muted uppercase tracking-widest mb-4">Next Tournament Starts In</p>
              <CountdownTimer targetDate={NEXT_TOURNAMENT_DATE} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="absolute top-2 left-24 flex items-center gap-2 px-3 py-2 rounded-full bg-bg-elevated border border-line"
            >
              <Sparkles className="w-3.5 h-3.5 text-accent-red" />
              <span className="font-mono text-xs text-text-secondary">₹50,000 pool live</span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Sponsor Strip ─── */}
      <section className="bg-bg-secondary border-y border-line py-5 overflow-hidden">
        <div className="animate-ticker whitespace-nowrap">
          {[...sponsors, ...sponsors].map((s, i) => (
            <span
              key={i}
              className={`inline-block px-10 font-mono text-xs font-bold uppercase tracking-widest transition-opacity opacity-85 hover:opacity-100 ${
                i % 2 === 0 ? "text-accent-red" : "text-accent-cyan"
              }`}
            >
              {s}
            </span>
          ))}
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="max-w-container mx-auto px-6 lg:px-10 py-24">
        <div className="max-w-xl mb-14">
          <p className="font-mono text-xs text-accent-cyan uppercase tracking-widest mb-3">How it works</p>
          <h2 className="font-display font-semibold text-3xl sm:text-4xl text-text-primary tracking-tight">
            From registration to payout, four steps.
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="card-angular p-6 relative"
            >
              <span className="absolute top-5 right-5 font-mono text-xs text-text-muted">0{i + 1}</span>
              <div className="w-11 h-11 rounded-xl bg-accent-red/10 flex items-center justify-center mb-5">
                <step.icon className="w-5 h-5 text-accent-red" strokeWidth={2} />
              </div>
              <h3 className="font-display font-semibold text-base text-text-primary mb-2">{step.title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed">{step.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── Featured / Live / Upcoming Tournaments ─── */}
      <section className="max-w-container mx-auto px-6 lg:px-10 py-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="font-mono text-xs text-accent-red uppercase tracking-widest mb-3">Active Competitions</p>
            <h2 className="font-display font-semibold text-3xl sm:text-4xl text-text-primary tracking-tight">Featured Tournaments</h2>
          </div>
          <Link href="/tournaments" className="font-body text-sm text-accent-cyan hover:underline inline-flex items-center gap-1.5 shrink-0">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {liveTournaments.map((t, i) => (
            <TournamentCard key={t.id} tournament={t} index={i} />
          ))}
        </div>
      </section>

      {/* ─── Prize Pools ─── */}
      <section className="max-w-container mx-auto px-6 lg:px-10 py-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCallout value={500000} label="Total Prize Pool Distributed (₹)" prefix="₹" color="red" />
          <StatCallout value={2000} label="Verified Players" suffix="+" color="cyan" />
          <StatCallout value={48} label="Teams This Season" color="red" />
          <StatCallout value={12} label="Tournaments Run" color="cyan" />
        </div>
      </section>

      {/* ─── Leaderboard Preview + Top Teams ─── */}
      <section className="bg-bg-secondary border-y border-line py-24">
        <div className="max-w-container mx-auto px-6 lg:px-10 grid lg:grid-cols-5 gap-12">
          {/* Leaderboard preview */}
          <div className="lg:col-span-3">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="font-mono text-xs text-accent-cyan uppercase tracking-widest mb-3">Season Rankings</p>
                <h2 className="font-display font-semibold text-2xl sm:text-3xl text-text-primary tracking-tight">Leaderboard</h2>
              </div>
              <Link href="/leaderboard" className="font-body text-sm text-accent-cyan hover:underline inline-flex items-center gap-1.5">
                Full standings <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="card-angular overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-line">
                    <th className="text-left font-mono text-xs text-text-muted uppercase tracking-wider py-3 px-5">Rank</th>
                    <th className="text-left font-mono text-xs text-text-muted uppercase tracking-wider py-3 px-5">Squad</th>
                    <th className="text-right font-mono text-xs text-text-muted uppercase tracking-wider py-3 px-5">Points</th>
                    <th className="text-right font-mono text-xs text-text-muted uppercase tracking-wider py-3 px-5">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboardPreview.map((row) => (
                    <tr key={row.rank} className="border-b border-line/60 last:border-0 hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-5">
                        <span className={cnRank(row.rank)}>#{row.rank}</span>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="font-body font-medium text-text-primary text-sm">{row.team}</span>
                        <span className="font-mono text-xs text-text-muted ml-2">{row.tag}</span>
                      </td>
                      <td className="py-3.5 px-5 text-right font-mono text-sm text-accent-cyan tabular-nums">{row.pts}</td>
                      <td className="py-3.5 px-5 flex justify-end">{trendIcon(row.trend)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top teams / recent winners */}
          <div className="lg:col-span-2">
            <p className="font-mono text-xs text-accent-red uppercase tracking-widest mb-3">Recent Winners</p>
            <h2 className="font-display font-semibold text-2xl sm:text-3xl text-text-primary tracking-tight mb-8">Hall of Fame</h2>
            <div className="space-y-3">
              {recentWinners.map((w, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="card-angular p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-rank-gold/10 flex items-center justify-center shrink-0">
                      <Trophy className="w-4 h-4 text-rank-gold" />
                    </div>
                    <div>
                      <p className="font-body font-medium text-sm text-text-primary">{w.team}</p>
                      <p className="text-xs text-text-muted">{w.event} · {w.placement}</p>
                    </div>
                  </div>
                  <span className="font-mono text-sm text-accent-cyan tabular-nums shrink-0">₹{w.prize.toLocaleString("en-IN")}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="max-w-container mx-auto px-6 lg:px-10 py-24">
        <div className="max-w-xl mb-14">
          <p className="font-mono text-xs text-accent-cyan uppercase tracking-widest mb-3">Community</p>
          <h2 className="font-display font-semibold text-3xl sm:text-4xl text-text-primary tracking-tight">What players are saying</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="card-angular p-6"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} className="w-4 h-4 fill-rank-gold text-rank-gold" />
                ))}
              </div>
              <p className="text-text-secondary text-sm leading-relaxed mb-5">&ldquo;{t.quote}&rdquo;</p>
              <p className="font-mono text-xs text-text-muted">{t.author}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="bg-bg-secondary border-y border-line py-24">
        <div className="max-w-container mx-auto px-6 lg:px-10 flex flex-col items-center gap-12">
          <div className="text-center">
            <p className="font-mono text-xs text-accent-red uppercase tracking-widest mb-3">FAQ</p>
            <h2 className="font-display font-semibold text-3xl text-text-primary tracking-tight">Frequently asked</h2>
          </div>
          <div className="max-w-4xl w-full space-y-3">
            {faqs.map((f, i) => (
              <FaqItem key={i} q={f.q} a={f.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="max-w-container mx-auto px-6 lg:px-10 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="card-angular p-14 relative overflow-hidden"
        >
          <div className="absolute inset-0 neon-grid opacity-30" />
          <div className="relative">
            <h2 className="font-display font-semibold text-3xl sm:text-4xl text-text-primary tracking-tight mb-4">
              Ready to compete?
            </h2>
            <p className="font-body text-text-secondary max-w-lg mx-auto mb-8">
              Verify your identity, build your squad, and register for the next tournament in minutes.
            </p>
            <Link href="/tournaments">
              <Button variant="primary" size="lg">
                Get Started <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}

function cnRank(rank: number) {
  const base = "font-display font-semibold text-sm tabular-nums";
  if (rank === 1) return `${base} text-rank-gold`;
  if (rank === 2) return `${base} text-rank-silver`;
  if (rank === 3) return `${base} text-rank-bronze`;
  return `${base} text-text-muted`;
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card-angular overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-5 text-left">
        <span className="font-body font-medium text-sm text-text-primary">{q}</span>
        <ArrowRight className={`w-4 h-4 text-text-muted shrink-0 ml-4 transition-transform duration-200 ${open ? "rotate-90" : ""}`} />
      </button>
      {open && (
        <div className="px-5 pb-5 -mt-1">
          <p className="text-text-secondary text-sm leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}
