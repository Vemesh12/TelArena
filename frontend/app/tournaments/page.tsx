"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { Footer } from "@/components/ui/Footer";
import { TournamentCard, type TournamentCardData } from "@/components/tournaments/TournamentCard";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "free" | "paid">("all");

  useEffect(() => {
    api.getTournaments()
      .then((res: any) => setTournaments(Array.isArray(res) ? res : []))
      .catch(() => setTournaments([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredTournaments = tournaments.filter((t) => {
    const fee = t.entryFee || 0;
    if (filter === "free") return fee === 0;
    if (filter === "paid") return fee > 0;
    return true;
  });

  return (
    <div className="min-h-screen pt-32 pb-16">
      <div className="max-w-container mx-auto px-6 lg:px-10">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p className="font-mono text-xs text-accent-red uppercase tracking-widest mb-3">Tournament Discovery</p>
          <h1 className="font-display font-semibold text-4xl sm:text-5xl text-text-primary tracking-tight mb-4">
            Browse every arena,<br className="hidden sm:block" /> find your bracket.
          </h1>
          <p className="text-text-secondary text-lg max-w-xl">
            Active, upcoming, and completed Free Fire &amp; BGMI competitions — verified prize pools and audited results.
          </p>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2.5 mt-8 border-b border-line pb-4 z-10 relative">
          {(["all", "free", "paid"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-display font-bold uppercase tracking-wider transition-all",
                filter === f
                  ? "bg-accent-red text-white hover:bg-accent-red/90 hover:shadow-glow-red"
                  : "bg-bg-secondary text-text-secondary border border-line hover:border-text-secondary/25"
              )}
            >
              {f === "all" ? "All Arenas" : f === "free" ? "Free Lobbies" : "Paid Lobbies"}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5 mt-10">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card-angular h-72 animate-pulse bg-bg-elevated/40" />
            ))}
          </div>
        ) : filteredTournaments.length === 0 ? (
          <div className="card-angular p-14 text-center mt-10">
            <div className="w-12 h-12 rounded-xl bg-accent-red/10 flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-5 h-5 text-accent-red" strokeWidth={2} />
            </div>
            <p className="font-display font-semibold text-text-primary mb-1">No matches found</p>
            <p className="text-text-secondary text-sm">Check back soon — new brackets are added regularly.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5 mt-10">
            {filteredTournaments.map((t, i) => {
              const data: TournamentCardData = {
                id: t.id,
                name: t.name,
                format: t.format,
                prizePool: t.prizePool,
                status: t.status,
                registrations: t._count?.registrations ?? 0,
                maxTeams: t.maxTeams,
                entryFee: t.entryFee ?? 0,
              };
              return <TournamentCard key={t.id} tournament={data} index={i} />;
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
