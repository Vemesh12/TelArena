"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Trophy, Users, Calendar, MapPin, Swords, Gauge } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

export interface TournamentCardData {
  id: string;
  name: string;
  format: string; // solo | duo | squad
  prizePool: number;
  status: string;
  registrations: number;
  maxTeams: number;
  entryFee?: number;
  map?: string;
  organizer?: string;
  difficulty?: "Beginner" | "Intermediate" | "Pro";
  startDate?: string;
}

const statusMeta: Record<string, { label: string; variant: "live" | "upcoming" | "default" }> = {
  registration_open: { label: "Registration Open", variant: "upcoming" },
  ongoing: { label: "Live", variant: "live" },
  published: { label: "Upcoming", variant: "default" },
  draft: { label: "Draft", variant: "default" },
  registration_closed: { label: "Closed", variant: "default" },
  completed: { label: "Completed", variant: "default" },
};

export function TournamentCard({ tournament, index = 0 }: { tournament: TournamentCardData; index?: number }) {
  const meta = statusMeta[tournament.status] || { label: tournament.status, variant: "default" as const };
  const pct = tournament.maxTeams > 0 ? Math.min(100, (tournament.registrations / tournament.maxTeams) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
    >
      <Link href={`/tournaments/${tournament.id}`} className="block group h-full">
        <div className="card-angular h-full flex flex-col overflow-hidden group-hover:-translate-y-1 transition-transform duration-300">
          {/* Banner */}
          <div className="h-28 relative overflow-hidden bg-gradient-to-br from-accent-red/15 via-bg-elevated to-bg-secondary shrink-0">
            <div className="absolute inset-0 neon-grid opacity-40" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-display font-semibold text-3xl text-white/10 select-none tracking-tight">
                {tournament.format?.toUpperCase() || "FF"}
              </span>
            </div>
            <div className="absolute top-3 right-3">
              <Badge variant={meta.variant} pulse={meta.variant === "live"}>{meta.label}</Badge>
            </div>
            {tournament.difficulty && (
              <div className="absolute top-3 left-3">
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-text-secondary bg-black/40 backdrop-blur-sm px-2 py-1 rounded-md border border-line">
                  <Gauge className="w-3 h-3" /> {tournament.difficulty}
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-5 flex flex-col flex-1">
            <h3 className="font-display font-semibold text-base text-text-primary tracking-tight line-clamp-1">
              {tournament.name}
            </h3>
            {tournament.organizer && (
              <p className="text-text-muted text-xs mt-0.5">by {tournament.organizer}</p>
            )}

            <div className="flex items-center gap-4 mt-3 text-xs font-mono text-text-secondary">
              <span className="inline-flex items-center gap-1.5">
                <Swords className="w-3.5 h-3.5 text-text-muted" />
                {tournament.format?.charAt(0).toUpperCase() + tournament.format?.slice(1)}
              </span>
              {tournament.map && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-text-muted" /> {tournament.map}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-1.5 text-accent-cyan">
                <Trophy className="w-4 h-4" />
                <span className="font-mono text-sm font-semibold tabular-nums">
                  ₹{tournament.prizePool.toLocaleString("en-IN")}
                </span>
              </div>
              {typeof tournament.entryFee === "number" && (
                <span className="text-xs font-mono text-text-muted">
                  {tournament.entryFee === 0 ? "Free Entry" : `₹${tournament.entryFee} Entry`}
                </span>
              )}
            </div>

            <div className="mt-auto pt-4">
              <div className="flex items-center justify-between text-xs text-text-muted mb-1.5">
                <span className="inline-flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" /> {tournament.registrations}/{tournament.maxTeams} teams
                </span>
                {tournament.startDate && (
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> {tournament.startDate}
                  </span>
                )}
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all", pct >= 90 ? "bg-status-warning" : "bg-accent-red")}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
