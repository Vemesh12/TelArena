"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Users, Swords, Target, Clock } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { StageVisualizer } from "@/components/tournaments/StageVisualizer";
import { RoomReleaseTimer } from "@/components/tournaments/RoomReleaseTimer";
import { cn, formatDate } from "@/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export default function TournamentDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const [tournament, setTournament] = useState<any>(null);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  // Custom Registration Dashboard states
  const [showRegModal, setShowRegModal] = useState(false);
  const [regTeamName, setRegTeamName] = useState("");
  const [regLeaderName, setRegLeaderName] = useState("");
  const [regLeaderUid, setRegLeaderUid] = useState("");
  const [regInGameName, setRegInGameName] = useState("");
  const [regContactPhone, setRegContactPhone] = useState("");
  const [regWhatsappPhone, setRegWhatsappPhone] = useState("");
  const [regLobbyType, setRegLobbyType] = useState("mini");
  const [regPaymentScreenshot, setRegPaymentScreenshot] = useState("");
  const [regDeclaration, setRegDeclaration] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [tournamentMatches, setTournamentMatches] = useState<any[]>([]);
  const [selectedMatchResultsId, setSelectedMatchResultsId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.getTournament(id as string)
      .then(async (tRes: any) => {
        setTournament(tRes);
        
        // Fetch matches of all groups in all stages
        const matchesPromises: Promise<any>[] = [];
        if (tRes.stages && tRes.stages.length > 0) {
          tRes.stages.forEach((stage: any) => {
            if (stage.groups && stage.groups.length > 0) {
              stage.groups.forEach((group: any) => {
                matchesPromises.push(
                  api.getGroupMatches(group.id)
                    .then((res: any) => (Array.isArray(res) ? res.map(m => ({ ...m, groupName: group.name, stageName: stage.name })) : []))
                    .catch(() => [])
                );
              });
            }
          });
        }
        const results = await Promise.all(matchesPromises);
        setTournamentMatches(results.flat());

        return api.getRegistrations(id as string).catch(() => []);
      })
      .then((rRes: any) => {
        if (Array.isArray(rRes)) setRegistrations(rRes);
      })
      .catch((err) => {
        console.error("Tournament fetch error:", err);
        setTournament(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const [userTeam, setUserTeam] = useState<any>(null);
  const [userMatch, setUserMatch] = useState<any>(null);

  useEffect(() => {
    if (user) {
      api.getMyNextMatch()
        .then((res: any) => {
          if (res) setUserMatch(res);
        })
        .catch(() => setUserMatch(null));
    } else {
      setUserMatch(null);
    }
  }, [user]);

  useEffect(() => {
    if (showRegModal) {
      api.getMyTeam()
        .then((res: any) => {
          setUserTeam(res);
          if (res) {
            setRegTeamName(res.name || "");
            setRegLeaderName(user?.fullName || user?.discordUsername || "");
            setRegLeaderUid(user?.freefireUid || "");
            setRegContactPhone(user?.phone || "");
            setRegWhatsappPhone(user?.phone || "");
          }
        })
        .catch(() => setUserTeam(null));
    }
  }, [showRegModal, user]);

  const handlePaymentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadLoading(true);
    try {
      const res = await api.uploadFile(file);
      setRegPaymentScreenshot(res.url);
      toast.success("Receipt Uploaded", "Payment receipt screenshot uploaded successfully!");
    } catch (err: any) {
      toast.error("Upload Failed", err.message);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!userTeam) {
      return toast.error("Squad Required", "You must create or join a squad at /teams first before registering for this tournament.");
    }
    if (user?.id && userTeam.captainId !== user.id) {
      return toast.error("Captain Only", "Only the squad captain can register the team for this tournament.");
    }
    if (!regTeamName) return toast.error("Error", "Please enter Team Name");
    if (!regLeaderName) return toast.error("Error", "Please enter Leader Name");
    if (!regLeaderUid) return toast.error("Error", "Please enter Leader UID");
    if (!regContactPhone) return toast.error("Error", "Please enter Contact Number");
    if (tournament.entryFee > 0 && !regPaymentScreenshot) return toast.error("Error", "Please upload payment screenshot");
    if (!regDeclaration) return toast.error("Error", "Please agree to the declaration");

    setRegistering(true);
    try {
      const metadata = {
        teamName: regTeamName,
        leaderName: regLeaderName,
        leaderUid: regLeaderUid,
        inGameName: regInGameName,
        contactPhone: regContactPhone,
        whatsappPhone: regWhatsappPhone,
        lobbyType: regLobbyType,
        paymentScreenshot: regPaymentScreenshot,
      };

      await api.registerForTournament(id as string, metadata);
      toast.success("Registration Submitted", "Your registration has been submitted and confirmed!");
      const updated = await api.getRegistrations(id as string) as any[];
      setRegistrations(updated);
      setShowRegModal(false);
    } catch (err: any) {
      toast.error("Registration Failed", err.message);
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-16 flex items-center justify-center">
        <p className="font-body text-text-secondary text-sm">Loading tournament details…</p>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen pt-32 pb-16 flex items-center justify-center">
        <p className="font-body text-text-secondary text-sm">Tournament not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-16">
      <div className="max-w-container mx-auto px-6 lg:px-10 space-y-8">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ duration: 0.5 }}
          className="card-angular p-8 space-y-4"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3">
                <Badge variant={tournament.status === "registration_open" ? "upcoming" : "live"} pulse={tournament.status !== "registration_open"}>
                  {tournament.status?.replace(/_/g, " ")}
                </Badge>
                <span className="font-mono text-xs text-text-muted uppercase tracking-widest inline-flex items-center gap-1.5">
                  <Swords className="w-3.5 h-3.5" /> {tournament.format}
                </span>
              </div>
              <h1 className="font-display font-semibold text-3xl sm:text-4xl text-text-primary tracking-tight mt-3">
                {tournament.name}
              </h1>
              <p className="text-text-secondary text-sm mt-2 max-w-xl leading-relaxed">
                {tournament.description || "Official Free Fire esports tournament."}
              </p>
            </div>

            <div className="text-left md:text-right space-y-3 shrink-0">
              <div>
                <span className="font-mono text-xs text-text-muted uppercase tracking-widest">Total Prize Pool</span>
                <p className="font-display font-semibold text-3xl text-accent-cyan tracking-tight mt-1">
                  ₹{tournament.prizePool?.toLocaleString("en-IN") || 0}
                </p>
              </div>
              {user && (
                <Button variant="primary" onClick={() => setShowRegModal(true)}>
                  Register Squad
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Live Match Room Credentials & Countdown */}
        {userMatch ? (
          <RoomReleaseTimer
            roomId={userMatch.roomId}
            roomCode={userMatch.credentials?.roomCode}
            password={userMatch.credentials?.password}
            scheduledAt={userMatch.scheduledAt}
            releaseMinutes={userMatch.releaseMinutes || 15}
            slotNo={userMatch.slotNo}
            map={userMatch.credentials?.map}
          />
        ) : tournamentMatches.some((m: any) => m.status === 'scheduled') ? (
          <RoomReleaseTimer
            scheduledAt={tournamentMatches.find((m: any) => m.status === 'scheduled')?.scheduledAt}
            releaseMinutes={15}
          />
        ) : null}

        {/* Tournament Bracket & Stage Progression Visualizer */}
        <StageVisualizer
          stages={
            tournament?.stages && tournament.stages.length > 0
              ? tournament.stages.map((stg: any, idx: number) => ({
                  id: stg.id,
                  name: stg.name,
                  status: (stg.status === "in_progress" ? "active" : stg.status === "completed" ? "completed" : "upcoming") as "active" | "completed" | "upcoming",
                  teamsCount: stg.groups?.reduce((acc: number, g: any) => acc + (g.matches?.[0]?.results?.length || 12), 0) || (stg.stageNumber === 1 ? (tournament.maxTeams || 48) : 12),
                  dateStr: tournament.startDate ? new Date(tournament.startDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" }) : "TBA",
                  advancement: stg.advancementCount
                    ? `Top ${stg.advancementCount} squads advance to next stage`
                    : idx === tournament.stages.length - 1
                    ? `Grand Finals: ₹${(tournament.prizePool || 0).toLocaleString("en-IN")} prize pool distribution`
                    : "Stage winners advance",
                }))
              : undefined
          }
        />

        {/* Rulebook & Scoring Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Rulebook */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="card-angular p-6 space-y-4"
          >
            <CardHeader
              title="Tournament Rulebook"
              subtitle="Official match conduct, map rotation, and device policy"
              action={
                tournament.rulebookUpdatedAt ? (
                  <span className="font-mono text-[11px] text-text-muted inline-flex items-center gap-1.5">
                    <Clock className="w-3 h-3" /> Updated {formatDate(tournament.rulebookUpdatedAt)}
                  </span>
                ) : undefined
              }
            />
            <div
              className={cn(
                "text-sm text-text-secondary max-h-64 overflow-y-auto pr-2 leading-relaxed",
                "[&_p]:mb-3 [&_h1]:text-text-primary [&_h2]:text-text-primary [&_h3]:text-text-primary",
                "[&_h1]:font-display [&_h2]:font-display [&_h3]:font-display [&_h1]:font-semibold [&_h2]:font-semibold [&_h3]:font-semibold",
                "[&_h1]:mb-2 [&_h2]:mb-2 [&_h3]:mb-2 [&_h1]:mt-4 [&_h2]:mt-4 [&_h3]:mt-4",
                "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3",
                "[&_li]:mb-1 [&_strong]:text-text-primary [&_a]:text-accent-cyan [&_a]:underline",
              )}
            >
              {tournament.rulebook ? (
                <div dangerouslySetInnerHTML={{ __html: tournament.rulebook }} />
              ) : (
                <p>
                  Standard TelArena Free Fire rules apply: 1 point per kill, placement points 1st: 12, 2nd: 9,
                  3rd: 8. Device policy: mobile devices only (no emulators).
                </p>
              )}
            </div>
          </motion.div>

          {/* Placement Scoring Config Table */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.06 }}
            className="card-angular p-6 space-y-4"
          >
            <CardHeader title="Placement & Kill Points" subtitle="Scoring breakdown for this tournament" />
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              {Object.entries(tournament.scoringConfig?.placementTable || {}).map(([place, pts]: any) => (
                <div key={place} className="flex justify-between items-center py-2 px-3 rounded-lg bg-bg-elevated border border-line">
                  <span className="text-text-muted inline-flex items-center gap-1.5">
                    <Target className="w-3 h-3" /> Rank #{place}
                  </span>
                  <span className="text-accent-red font-semibold">{pts} pts</span>
                </div>
              ))}
              {Object.keys(tournament.scoringConfig?.placementTable || {}).length === 0 && (
                <p className="col-span-2 text-text-muted text-xs font-body">No scoring configuration available yet.</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Match Results list */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="card-angular p-6 space-y-4"
        >
          <CardHeader title="Match Standings &amp; Results" subtitle="Track placements and kills for every custom room match" />
          {tournamentMatches.length === 0 ? (
            <p className="text-center py-6 text-text-muted text-xs">No matches have been generated or played yet for this tournament.</p>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {tournamentMatches.map((m) => {
                  const resultStatus = m.results?.[0]?.status || "provisional";
                  return (
                    <div
                      key={m.id}
                      onClick={() => setSelectedMatchResultsId(m.id === selectedMatchResultsId ? null : m.id)}
                      className={cn(
                        "p-4 rounded-xl border transition-all cursor-pointer select-none",
                        m.id === selectedMatchResultsId
                          ? "bg-bg-elevated border-accent-cyan shadow-glow-cyan/10"
                          : "bg-bg-secondary border-line hover:border-text-secondary/25"
                      )}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-mono text-[10px] text-accent-red uppercase tracking-wider font-bold">
                          {m.stageName} | {m.groupName}
                        </span>
                        <Badge variant={resultStatus === "finalized" ? "verified" : resultStatus === "disputed" ? "pending" : "live"}>
                          {resultStatus.toUpperCase()}
                        </Badge>
                      </div>
                      <h4 className="font-display font-bold text-sm text-text-primary mt-2">
                        {m.room?.map || "Bermuda Map"} - Match Room
                      </h4>
                      <p className="font-mono text-[10px] text-text-muted mt-1">
                        Played: {new Date(m.playedAt || m.createdAt).toLocaleString()}
                      </p>
                      <div className="flex justify-between items-center mt-3 text-xs text-text-secondary border-t border-line/50 pt-2 font-display">
                        <span>{m.results?.length || 0} Standings Logged</span>
                        <span className="text-accent-cyan font-bold hover:underline font-mono text-[10px] uppercase">
                          {m.id === selectedMatchResultsId ? "Hide Results ▲" : "View Results ▼"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Match Standings Details */}
              {selectedMatchResultsId && (() => {
                const match = tournamentMatches.find((m) => m.id === selectedMatchResultsId);
                if (!match || !match.results || match.results.length === 0) {
                  return (
                    <div className="p-4 bg-bg-secondary border border-line rounded-xl text-center text-xs text-text-muted">
                      No results have been uploaded yet by administrators for this match room.
                    </div>
                  );
                }
                return (
                  <div className="bg-bg-secondary border border-line rounded-xl p-4 space-y-3 animate-fade-in font-display">
                    <div className="flex justify-between items-center">
                      <h4 className="font-display font-semibold text-sm text-text-primary uppercase tracking-tight">
                        Standings for Match room #{match.id.slice(-6).toUpperCase()} ({match.room?.map})
                      </h4>
                      <span className="text-[10px] font-mono text-text-muted">Click row action to report scoring errors</span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-line text-text-muted font-mono uppercase tracking-wider text-[10px] pb-2">
                            <th className="py-2.5">Placement</th>
                            <th>Team</th>
                            <th>Kills</th>
                            <th>Points</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-line/40">
                          {match.results.sort((a: any, b: any) => a.placement - b.placement).map((res: any) => (
                            <tr key={res.id} className="hover:bg-white/5 transition-colors">
                              <td className="py-2.5 font-mono font-bold text-text-primary">Rank #{res.placement}</td>
                              <td className="font-semibold text-text-secondary">{res.team?.name}</td>
                              <td className="font-mono text-text-secondary">{res.kills}</td>
                              <td className="font-mono text-accent-cyan font-semibold">{res.totalPts} pts</td>
                              <td>
                                <Badge variant={res.status === "finalized" ? "verified" : res.status === "disputed" ? "pending" : "live"}>
                                  {res.status}
                                </Badge>
                              </td>
                              <td className="py-1">
                                {res.status === "provisional" && (
                                  <button
                                    onClick={async () => {
                                      try {
                                        await api.flagMatchResultDisputed(res.id);
                                        toast.success("Result Disputed", "Standing flagged as disputed. Administrators have been notified.");
                                        // Refresh match data
                                        api.getTournament(id as string).then(async (tRes: any) => {
                                          const matchesPromises: Promise<any>[] = [];
                                          if (tRes.stages && tRes.stages.length > 0) {
                                            tRes.stages.forEach((stage: any) => {
                                              if (stage.groups && stage.groups.length > 0) {
                                                stage.groups.forEach((group: any) => {
                                                  matchesPromises.push(
                                                    api.getGroupMatches(group.id)
                                                      .then((r: any) => (Array.isArray(r) ? r.map(m => ({ ...m, groupName: group.name, stageName: stage.name })) : []))
                                                      .catch(() => [])
                                                  );
                                                });
                                              }
                                            });
                                          }
                                          const r = await Promise.all(matchesPromises);
                                          setTournamentMatches(r.flat());
                                        });
                                      } catch (err: any) {
                                        toast.error("Action Failed", err.message || "Failed to flag result.");
                                      }
                                    }}
                                    className="px-2 py-1 rounded bg-accent-red/10 border border-accent-red/20 text-[10px] text-accent-red font-mono hover:bg-accent-red hover:text-white transition-colors"
                                  >
                                    Report Score Error
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </motion.div>

        {/* Registered Teams Table */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="card-angular p-6 space-y-4"
        >
          <CardHeader
            title="Registered Squads"
            subtitle={`Enrolled teams (${registrations.length}/${tournament.maxTeams})`}
            action={<Users className="w-4 h-4 text-text-muted" />}
          />
          <DataTable
            data={registrations}
            columns={[
              { header: "Team Name", key: "team", render: (r) => <span className="font-body font-medium text-text-primary">{r.team?.name} <span className="text-text-muted font-mono text-xs">[{r.team?.tag}]</span></span> },
              { header: "Captain", key: "captain", render: (r) => <span className="font-mono text-xs text-text-secondary">@{r.team?.captain?.discordUsername}</span> },
              { header: "Status", key: "status", render: (r) => <Badge variant="verified">{r.status}</Badge> },
            ]}
            emptyMessage="No teams registered yet. Be the first to enter!"
          />
        </motion.div>

        {/* ─── FIRESTORM ESPORTS STYLE REGISTRATION DASHBOARD MODAL ─── */}
        {showRegModal && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm">
            <div className="bg-bg-card border border-line rounded-2xl w-full max-w-[1280px] overflow-hidden shadow-2xl relative flex flex-col lg:grid lg:grid-cols-12 text-text-primary animate-fade-in">
              {/* Close Button */}
              <button
                onClick={() => setShowRegModal(false)}
                className="absolute top-4 right-4 text-text-secondary hover:text-text-primary transition-colors text-2xl font-bold z-10"
              >
                ✕
              </button>

              {/* LEFT COLUMN: Tournament Timing, Payment & Notes */}
              <div className="lg:col-span-3 bg-bg-secondary p-6 border-r border-line space-y-6 flex flex-col justify-between">
                <div className="space-y-6">
                  {/* Branding */}
                  <div className="text-center md:text-left">
                    <span className="text-[26px] font-black tracking-tight text-accent-red font-display uppercase block">Firestorm</span>
                    <span className="text-xs font-mono tracking-widest text-text-muted uppercase block -mt-1.5">Esports Series</span>
                  </div>

                  {/* Timing */}
                  <div className="p-4 bg-bg-primary border border-accent-red/20 rounded-xl space-y-1">
                    <span className="text-[10px] font-mono text-accent-red uppercase tracking-widest block font-bold">Tournament Timing</span>
                    <span className="text-2xl font-black font-display text-text-primary block">1:00 PM</span>
                    <span className="text-xs text-text-muted block">Daily Lobby Mode</span>
                  </div>

                  {/* Payment Details */}
                  {tournament.entryFee > 0 && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest block">Payment Details</span>
                      <div className="bg-bg-primary border border-line rounded-xl p-3 space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-text-secondary">🟣 PhonePe:</span>
                          <span className="font-mono font-bold text-text-primary">+91 7061548830</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-text-secondary">🔵 Google Pay:</span>
                          <span className="font-mono font-bold text-text-primary">+91 7061548830</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Note List */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest block">Important Notes</span>
                    <ul className="text-xs text-text-secondary space-y-2 list-none pl-0">
                      <li className="flex items-start gap-2">
                        <span className="text-accent-red">✓</span> No Refund after registration.
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent-red">✓</span> Match will start on time.
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent-red">✓</span> Join WhatsApp Group compulsory.
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent-red">✓</span> Follow all rules & regulations.
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Contact Us */}
                <div className="pt-4 border-t border-line">
                  <a
                    href="https://wa.me/918603646729"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 rounded-xl bg-status-success/15 hover:bg-status-success/25 border border-status-success/30 text-status-success font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                  >
                    💬 Contact Us (+91 8603646729)
                  </a>
                </div>
              </div>

              {/* CENTER COLUMN: Registration Form */}
              <div className="lg:col-span-6 p-6 md:p-8 space-y-6 flex flex-col justify-between">
                <div>
                  <div className="mb-6">
                    <h2 className="font-display font-black text-2xl text-text-primary uppercase tracking-tight">Registration Dashboard</h2>
                    <p className="text-xs text-text-secondary mt-1">Please fill out your team registration details carefully.</p>
                    {!userTeam ? (
                      <div className="mt-3 p-3.5 rounded-xl bg-accent-red/10 border border-accent-red/30 text-xs text-accent-red flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                        <span>⚠️ You do not currently belong to a squad. You must create or join a squad first before registering.</span>
                        <a href="/teams" className="px-3 py-1 bg-accent-red text-white font-semibold rounded-lg shrink-0 hover:bg-accent-red/80 transition-all">
                          Go to Teams HQ →
                        </a>
                      </div>
                    ) : user?.id && userTeam.captainId !== user.id ? (
                      <div className="mt-3 p-3.5 rounded-xl bg-accent-cyan/10 border border-accent-cyan/30 text-xs text-accent-cyan">
                        ℹ️ You are registered as a squad member. Only your captain (<strong>@{userTeam.captain?.discordUsername || "Captain"}</strong>) can submit tournament registrations.
                      </div>
                    ) : null}
                  </div>

                  {/* Inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-text-muted uppercase tracking-widest">👥 Team Name *</label>
                      <input
                        type="text"
                        value={regTeamName}
                        onChange={(e) => setRegTeamName(e.target.value)}
                        placeholder="Enter team name"
                        className="w-full bg-bg-primary border border-line rounded-xl px-3 py-2 text-xs text-text-primary outline-none focus:border-accent-red transition-colors"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-text-muted uppercase tracking-widest">👤 Team Leader Name *</label>
                      <input
                        type="text"
                        value={regLeaderName}
                        onChange={(e) => setRegLeaderName(e.target.value)}
                        placeholder="Leader full name"
                        className="w-full bg-bg-primary border border-line rounded-xl px-3 py-2 text-xs text-text-primary outline-none focus:border-accent-red transition-colors"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-text-muted uppercase tracking-widest">🆔 Leader Free Fire UID *</label>
                      <input
                        type="text"
                        value={regLeaderUid}
                        onChange={(e) => setRegLeaderUid(e.target.value)}
                        placeholder="Leader in-game UID"
                        className="w-full bg-bg-primary border border-line rounded-xl px-3 py-2 text-xs text-text-primary outline-none focus:border-accent-red transition-colors font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-text-muted uppercase tracking-widest">🎮 In-Game Name (IGN)</label>
                      <input
                        type="text"
                        value={regInGameName}
                        onChange={(e) => setRegInGameName(e.target.value)}
                        placeholder="Leader IGN"
                        className="w-full bg-bg-primary border border-line rounded-xl px-3 py-2 text-xs text-text-primary outline-none focus:border-accent-red transition-colors"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-text-muted uppercase tracking-widest">📞 Contact Number *</label>
                      <input
                        type="text"
                        value={regContactPhone}
                        onChange={(e) => setRegContactPhone(e.target.value)}
                        placeholder="+91 Registered phone"
                        className="w-full bg-bg-primary border border-line rounded-xl px-3 py-2 text-xs text-text-primary outline-none focus:border-accent-red transition-colors font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-text-muted uppercase tracking-widest">💬 WhatsApp Number</label>
                      <input
                        type="text"
                        value={regWhatsappPhone}
                        onChange={(e) => setRegWhatsappPhone(e.target.value)}
                        placeholder="+91 WhatsApp phone"
                        className="w-full bg-bg-primary border border-line rounded-xl px-3 py-2 text-xs text-text-primary outline-none focus:border-accent-red transition-colors font-mono"
                      />
                    </div>
                  </div>

                  {tournament.entryFee > 0 && (
                    <div className="mt-4">
                      {/* Receipt Screenshot Upload */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-text-muted uppercase tracking-widest">📸 Payment Screenshot *</label>
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePaymentUpload}
                            disabled={uploadLoading}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          />
                          <div className="bg-bg-primary border border-dashed border-line rounded-xl px-4 py-3 text-center hover:border-accent-red transition-colors cursor-pointer text-xs">
                            {uploadLoading ? "Uploading Receipt..." : regPaymentScreenshot ? "✓ Screenshot Uploaded" : "Upload Receipt Screenshot"}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Declaration Checkbox and Action */}
                <div className="pt-6 border-t border-line space-y-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={regDeclaration}
                      onChange={(e) => setRegDeclaration(e.target.checked)}
                      className="mt-0.5 accent-accent-red"
                    />
                    <span className="text-[11px] text-text-secondary leading-relaxed">
                      I agree that all the information provided by me is correct. I will follow all the rules and regulations of FireStorm Esports.
                    </span>
                  </label>

                  <Button
                    variant="primary"
                    size="lg"
                    loading={registering}
                    onClick={handleRegister}
                    className="w-full bg-accent-red text-white py-3 rounded-xl hover:bg-accent-red/90 hover:shadow-glow-red font-display font-bold uppercase tracking-wider text-xs"
                  >
                    Submit Registration
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
