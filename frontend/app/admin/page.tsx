"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Trophy, ShieldCheck, Swords, Users, Gavel, Wallet, ScrollText,
  Plus, Dice5, KeyRound, Crown, CalendarClock, User, Hammer, ShieldOff, Camera,
  Scale, Ban, Check,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { StatCallout } from "@/components/ui/StatCallout";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DataTable } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "tournaments", label: "Tournaments", icon: Trophy },
  { id: "verifications", label: "Verification Queue", icon: ShieldCheck },
  { id: "matches", label: "Match Scoring", icon: Swords },
  { id: "players", label: "Players", icon: Users },
  { id: "disputes", label: "Disputes", icon: Gavel },
  { id: "payouts", label: "Payouts", icon: Wallet },
  { id: "audit", label: "Audit Log", icon: ScrollText },
] as const;

const fadeUp = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState<"overview" | "tournaments" | "verifications" | "matches" | "players" | "disputes" | "audit" | "payouts">("overview");
  const [stats, setStats] = useState<any>(null);
  const [tournamentsList, setTournamentsList] = useState<any[]>([]);
  const [pendingVerifs, setPendingVerifs] = useState<any[]>([]);
  const [pendingDigilockers, setPendingDigilockers] = useState<any[]>([]);
  const [playersList, setPlayersList] = useState<any[]>([]);
  const [playerSearch, setPlayerSearch] = useState("");
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [disputesList, setDisputesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Dynamic Matches & Payouts state
  const [matchesList, setMatchesList] = useState<any[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState("");
  const [matchResultsInput, setMatchResultsInput] = useState<Record<string, { placement: number; kills: number }>>({});
  const [matchesLoading, setMatchesLoading] = useState(false);

  const [payoutsList, setPayoutsList] = useState<any[]>([]);
  const [selectedPayoutTournamentId, setSelectedPayoutTournamentId] = useState("");
  const [payoutTxRefs, setPayoutTxRefs] = useState<Record<string, string>>({});
  const [payoutsLoading, setPayoutsLoading] = useState(false);

  // Seeding & Batch Rooms State
  const [seedTournId, setSeedTournId] = useState("");
  const [seedStageId, setStageId] = useState("");
  const [seedGroupCount, setSeedGroupCount] = useState(4);
  const [seedingLoading, setSeedingLoading] = useState(false);

  const [batchStageId, setBatchStageId] = useState("");
  const [batchLoading, setBatchLoading] = useState(false);

  // Tournament creation modal state
  const [createModal, setCreateModal] = useState(false);
  const [tName, setTName] = useState("");
  const [tFormat, setTFormat] = useState("squad");
  const [tPrize, setTPrize] = useState(50000);
  const [tMaxTeams, setTMaxTeams] = useState(48);
  const [tEntryFee, setTEntryFee] = useState(0);

  // Tournament Registrations Tab State
  const [selectedTournId, setSelectedTournId] = useState("");
  const [selectedTournRegistrations, setSelectedTournRegistrations] = useState<any[]>([]);
  const [regLoading, setRegLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      api.getAdminDashboard().catch(() => null),
      api.getPendingVerifications().catch(() => []),
      api.getDigilockerPending().catch(() => []),
      api.getAdminPlayers().catch(() => []),
      api.getAuditLogs().catch(() => []),
      api.getDisputesQueue().catch(() => []),
      api.getAllMatches().catch(() => []),
      api.getTournaments().catch(() => []),
    ])
      .then(async ([statsRes, verifRes, digiRes, playersRes, auditRes, disputesRes, matchesRes, tournamentsRes]: any) => {
        setStats(statsRes);
        setPendingVerifs(verifRes || []);
        setPendingDigilockers(digiRes || []);
        setPlayersList(playersRes || []);
        setAuditLogs(auditRes || []);
        setDisputesList(disputesRes || []);
        if (matchesRes && matchesRes.length > 0) {
          setMatchesList(matchesRes);
          setSelectedMatchId(matchesRes[0].id);
        }
        const tournaments = tournamentsRes || [];
        setTournamentsList(tournaments);
        if (tournaments.length > 0) {
          const firstId = tournaments[0].id;
          setSeedTournId(firstId);
          setSelectedPayoutTournamentId(firstId);
          setSelectedTournId(firstId);
          const firstStageId = tournaments[0].stages?.[0]?.id || "";
          setStageId(firstStageId);
          setBatchStageId(firstStageId);
          try {
            const payoutsRes = await api.getTournamentPayouts(firstId);
            setPayoutsList((payoutsRes as any[]) || []);
          } catch {
            setPayoutsList([]);
          }
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // Rescheduling state variables
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [rescheduleMap, setRescheduleMap] = useState("Bermuda");
  const [rescheduleLoading, setRescheduleLoading] = useState(false);

  useEffect(() => {
    const match = matchesList.find((m) => m.id === selectedMatchId);
    if (match && match.room) {
      try {
        const dateStr = new Date(match.room.scheduledAt).toISOString().substring(0, 16);
        setRescheduleTime(dateStr);
        setRescheduleMap(match.room.map || "Bermuda");
      } catch (e) {
        // Fallback for date parsing
      }
    }
  }, [selectedMatchId, matchesList]);

  useEffect(() => {
    if (!selectedTournId) return;
    setRegLoading(true);
    api.getRegistrations(selectedTournId)
      .then((res: any) => {
        setSelectedTournRegistrations(res || []);
      })
      .catch((err) => {
        toast.error("Failed to load registrations", err.message);
      })
      .finally(() => setRegLoading(false));
  }, [selectedTournId]);

  const [createLoading, setCreateLoading] = useState(false);
  const handleCreateTournament = async () => {
    if (!tName) return toast.error("Error", "Enter tournament name");
    setCreateLoading(true);
    try {
      const created: any = await api.createTournament({
        name: tName,
        format: tFormat,
        prizePool: tPrize,
        maxTeams: tMaxTeams,
        entryFee: tEntryFee,
      });
      toast.success("Tournament Created", `Tournament "${tName}" created in draft status.`);
      setCreateModal(false);
      setTName("");
      setTEntryFee(0);
      const tournaments = (await api.getTournaments().catch(() => [])) as any[];
      setTournamentsList(tournaments || []);
      if (created?.id) {
        setSeedTournId(created.id);
        setSelectedPayoutTournamentId(created.id);
      }
    } catch (err: any) {
      toast.error("Creation Failed", err.message);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleSeedGroups = async () => {
    setSeedingLoading(true);
    try {
      const res: any = await api.seedGroups(seedTournId, seedStageId, seedGroupCount);
      toast.success("Groups Seeded", res.message || `Successfully distributed teams across ${seedGroupCount} groups.`);
    } catch (err: any) {
      toast.error("Seeding Failed", err.message || "Could not seed groups. Check team registrations.");
    } finally {
      setSeedingLoading(false);
    }
  };

  const handleBatchRooms = async () => {
    setBatchLoading(true);
    try {
      const res: any = await api.batchRooms(batchStageId);
      toast.success("Rooms Generated", res.message || "Created custom match rooms and assigned team slot numbers.");
    } catch (err: any) {
      toast.error("Batch Creation Failed", err.message || "Ensure groups are seeded first.");
    } finally {
      setBatchLoading(false);
    }
  };

  const handleResolveDispute = async (disputeId: string, status: "resolved_upheld" | "resolved_rejected") => {
    try {
      await api.resolveDispute(disputeId, status === "resolved_upheld" ? "Upheld after evidence audit" : "Dismissed by admin", status);
      toast.success("Dispute Updated", `Dispute ${status === "resolved_upheld" ? "Upheld & Standings Amended" : "Dismissed"}`);
      setDisputesList((prev) => prev.filter((d) => d.id !== disputeId));
    } catch (err: any) {
      toast.error("Action Failed", err.message || "Could not resolve dispute. Please try again.");
    }
  };

  const handleSaveMatchScore = async (matchId: string) => {
    const match = matchesList.find((m) => m.id === matchId);
    if (!match) return;

    const results = match.room?.slots?.map((slot: any) => {
      const key = `${matchId}_${slot.teamId}`;
      const input = matchResultsInput[key] || {
        placement: 12,
        kills: 0,
      };
      return {
        teamId: slot.teamId,
        placement: Number(input.placement),
        kills: Number(input.kills),
      };
    }) || [];

    setMatchesLoading(true);
    try {
      await api.submitMatchResults(matchId, results);
      toast.success("Scores Saved", "Provisional scores updated. Click Finalize to update standings.");
      const updated = await api.getAllMatches() as any[];
      setMatchesList(updated);
    } catch (err: any) {
      toast.error("Failed to Save", err.message);
    } finally {
      setMatchesLoading(false);
    }
  };

  const handleFinalizeMatch = async (matchId: string) => {
    const match = matchesList.find((m) => m.id === matchId);
    if (!match) return;

    setMatchesLoading(true);
    try {
      const promises = match.results?.map((res: any) => api.finalizeMatchResult(res.id)) || [];
      await Promise.all(promises);
      toast.success("Match Finalized", "Standings updated and pushed to leaderboard!");
      const updated = await api.getAllMatches() as any[];
      setMatchesList(updated);
    } catch (err: any) {
      toast.error("Finalization Failed", err.message);
    } finally {
      setMatchesLoading(false);
    }
  };

  const handleUpdatePayout = async (payoutId: string, status: string) => {
    const txRef = payoutTxRefs[payoutId] || "";
    setPayoutsLoading(true);
    try {
      await api.updatePayoutStatus(payoutId, status, txRef);
      toast.success("Payout Status Updated", `Status: ${status.toUpperCase()}`);
      const updated = await api.getTournamentPayouts(selectedPayoutTournamentId) as any[];
      setPayoutsList(updated);
    } catch (err: any) {
      toast.error("Payout Update Failed", err.message);
    } finally {
      setPayoutsLoading(false);
    }
  };

  const handleFinalizePayouts = async (tournamentId: string) => {
    try {
      await api.finalizeTournamentPayouts(tournamentId);
      toast.success("Payouts Generated!", "Tournament finalized and prize pool distribution records generated for captains.");
      const updated = await api.getTournamentPayouts(tournamentId) as any[];
      setPayoutsList(updated);
    } catch (err: any) {
      toast.error("Finalization Failed", err.message || "Could not finalize payouts for this tournament.");
    }
  };

  const handleReschedule = async () => {
    const match = matchesList.find((m) => m.id === selectedMatchId);
    if (!match || !match.roomId) return toast.error("Error", "No room associated with match");
    if (!rescheduleTime) return toast.error("Error", "Select a valid scheduled time");

    setRescheduleLoading(true);
    try {
      await api.updateRoomSchedule(match.roomId, rescheduleTime, rescheduleMap);
      toast.success("Schedule Updated", "Custom room scheduled start time and map updated!");
      const updated = await api.getAllMatches() as any[];
      setMatchesList(updated);
    } catch (err: any) {
      toast.error("Failed to Reschedule", err.message);
    } finally {
      setRescheduleLoading(false);
    }
  };

  const inputCls = "w-full bg-bg-primary border border-line rounded-lg px-3 py-2 text-sm text-text-primary font-mono outline-none focus:border-accent-cyan transition-colors";
  const labelCls = "block text-xs font-body text-text-muted mb-1.5";

  return (
    <div className="min-h-screen pt-32 pb-16">
      <div className="max-w-container mx-auto px-6 lg:px-10 space-y-8">
        {/* Admin Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <p className="font-mono text-xs text-accent-cyan uppercase tracking-widest mb-2">Admin Control Panel</p>
            <h1 className="font-display font-semibold text-3xl sm:text-4xl text-text-primary tracking-tight">TelArena Operations</h1>
          </div>
          <Button variant="primary" size="sm" onClick={() => setCreateModal(true)}>
            <Plus className="w-4 h-4" /> Create Tournament
          </Button>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex border-b border-line gap-1 overflow-x-auto">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id as any)}
                className={`flex items-center gap-2 px-4 py-3 font-body text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                  active ? "text-text-primary border-accent-red" : "text-text-muted border-transparent hover:text-text-secondary"
                }`}
              >
                <Icon className="w-4 h-4" /> {t.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW */}
        {tab === "overview" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCallout value={stats?.totalPlayers || 2048} label="Total Registered Players" color="red" />
              <StatCallout value={stats?.activeTournaments || 3} label="Active Tournaments" color="cyan" />
              <StatCallout value={stats?.pendingVerifications || pendingVerifs.length} label="Pending TES Reviews" color="gold" />
              <StatCallout value={stats?.openDisputes || 0} label="Open Match Disputes" color="red" />
            </div>

            {/* Registration Funnel */}
            <div className="card-angular p-6 space-y-4">
              <CardHeader title="Verification Funnel" subtitle="Auto-approved vs manual review vs auto-rejected" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-4 rounded-xl bg-bg-elevated border border-status-verified/20">
                  <span className="font-mono text-2xl font-semibold text-status-verified">{stats?.registrationFunnel?.autoApproved || 1420}</span>
                  <span className="block text-xs text-text-muted mt-1">Auto-Approved</span>
                </div>
                <div className="p-4 rounded-xl bg-bg-elevated border border-status-pending/20">
                  <span className="font-mono text-2xl font-semibold text-status-warning">{stats?.registrationFunnel?.manualReview || 312}</span>
                  <span className="block text-xs text-text-muted mt-1">Manual Review</span>
                </div>
                <div className="p-4 rounded-xl bg-bg-elevated border border-status-rejected/20">
                  <span className="font-mono text-2xl font-semibold text-status-error">{stats?.registrationFunnel?.autoRejected || 84}</span>
                  <span className="block text-xs text-text-muted mt-1">Auto-Rejected</span>
                </div>
                <div className="p-4 rounded-xl bg-bg-elevated border border-line">
                  <span className="font-mono text-2xl font-semibold text-text-muted">{stats?.registrationFunnel?.notStarted || 232}</span>
                  <span className="block text-xs text-text-muted mt-1">Not Started</span>
                </div>
              </div>
            </div>

            {/* AUTOMATED TOURNAMENT OPERATIONS WORKBENCH */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Automated Group Draw Wizard */}
              <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} transition={{ duration: 0.4 }} className="card-angular-cyan p-6 space-y-4">
                <CardHeader title="Group Seeding Wizard" subtitle="Distribute confirmed teams into balanced groups automatically." action={<Dice5 className="w-5 h-5 text-accent-cyan" />} />
                <div className="space-y-3">
                  <div>
                    <label className={labelCls}>Target Tournament</label>
                    <select value={seedTournId} onChange={(e) => setSeedTournId(e.target.value)} className={inputCls}>
                      {tournamentsList.length === 0 && <option value="">No tournaments yet</option>}
                      {tournamentsList.map((t) => (<option key={t.id} value={t.id}>{t.name}</option>))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Target Stage</label>
                      <input type="text" value={seedStageId} onChange={(e) => setStageId(e.target.value)} className={inputCls} placeholder="stage_q1" />
                    </div>
                    <div>
                      <label className={labelCls}>Group Count</label>
                      <input type="number" min="2" max="6" value={seedGroupCount} onChange={(e) => setSeedGroupCount(Number(e.target.value))} className={inputCls} />
                    </div>
                  </div>
                  <Button variant="primary" loading={seedingLoading} onClick={handleSeedGroups} className="w-full">
                    Seed Groups Automatically
                  </Button>
                </div>
              </motion.div>

              {/* Batch Custom Room & Slot Generator */}
              <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} transition={{ duration: 0.4, delay: 0.06 }} className="card-angular p-6 space-y-4">
                <CardHeader title="Batch Room Generator" subtitle="Generate custom match room IDs & passcodes for seeded groups." action={<KeyRound className="w-5 h-5 text-accent-red" />} />
                <div className="space-y-3">
                  <div>
                    <label className={labelCls}>Stage ID for Room Batch</label>
                    <input type="text" value={batchStageId} onChange={(e) => setBatchStageId(e.target.value)} className={inputCls} placeholder="stage_q1" />
                  </div>
                  <div className="p-3 rounded-lg bg-bg-elevated border border-line text-xs text-text-secondary">
                    Auto-generates room codes &amp; passwords, and allocates team slot positions per group.
                  </div>
                  <Button variant="secondary" loading={batchLoading} onClick={handleBatchRooms} className="w-full">
                    Generate Room Codes &amp; Matches
                  </Button>
                </div>
              </motion.div>

              {/* 1-Click Tournament Payout Finalizer */}
              <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} transition={{ duration: 0.4, delay: 0.12 }} className="card-angular p-6 space-y-4 md:col-span-2">
                <CardHeader title="Payout Finalizer" subtitle="Calculate prize pool distribution from final standings and create payout records." action={<Trophy className="w-5 h-5 text-rank-gold" />} />
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-bg-elevated border border-line">
                  <div className="space-y-1">
                    <span className="font-body font-medium text-sm text-text-primary block">
                      {(() => {
                        const t = tournamentsList.find((tt) => tt.id === seedTournId);
                        return t ? `${t.name} (₹${(t.prizePool || 0).toLocaleString("en-IN")} prize pool)` : "No tournament selected";
                      })()}
                    </span>
                    <p className="text-xs text-text-muted">
                      Calculates 1st (50%), 2nd (30%), 3rd (20%) and creates pending payout records for squad captains.
                    </p>
                  </div>
                  <Button variant="primary" onClick={() => handleFinalizePayouts(seedTournId)} className="shrink-0">
                    Finalize Payouts
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {/* TAB 1.5: TOURNAMENT REGISTRATIONS WORKBENCH */}
        {tab === "tournaments" && (
          <div className="card-angular p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardHeader title="Tournament Registrations & Teams" subtitle="Verify receipts, check team leaders, and approve lobby entries" />
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={async () => {
                    if (!selectedTournId) return;
                    try {
                      const res: any = await api.confirmAllRegistrations(selectedTournId);
                      toast.success("Teams Confirmed", res.message || "All eligible registered squads confirmed.");
                      setSelectedTournRegistrations((prev) =>
                        prev.map((item) => (item.status === "registered" ? { ...item, status: "confirmed" } : item))
                      );
                    } catch (err: any) {
                      toast.error("Confirm Failed", err.message);
                    }
                  }}
                  disabled={selectedTournRegistrations.filter((r) => r.status === "registered").length === 0}
                >
                  ⚡ Confirm All Eligible Teams
                </Button>
                <select
                  value={selectedTournId}
                  onChange={(e) => setSelectedTournId(e.target.value)}
                  className="bg-bg-elevated border border-line rounded-xl px-3 py-2 text-xs text-text-primary outline-none focus:border-accent-cyan transition-colors"
                >
                  {tournamentsList.length === 0 && <option value="">No tournaments yet</option>}
                  {tournamentsList.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <DataTable
              data={selectedTournRegistrations}
              emptyMessage={regLoading ? "Loading registrations..." : "No registrations for this tournament yet."}
              columns={[
                {
                  header: "Team Details",
                  key: "team",
                  render: (r) => (
                    <div>
                      <span className="font-semibold text-text-primary block">{r.team?.name}</span>
                      <span className="text-[10px] text-text-muted font-mono block">Tag: {r.team?.tag} | Leader: {r.metadata?.leaderName || "N/A"}</span>
                    </div>
                  ),
                },
                {
                  header: "Contact Info",
                  key: "contact",
                  render: (r) => (
                    <div className="text-[11px] font-mono">
                      <span className="text-text-secondary block">📞 {r.metadata?.contactPhone || "N/A"}</span>
                      <span className="text-status-success block">💬 {r.metadata?.whatsappPhone || "N/A"}</span>
                    </div>
                  ),
                },
                {
                  header: "Leader UID & IGN",
                  key: "uid",
                  render: (r) => (
                    <div className="text-[11px]">
                      <span className="text-accent-cyan font-mono block">{r.metadata?.leaderUid || "N/A"}</span>
                      <span className="text-text-muted font-mono block">{r.metadata?.inGameName || "N/A"}</span>
                    </div>
                  ),
                },
                {
                  header: "Payment Screenshot",
                  key: "payment",
                  render: (r) => (
                    r.metadata?.paymentScreenshot ? (
                      <a
                        href={r.metadata.paymentScreenshot}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-accent-cyan hover:underline font-semibold block"
                      >
                        📷 View Payment Receipt
                      </a>
                    ) : (
                      <span className="text-text-muted text-xs">No receipt uploaded</span>
                    )
                  ),
                },
                {
                  header: "Status",
                  key: "status",
                  render: (r) => (
                    <Badge variant={r.status === "confirmed" ? "verified" : r.status === "waitlisted" ? "pending" : "upcoming"}>
                      {r.status.toUpperCase()}
                    </Badge>
                  ),
                },
                {
                  header: "Actions",
                  key: "actions",
                  render: (r) => (
                    <div className="flex gap-2">
                      {r.status !== "confirmed" && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={async () => {
                            try {
                              await api.updateRegistrationStatus(selectedTournId, r.id, "confirmed");
                              toast.success("Approved", `Approved ${r.team?.name} for the tournament`);
                              setSelectedTournRegistrations((prev) =>
                                prev.map((item) => (item.id === r.id ? { ...item, status: "confirmed" } : item))
                              );
                            } catch (err: any) {
                              toast.error("Failed to approve", err.message);
                            }
                          }}
                        >
                          Approve
                        </Button>
                      )}
                      {r.status !== "cancelled" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            try {
                              await api.updateRegistrationStatus(selectedTournId, r.id, "cancelled");
                              toast.error("Cancelled", `Cancelled registration for ${r.team?.name}`);
                              setSelectedTournRegistrations((prev) =>
                                prev.map((item) => (item.id === r.id ? { ...item, status: "cancelled" } : item))
                              );
                            } catch (err: any) {
                              toast.error("Failed to cancel", err.message);
                            }
                          }}
                        >
                          Reject
                        </Button>
                      )}
                    </div>
                  ),
                },
              ]}
            />
          </div>
        )}

        {/* TAB 2: TES REVIEW QUEUE */}
        {tab === "verifications" && (
          <div className="card-angular p-6 space-y-4">
            <CardHeader title="Manual Verification Queue" subtitle="Review players flagged for manual check (40-59 eligibility score)" />
            <DataTable
              data={pendingVerifs}
              emptyMessage="No pending manual verifications. All player accounts are processed!"
              columns={[
                { header: "Player", key: "player", render: (r) => <span className="font-medium text-text-primary">@{r.player?.discordUsername}</span> },
                { header: "FF UID", key: "uid", render: (r) => <span className="font-mono text-accent-cyan">{r.player?.freefireUid || "Unlinked"}</span> },
                {
                  header: "Phone / Circle",
                  key: "phone",
                  render: (r) => (
                    <div className="font-mono text-xs">
                      <span className="text-text-primary block font-medium">{r.player?.phone || "Unlinked"}</span>
                      <span className="text-accent-cyan text-[11px] block">{r.telecomCircle || r.player?.verification?.telecomCircle || "AP & Telangana (Detected)"}</span>
                    </div>
                  ),
                },
                { header: "TES Score", key: "score", render: (r) => <span className="font-mono text-accent-red font-semibold">{r.tesScore || 50}/100</span> },
                {
                  header: "Actions", key: "actions", render: (r) => (
                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={async () => {
                          try {
                            await api.approveVerification(r.id);
                            toast.success("Approved", `Player @${r.player?.discordUsername || "user"} verified manually`);
                            setPendingVerifs((prev) => prev.filter((item) => item.id !== r.id));
                          } catch (err: any) {
                            toast.error("Action Failed", err.message);
                          }
                        }}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          try {
                            await api.rejectVerification(r.id);
                            toast.error("Rejected", `Verification rejected for @${r.player?.discordUsername || "user"}`);
                            setPendingVerifs((prev) => prev.filter((item) => item.id !== r.id));
                          } catch (err: any) {
                            toast.error("Action Failed", err.message);
                          }
                        }}
                      >
                        Reject
                      </Button>
                    </div>
                  ),
                },
              ]}
            />

            {/* DigiLocker e-KYC Queue */}
            <div className="pt-6 border-t border-line space-y-4">
              <CardHeader title="DigiLocker Document Review Queue" subtitle="Inspect and approve shared DigiLocker document links to boost player scores" />
              <DataTable
                data={pendingDigilockers}
                emptyMessage="No pending DigiLocker verifications."
                columns={[
                  { header: "Player", key: "player", render: (r) => <span className="font-medium text-text-primary">@{r.player?.discordUsername}</span> },
                  {
                    header: "Document URL",
                    key: "url",
                    render: (r) => (
                      <a
                        href={r.digilockerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-accent-cyan hover:underline font-mono"
                      >
                        🗂️ View DigiLocker Shared Document
                      </a>
                    ),
                  },
                  {
                    header: "Action",
                    key: "action",
                    render: (r) => (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={async () => {
                          try {
                            await api.verifyDigilocker(r.id);
                            toast.success("DigiLocker Verified", `DigiLocker document verified for @${r.player?.discordUsername}. +20 Pts added!`);
                            setPendingDigilockers((prev) => prev.filter((item) => item.id !== r.id));
                          } catch (err: any) {
                            toast.error("Verification Failed", err.message);
                          }
                        }}
                      >
                        Approve e-KYC
                      </Button>
                    ),
                  },
                ]}
              />
            </div>
          </div>
        )}

        {/* TAB 3: MATCH SCORE ENTRY */}
        {tab === "matches" && (
          <div className="card-angular p-6 space-y-6">
            <CardHeader title="Match Score Entry" subtitle="Enter final squad placements & kill counts for custom room match results" />
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-bg-elevated rounded-xl p-4 border border-line">
                <div className="space-y-3">
                  <div>
                    <label className={labelCls}>Select Match Room / Group Match</label>
                    <select value={selectedMatchId} onChange={(e) => setSelectedMatchId(e.target.value)} className={inputCls}>
                      {matchesList.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.group?.stage?.tournament?.name} - {m.group?.name} (Match ID: {m.id.substring(0, 8)})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-secondary">Status:</span>
                    <Badge variant={matchesList.find((m) => m.id === selectedMatchId)?.results?.[0]?.status === "finalized" ? "verified" : "live"}>
                      {matchesList.find((m) => m.id === selectedMatchId)?.results?.[0]?.status === "finalized" ? "Finalized" : "Provisional / Live"}
                    </Badge>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-bg-primary border border-line space-y-3">
                  <span className="text-xs font-body font-medium text-accent-cyan flex items-center gap-1.5">
                    <CalendarClock className="w-3.5 h-3.5" /> Reschedule Match Room
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-text-muted mb-1">New Match Time</label>
                      <input type="datetime-local" value={rescheduleTime} onChange={(e) => setRescheduleTime(e.target.value)} className="w-full bg-bg-elevated border border-line rounded-lg px-2 py-1.5 text-xs text-text-primary font-mono outline-none focus:border-accent-cyan" />
                    </div>
                    <div>
                      <label className="block text-[11px] text-text-muted mb-1">Map Type</label>
                      <select value={rescheduleMap} onChange={(e) => setRescheduleMap(e.target.value)} className="w-full bg-bg-elevated border border-line rounded-lg px-2 py-1.5 text-xs text-text-primary outline-none focus:border-accent-cyan">
                        <option value="Bermuda">Bermuda</option>
                        <option value="Purgatory">Purgatory</option>
                        <option value="Kalahari">Kalahari</option>
                      </select>
                    </div>
                  </div>
                  <Button variant="secondary" size="sm" onClick={handleReschedule} loading={rescheduleLoading} className="w-full">
                    Update Schedule &amp; Map
                  </Button>
                </div>
              </div>

              {/* Match Score Submission Table */}
              <div className="overflow-x-auto rounded-xl border border-line">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Slot #</th>
                      <th>Squad</th>
                      <th>Placement (1st–12th)</th>
                      <th>Kills</th>
                      <th>Calculated Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const match = matchesList.find((m) => m.id === selectedMatchId);
                      if (!match) return <tr><td colSpan={5} className="text-center py-4 text-text-muted">No matches available.</td></tr>;

                      const slots = match.room?.slots || [];
                      if (slots.length === 0) return <tr><td colSpan={5} className="text-center py-4 text-text-muted">No squad slots assigned to this room yet.</td></tr>;

                      const getPlacementPoints = (rank: number) => {
                        const ptsMap: Record<number, number> = { 1: 12, 2: 9, 3: 8, 4: 7, 5: 6, 6: 5, 7: 4, 8: 3, 9: 2, 10: 1 };
                        return ptsMap[rank] || 0;
                      };

                      return slots.map((slot: any) => {
                        const existingResult = match.results?.find((r: any) => r.teamId === slot.teamId);
                        const key = `${selectedMatchId}_${slot.teamId}`;
                        const currentInput = matchResultsInput[key] || {
                          placement: existingResult?.placement ?? 12,
                          kills: existingResult?.kills ?? 0,
                        };

                        const placementVal = currentInput.placement;
                        const killsVal = currentInput.kills;
                        const calculatedPts = getPlacementPoints(placementVal) + killsVal;

                        return (
                          <tr key={slot.id}>
                            <td className="font-mono text-accent-cyan font-medium">#{slot.slotNo}</td>
                            <td className="font-medium text-text-primary">{slot.team?.name || `Team ${slot.teamId.substring(0, 8)}`}</td>
                            <td>
                              <input
                                type="number" min="1" max="12" value={placementVal}
                                onChange={(e) => setMatchResultsInput((prev) => ({ ...prev, [key]: { ...currentInput, placement: Number(e.target.value) } }))}
                                className="w-20 bg-bg-primary border border-line rounded-lg px-2 py-1 text-xs text-text-primary font-mono outline-none focus:border-accent-cyan"
                              />
                            </td>
                            <td>
                              <input
                                type="number" min="0" value={killsVal}
                                onChange={(e) => setMatchResultsInput((prev) => ({ ...prev, [key]: { ...currentInput, kills: Number(e.target.value) } }))}
                                className="w-20 bg-bg-primary border border-line rounded-lg px-2 py-1 text-xs text-text-primary font-mono outline-none focus:border-accent-cyan"
                              />
                            </td>
                            <td>
                              <span className="font-mono text-accent-cyan font-medium">
                                {calculatedPts} pts ({getPlacementPoints(placementVal)} place + {killsVal} kills)
                              </span>
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-line">
                <Button variant="primary" loading={matchesLoading} onClick={() => handleSaveMatchScore(selectedMatchId)}>
                  Save Provisional Scores
                </Button>
                <Button variant="secondary" loading={matchesLoading} onClick={() => handleFinalizeMatch(selectedMatchId)}>
                  Finalize &amp; Update Leaderboards
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PLAYER ROLES & MANAGEMENT */}
        {tab === "players" && (
          <div className="card-angular p-6 space-y-6">
            <CardHeader title="Player Registry & Role Elevation" subtitle="Admins can grant Moderator access. Super Admins can grant Admin & Moderator access." />

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-bg-elevated rounded-xl p-4 border border-line">
              <input
                type="text"
                placeholder="Search players by handle, name, or FF UID..."
                value={playerSearch}
                onChange={(e) => setPlayerSearch(e.target.value)}
                className="w-full sm:max-w-md bg-bg-primary border border-line rounded-lg px-4 py-2 text-sm text-text-primary outline-none focus:border-accent-cyan transition-colors"
              />
              <div className="text-xs font-mono text-text-muted">
                Registered accounts: <span className="text-accent-cyan font-semibold">{playersList.length}</span>
              </div>
            </div>

            <DataTable
              data={playersList.filter((p) => {
                if (!playerSearch) return true;
                const q = playerSearch.toLowerCase();
                return (
                  p.discordUsername?.toLowerCase().includes(q) ||
                  p.fullName?.toLowerCase().includes(q) ||
                  p.freefireUid?.toLowerCase().includes(q)
                );
              })}
              columns={[
                { header: "Username", key: "discordUsername", render: (r) => <span className="font-medium text-text-primary">@{r.discordUsername}</span> },
                { header: "Full Name", key: "fullName", render: (r) => <span>{r.fullName || "—"}</span> },
                { header: "FF UID", key: "freefireUid", render: (r) => <span className="font-mono text-xs text-accent-cyan">{r.freefireUid || "Unlinked"}</span> },
                {
                  header: "Role", key: "role", render: (r) => (
                    <Badge variant={r.role === "admin" || r.role === "super_admin" ? "live" : r.role === "moderator" ? "pending" : "verified"}>
                      {r.role}
                    </Badge>
                  ),
                },
                {
                  header: "Role Controls", key: "action", render: (r) => {
                    const isSelf = r.id === user?.id || r.discordUsername === user?.discordUsername;
                    const isTargetSuperAdmin = r.role === "super_admin";
                    const isRequesterSuperAdmin = user?.role === "super_admin";

                    if (isSelf) {
                      return (
                        <span className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-accent-cyan px-3 py-1.5 rounded-lg bg-accent-cyan/10 border border-accent-cyan/30">
                          <User className="w-3.5 h-3.5" /> Your Account
                        </span>
                      );
                    }

                    if (isTargetSuperAdmin && !isRequesterSuperAdmin) {
                      return (
                        <span className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-rank-gold px-3 py-1.5 rounded-lg bg-rank-gold/10 border border-rank-gold/30">
                          <Crown className="w-3.5 h-3.5" /> Protected
                        </span>
                      );
                    }

                    return (
                      <div className="flex flex-wrap gap-2">
                        {r.role !== "moderator" && r.role !== "super_admin" && (
                          <Button
                            variant="secondary" size="sm"
                            onClick={async () => {
                              try {
                                await api.updatePlayerRole(r.id, "moderator");
                                toast.success("Moderator Granted", `@${r.discordUsername} is now a Platform Moderator`);
                                const updated: any = await api.getAdminPlayers();
                                setPlayersList(updated || []);
                              } catch (err: any) {
                                toast.error("Action Restricted", err.message);
                              }
                            }}
                          >
                            <Hammer className="w-3.5 h-3.5" /> Mod
                          </Button>
                        )}

                        {isRequesterSuperAdmin && r.role !== "admin" && r.role !== "super_admin" && (
                          <Button
                            variant="primary" size="sm"
                            onClick={async () => {
                              try {
                                await api.updatePlayerRole(r.id, "admin");
                                toast.success("Admin Granted", `@${r.discordUsername} is now a System Admin`);
                                const updated: any = await api.getAdminPlayers();
                                setPlayersList(updated || []);
                              } catch (err: any) {
                                toast.error("Action Restricted", err.message);
                              }
                            }}
                          >
                            <Crown className="w-3.5 h-3.5" /> Admin
                          </Button>
                        )}

                        {r.role !== "player" && (
                          <Button
                            variant="ghost" size="sm"
                            onClick={async () => {
                              try {
                                await api.updatePlayerRole(r.id, "player");
                                toast.info("Role Reset", `@${r.discordUsername} reset to standard Player`);
                                const updated: any = await api.getAdminPlayers();
                                setPlayersList(updated || []);
                              } catch (err: any) {
                                toast.error("Action Restricted", err.message);
                              }
                            }}
                          >
                            <ShieldOff className="w-3.5 h-3.5" /> Demote
                          </Button>
                        )}
                      </div>
                    );
                  },
                },
              ]}
            />
          </div>
        )}

        {/* TAB 5: DISPUTES */}
        {tab === "disputes" && (
          <div className="card-angular p-6 space-y-4">
            <CardHeader title="Match Disputes Queue" subtitle="Review evidence and amend provisional match standings" />
            <DataTable
              data={disputesList}
              emptyMessage="All match disputes have been resolved! No pending disputes."
              columns={[
                { header: "Team", key: "team", render: (r) => <span className="font-medium text-text-primary">{r.team?.name || "Team Hawk"}</span> },
                { header: "Category", key: "category", render: (r) => <Badge variant="pending">{r.category || "wrong_kill_count"}</Badge> },
                {
                  header: "Description & Evidence",
                  key: "description",
                  render: (r) => (
                    <div className="space-y-2">
                      <span className="text-xs text-text-secondary block">{r.description}</span>
                      {r.evidenceUrl && (
                        <a
                          href={r.evidenceUrl.startsWith("http") ? r.evidenceUrl : `http://localhost:3001${r.evidenceUrl}`}
                          target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-[11px] text-accent-cyan hover:underline font-mono bg-bg-primary px-2 py-1 rounded-md border border-line"
                        >
                          <Camera className="w-3 h-3" /> View Evidence Screenshot
                        </a>
                      )}
                    </div>
                  )
                },
                {
                  header: "Resolution", key: "action", render: (r) => (
                    <div className="flex gap-2">
                      <Button variant="secondary" size="sm" onClick={() => handleResolveDispute(r.id, "resolved_upheld")}>
                        <Scale className="w-3.5 h-3.5" /> Uphold
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleResolveDispute(r.id, "resolved_rejected")}>
                        <Ban className="w-3.5 h-3.5" /> Dismiss
                      </Button>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        )}

        {/* TAB 6: PAYOUTS */}
        {tab === "payouts" && (
          <div className="card-angular p-6 space-y-6">
            <CardHeader title="Prize Pool Payouts & Ledger" subtitle="Approve payouts and log transaction references for top placement captains" />
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-bg-elevated rounded-xl p-4 border border-line">
                <div>
                  <label className={labelCls}>Filter by Tournament</label>
                  <select
                    value={selectedPayoutTournamentId}
                    onChange={async (e) => {
                      const val = e.target.value;
                      setSelectedPayoutTournamentId(val);
                      setPayoutsLoading(true);
                      try {
                        const res = await api.getTournamentPayouts(val) as any[];
                        setPayoutsList(res || []);
                      } catch (err) {
                        setPayoutsList([]);
                      } finally {
                        setPayoutsLoading(false);
                      }
                    }}
                    className={inputCls}
                  >
                    {tournamentsList.length === 0 && <option value="">No tournaments yet</option>}
                    {tournamentsList.map((t) => (<option key={t.id} value={t.id}>{t.name}</option>))}
                  </select>
                </div>
                <div className="flex items-end justify-end">
                  <Button variant="primary" onClick={() => handleFinalizePayouts(selectedPayoutTournamentId)}>
                    Finalize Standings &amp; Generate Payouts
                  </Button>
                </div>
              </div>

              <DataTable
                data={payoutsList}
                emptyMessage="No payout records found. Finalize standings to generate payout distributions."
                columns={[
                  { header: "Squad", key: "team", render: (r) => <span className="font-medium text-text-primary">{r.team?.name || "Independent"}</span> },
                  { header: "Captain", key: "captain", render: (r) => <span className="font-mono text-xs">@{r.player?.discordUsername || r.playerId.substring(0, 8)}</span> },
                  { header: "Placement", key: "placement", render: (r) => <span className="font-medium text-accent-cyan font-mono">#{r.placement}</span> },
                  { header: "Amount", key: "amount", render: (r) => <span className="font-mono text-accent-cyan font-semibold">₹{r.amount?.toLocaleString("en-IN")}</span> },
                  {
                    header: "Status", key: "status", render: (r) => (
                      <Badge variant={r.status === "paid" ? "verified" : "pending"}>{r.status || "pending"}</Badge>
                    )
                  },
                  {
                    header: "Transaction Reference", key: "txRef", render: (r) => (
                      r.status === "paid" ? (
                        <span className="font-mono text-xs text-text-muted">{r.txRef || "N/A"}</span>
                      ) : (
                        <input
                          type="text"
                          placeholder="e.g. UPI-94829384729"
                          value={payoutTxRefs[r.id] || ""}
                          onChange={(e) => setPayoutTxRefs((prev) => ({ ...prev, [r.id]: e.target.value }))}
                          className="bg-bg-primary border border-line rounded-lg px-2 py-1.5 text-xs text-text-primary font-mono outline-none focus:border-accent-cyan w-44"
                        />
                      )
                    )
                  },
                  {
                    header: "Actions", key: "action", render: (r) => (
                      r.status !== "paid" && (
                        <Button variant="secondary" size="sm" loading={payoutsLoading} onClick={() => handleUpdatePayout(r.id, "paid")}>
                          <Check className="w-3.5 h-3.5" /> Mark Paid
                        </Button>
                      )
                    )
                  }
                ]}
              />
            </div>
          </div>
        )}

        {/* TAB 7: AUDIT LOG */}
        {tab === "audit" && (
          <div className="card-angular p-6 space-y-4">
            <CardHeader title="Append-Only Audit Log" subtitle="Complete system audit trace for compliance" />
            <DataTable
              data={auditLogs}
              columns={[
                { header: "Timestamp", key: "time", render: (r) => <span className="font-mono text-xs text-text-muted">{new Date(r.createdAt).toLocaleString()}</span> },
                { header: "Actor", key: "actor", render: (r) => <span className="font-medium text-xs">@{r.actor?.discordUsername || "System"} ({r.actorRole || r.role})</span> },
                { header: "Action", key: "action", render: (r) => <span className="font-mono text-accent-cyan text-xs font-medium">{r.action}</span> },
                { header: "Entity", key: "entity", render: (r) => <span className="font-mono text-xs text-text-primary">{r.entityType}</span> },
              ]}
            />
          </div>
        )}

        {/* Create Tournament Modal */}
        <Modal open={createModal} onClose={() => setCreateModal(false)} title="Create New Tournament">
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Tournament Name</label>
              <input
                type="text" value={tName} onChange={(e) => setTName(e.target.value)}
                placeholder="e.g. TelArena Summer Cup 2026"
                className="w-full bg-bg-primary border border-line rounded-lg px-4 py-2.5 text-sm text-text-primary outline-none focus:border-accent-red transition-colors"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Format</label>
                <select value={tFormat} onChange={(e) => setTFormat(e.target.value)} className="w-full bg-bg-primary border border-line rounded-lg px-4 py-2.5 text-sm text-text-primary outline-none focus:border-accent-red transition-colors">
                  <option value="squad">Squad (4v4)</option>
                  <option value="duo">Duo (2v2)</option>
                  <option value="solo">Solo (1v1)</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Prize Pool (₹)</label>
                <input
                  type="number" value={tPrize} onChange={(e) => setTPrize(Number(e.target.value))}
                  className="w-full bg-bg-primary border border-line rounded-lg px-4 py-2.5 text-sm text-text-primary outline-none focus:border-accent-red transition-colors"
                />
              </div>
              <div>
                <label className={labelCls}>Entry Fee (₹) [0 = Free]</label>
                <input
                  type="number" value={tEntryFee} onChange={(e) => setTEntryFee(Number(e.target.value))}
                  className="w-full bg-bg-primary border border-line rounded-lg px-4 py-2.5 text-sm text-text-primary outline-none focus:border-accent-red transition-colors"
                />
              </div>
              <div>
                <label className={labelCls}>Max Teams</label>
                <input
                  type="number" value={tMaxTeams} onChange={(e) => setTMaxTeams(Number(e.target.value))}
                  className="w-full bg-bg-primary border border-line rounded-lg px-4 py-2.5 text-sm text-text-primary outline-none focus:border-accent-red transition-colors"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-line">
              <Button variant="ghost" size="sm" onClick={() => setCreateModal(false)}>Cancel</Button>
              <Button variant="primary" size="sm" loading={createLoading} onClick={handleCreateTournament}>Save &amp; Publish</Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
