"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, UserPlus, Crown, Shield, KeyRound } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Footer } from "@/components/ui/Footer";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export default function TeamsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [myTeam, setMyTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [teamTag, setTeamTag] = useState("");
  const [inviteCode, setInviteCode] = useState("");

  const fetchTeam = async () => {
    try {
      const res = await api.getMyTeam();
      setMyTeam(res);
    } catch {
      setMyTeam(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchTeam();
    else setLoading(false);
  }, [user]);

  const handleCreateTeam = async () => {
    if (!teamName || !teamTag) return toast.error("Error", "Please enter team name and tag");
    try {
      await api.createTeam({ name: teamName, tag: teamTag.toUpperCase() });
      toast.success("Team Created", `Team ${teamName} (${teamTag}) created successfully!`);
      setCreateOpen(false);
      fetchTeam();
    } catch (err: any) {
      toast.error("Failed to create team", err.message);
    }
  };

  const handleJoinTeam = async () => {
    if (!inviteCode) return toast.error("Error", "Enter invite code");
    try {
      await api.joinTeam(inviteCode);
      toast.success("Joined Team", "Successfully joined the squad!");
      fetchTeam();
    } catch (err: any) {
      toast.error("Failed to join team", err.message);
    }
  };

  const handleVouch = async (memberId: string) => {
    if (!myTeam) return;
    try {
      await api.vouchMember(myTeam.id, memberId);
      toast.success("Captain Vouch Added", "Vouch bonus added to teammate's TES score.");
      fetchTeam();
    } catch (err: any) {
      toast.error("Vouch Failed", err.message);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-16">
      <div className="max-w-container mx-auto px-6 lg:px-10 space-y-10">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p className="font-mono text-xs text-accent-cyan uppercase tracking-widest mb-3">Team Management</p>
          <h1 className="font-display font-semibold text-4xl sm:text-5xl text-text-primary tracking-tight mb-4">
            Team HQ &amp; Squad Roster
          </h1>
          <p className="text-text-secondary text-lg max-w-2xl">
            Create or join a 4-man Free Fire squad. At least 3 of 4 core players must be TES-Verified to confirm roster status.
          </p>
        </motion.div>

        {loading ? (
          <div className="card-angular p-8 text-center text-text-muted font-body text-sm">Loading Team HQ...</div>
        ) : myTeam ? (
          <div className="space-y-6">
            {/* Team HQ Header Banner */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="card-angular p-6 flex flex-col md:flex-row items-center justify-between gap-6"
            >
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="font-display font-semibold text-2xl sm:text-3xl text-text-primary tracking-tight">{myTeam.name}</h2>
                  <span className="font-mono text-sm px-2.5 py-1 rounded-md bg-white/[0.04] border border-line text-accent-cyan font-semibold">
                    {myTeam.tag}
                  </span>
                  <Badge variant={myTeam.computedStatus === "confirmed" ? "verified" : "pending"}>
                    {myTeam.computedStatus}
                  </Badge>
                </div>
                <p className="text-xs text-text-secondary font-body mt-2">
                  Verification Progress: <span className="text-accent-red font-semibold">{myTeam.verificationProgress}</span>
                </p>
              </div>

              <div className="bg-white/[0.03] rounded-xl px-4 py-3 border border-line text-right shrink-0">
                <span className="text-[10px] font-mono uppercase tracking-widest text-text-muted flex items-center justify-end gap-1.5 mb-1">
                  <KeyRound className="w-3 h-3" strokeWidth={2} /> Invite Code
                </span>
                <span className="font-mono text-sm font-semibold text-accent-cyan tracking-wider select-all">
                  {myTeam.inviteCode}
                </span>
              </div>
            </motion.div>

            {/* Roster Cards Grid */}
            <div className="card-angular p-6 space-y-4">
              <CardHeader title="Squad Roster (4 Core Players)" subtitle="Individual player verification badges and captain controls" />

              <motion.div
                initial="hidden"
                animate="show"
                variants={{ show: { transition: { staggerChildren: 0.06 } } }}
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
              >
                {myTeam.members?.map((member: any) => {
                  const player = member.player;
                  const isCaptain = player.id === myTeam.captainId;
                  const verifStatus = player.verification?.status || "not_started";

                  return (
                    <motion.div
                      key={player.id}
                      variants={fadeUp}
                      transition={{ duration: 0.35 }}
                      className="bg-white/[0.02] rounded-xl p-4 border border-line flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent-red/15 text-accent-red flex items-center justify-center font-display font-semibold shrink-0">
                          {player.discordUsername?.[0]?.toUpperCase() || "P"}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-body font-medium text-sm text-text-primary">{player.discordUsername}</span>
                            {isCaptain && (
                              <span className="inline-flex items-center gap-1 text-[10px] bg-accent-red/15 text-accent-red px-1.5 py-0.5 rounded-md font-display font-semibold uppercase tracking-wide">
                                <Crown className="w-3 h-3" strokeWidth={2} /> Captain
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-mono text-text-muted">UID: {player.freefireUid || "Unlinked"}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge variant={verifStatus === "auto_approved" || verifStatus === "approved" ? "verified" : "pending"}>
                          {verifStatus}
                        </Badge>
                        {user?.id === myTeam.captainId && !isCaptain && (
                          <Button variant="ghost" size="sm" onClick={() => handleVouch(player.id)}>
                            <Shield className="w-3.5 h-3.5" strokeWidth={2} /> Vouch
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Create Team Form */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="card-angular p-6 space-y-4"
            >
              <div className="w-11 h-11 rounded-xl bg-accent-red/10 flex items-center justify-center mb-1">
                <Users className="w-5 h-5 text-accent-red" strokeWidth={2} />
              </div>
              <CardHeader title="Create a New Squad" subtitle="Become captain and invite 3 teammates" />
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-display text-text-muted uppercase tracking-wide mb-1.5">Team Name</label>
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="e.g. Hyderabad Hawks"
                    className="w-full bg-white/[0.03] border border-line rounded-xl px-4 py-2.5 text-sm text-text-primary font-body placeholder:text-text-muted focus:border-accent-red outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-display text-text-muted uppercase tracking-wide mb-1.5">Team Tag (Max 6 Chars)</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={teamTag}
                    onChange={(e) => setTeamTag(e.target.value)}
                    placeholder="e.g. HHK"
                    className="w-full bg-white/[0.03] border border-line rounded-xl px-4 py-2.5 text-sm text-text-primary font-mono uppercase placeholder:text-text-muted placeholder:normal-case focus:border-accent-red outline-none transition-colors"
                  />
                </div>
                <Button variant="primary" className="w-full" onClick={handleCreateTeam}>
                  <Users className="w-4 h-4" strokeWidth={2} /> Create Team HQ
                </Button>
              </div>
            </motion.div>

            {/* Join Team via Code */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.08 }}
              className="card-angular p-6 space-y-4"
            >
              <div className="w-11 h-11 rounded-xl bg-accent-cyan/10 flex items-center justify-center mb-1">
                <UserPlus className="w-5 h-5 text-accent-cyan" strokeWidth={2} />
              </div>
              <CardHeader title="Join Existing Squad" subtitle="Use captain's invite code to join roster" />
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-display text-text-muted uppercase tracking-wide mb-1.5">Invite Code</label>
                  <input
                    type="text"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    placeholder="Paste invite code..."
                    className="w-full bg-white/[0.03] border border-line rounded-xl px-4 py-2.5 text-sm text-text-primary font-mono placeholder:font-body placeholder:text-text-muted focus:border-accent-red outline-none transition-colors"
                  />
                </div>
                <Button variant="secondary" className="w-full" onClick={handleJoinTeam}>
                  <UserPlus className="w-4 h-4" strokeWidth={2} /> Join Roster
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
