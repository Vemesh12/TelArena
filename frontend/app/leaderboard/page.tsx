"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Swords, Target, Medal } from "lucide-react";
import { DataTable } from "@/components/ui/DataTable";
import { CardHeader } from "@/components/ui/Card";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";

function rankClass(rank: number) {
  const base = "font-display font-semibold text-sm tabular-nums";
  if (rank === 1) return `${base} text-rank-gold`;
  if (rank === 2) return `${base} text-rank-silver`;
  if (rank === 3) return `${base} text-rank-bronze`;
  return `${base} text-text-secondary`;
}

export default function GlobalLeaderboardPage() {
  const toast = useToast();
  const [standings, setStandings] = useState<any[]>([]);
  const [tournamentId, setTournamentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    // Fetch top standings from active tournament
    api.getTournaments("ongoing")
      .then((tList: any) => {
        if (tList && tList.length > 0) {
          setTournamentId(tList[0].id);
          return api.getLeaderboard(tList[0].id);
        }
        return [];
      })
      .then((res: any) => setStandings(res || []))
      .catch(() => setStandings([]))
      .finally(() => setLoading(false));
  }, []);

  const handleExport = async () => {
    if (!tournamentId) return toast.error("No Active Tournament", "There's no ongoing tournament to export standings for.");
    setExporting(true);
    try {
      const blob = await api.exportLeaderboardCsv(tournamentId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `teluguarena_leaderboard_${tournamentId}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("CSV Exported", "Leaderboard standings downloaded successfully.");
    } catch (err: any) {
      toast.error("Export Failed", err.message || "Could not export leaderboard standings.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-16">
      <div className="max-w-container mx-auto px-6 lg:px-10 space-y-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p className="font-mono text-xs text-accent-cyan uppercase tracking-widest mb-3">Season Rankings</p>
          <h1 className="font-display font-semibold text-4xl sm:text-5xl text-text-primary tracking-tight mb-4">
            Leaderboards &amp; Standings
          </h1>
          <p className="text-text-secondary text-lg max-w-xl">
            Live ranked standings updated in real-time as match results are finalized.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <CardHeader title="Ranked Standings" subtitle="Live placement points + kills cumulative leaderboard" />

          <DataTable
            data={standings.length > 0 ? standings : [
              { rank: 1, team: { name: "Hyderabad Hawks", tag: "HHK" }, totalPts: 142, totalKills: 45, matchesPlayed: 5, bestPlacement: 1 },
              { rank: 2, team: { name: "Vizag Vipers", tag: "VVP" }, totalPts: 128, totalKills: 39, matchesPlayed: 5, bestPlacement: 1 },
              { rank: 3, team: { name: "Warangal Warriors", tag: "WWR" }, totalPts: 98, totalKills: 28, matchesPlayed: 5, bestPlacement: 2 },
              { rank: 4, team: { name: "Nellore Ninjas", tag: "NNJ" }, totalPts: 84, totalKills: 22, matchesPlayed: 5, bestPlacement: 3 },
            ]}
            loading={loading}
            onExportCsv={handleExport}
            columns={[
              {
                header: "Rank",
                key: "rank",
                render: (r) => (
                  <span className={rankClass(r.rank)}>
                    {r.rank <= 3 ? <Trophy className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" strokeWidth={2} /> : null}
                    #{r.rank}
                  </span>
                ),
              },
              {
                header: "Squad",
                key: "team",
                render: (r) => (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent-red/10 flex items-center justify-center shrink-0">
                      <span className="font-display font-semibold text-[11px] text-accent-red">
                        {r.team?.tag?.slice(0, 3) || r.team?.name?.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-body font-medium text-sm text-text-primary">{r.team?.name}</p>
                      <p className="font-mono text-xs text-text-muted">{r.team?.tag}</p>
                    </div>
                  </div>
                ),
              },
              {
                header: "Total Points",
                key: "totalPts",
                render: (r) => <span className="font-mono font-semibold text-accent-cyan tabular-nums">{r.totalPts}</span>,
              },
              {
                header: "Total Kills",
                key: "totalKills",
                render: (r) => (
                  <span className="font-mono text-text-primary tabular-nums inline-flex items-center gap-1.5">
                    <Swords className="w-3.5 h-3.5 text-text-muted" strokeWidth={2} />
                    {r.totalKills}
                  </span>
                ),
              },
              {
                header: "Matches Played",
                key: "matchesPlayed",
                render: (r) => <span className="font-mono text-text-muted tabular-nums">{r.matchesPlayed}</span>,
              },
              {
                header: "Best Finish",
                key: "bestPlacement",
                render: (r) => (
                  <span className="font-mono font-semibold text-rank-gold tabular-nums inline-flex items-center gap-1.5">
                    {r.bestPlacement === 1 ? <Medal className="w-3.5 h-3.5" strokeWidth={2} /> : <Target className="w-3.5 h-3.5" strokeWidth={2} />}
                    #{r.bestPlacement}
                  </span>
                ),
              },
            ]}
          />
        </motion.div>
      </div>
    </div>
  );
}
