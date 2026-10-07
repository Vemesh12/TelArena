"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Swords, Lock, Bell, Wallet, Trophy, CheckCircle2, Gavel, AlertTriangle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardHeader } from "@/components/ui/Card";
import { CountdownTimer } from "@/components/ui/CountdownTimer";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import { Modal } from "@/components/ui/Modal";
import { useSocket } from "@/hooks/useSocket";

export default function PlayerDashboardPage() {
  const { user } = useAuth();
  const toast = useToast();
  const { subscribeToRoom } = useSocket();
  const [nextMatch, setNextMatch] = useState<any>(null);
  const [myTournaments, setMyTournaments] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInLoading, setCheckInLoading] = useState(false);

  // Disputes State
  const [disputes, setDisputes] = useState<any[]>([]);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeCategory, setDisputeCategory] = useState("wrong_kill_count");
  const [disputeDescription, setDisputeDescription] = useState("");
  const [disputeEvidence, setDisputeEvidence] = useState("");
  const [submittingDispute, setSubmittingDispute] = useState(false);
  const [evidenceUploading, setEvidenceUploading] = useState(false);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      api.getNextMatch().catch(() => null),
      api.getMyRegistrations().catch(() => []),
      api.getMyPayouts().catch(() => []),
      api.getNotifications().catch(() => []),
      api.getMyDisputes().catch(() => []),
    ])
      .then(([matchRes, tourneyRes, payoutRes, notifRes, disputesRes]: any) => {
        setNextMatch(matchRes);
        if (matchRes?.checkedIn) {
          setIsCheckedIn(true);
        }
        setMyTournaments(tourneyRes || []);
        setPayouts(payoutRes || []);
        setNotifications(notifRes || []);
        setDisputes(disputesRes || []);
      })
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    if (!nextMatch?.roomId) return;
    const unsub = subscribeToRoom(nextMatch.roomId, (data: any) => {
      setNextMatch((prev: any) => {
        if (!prev) return prev;
        return {
          ...prev,
          isReleased: true,
          credentials: {
            roomCode: data.roomCode,
            password: data.password,
            map: data.map,
          },
        };
      });
      toast.success("Credentials Released!", "Custom room details are now available live.");
    });
    return () => {
      if (typeof unsub === "function") unsub();
    };
  }, [nextMatch?.roomId, subscribeToRoom]);

  const handleEvidenceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEvidenceUploading(true);
    try {
      const res = await api.uploadFile(file);
      setDisputeEvidence(res.url);
      toast.success("Evidence Uploaded", "Dispute screenshot evidence uploaded successfully!");
    } catch (err: any) {
      toast.error("Upload Failed", err.message || "Failed to upload image.");
    } finally {
      setEvidenceUploading(false);
    }
  };

  const handleRaiseDispute = async () => {
    if (!disputeDescription) return toast.error("Error", "Please enter dispute description");
    setSubmittingDispute(true);
    try {
      const payload = {
        category: disputeCategory,
        description: disputeDescription,
        evidenceUrl: disputeEvidence || undefined,
        matchId: nextMatch?.id || undefined,
      };
      await api.raiseDispute(payload);
      toast.success("Dispute Submitted", "Your dispute has been filed and sent to moderators.");
      setShowDisputeModal(false);
      setDisputeDescription("");
      setDisputeEvidence("");
      // Refresh list
      const updated = (await api.getMyDisputes().catch(() => [])) as any[];
      setDisputes(updated);
    } catch (err: any) {
      toast.error("Submission Failed", err.message || "An error occurred.");
    } finally {
      setSubmittingDispute(false);
    }
  };

  const handleCheckIn = async () => {
    setCheckInLoading(true);
    try {
      const res: any = await api.checkInSquad();
      setIsCheckedIn(true);
      toast.success("Squad Checked In!", res.message || "Your squad status is set to READY.");
    } catch (err: any) {
      toast.error("Check-In Failed", err.message || "Could not check in your squad. Please try again.");
    } finally {
      setCheckInLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-16">
      <div className="max-w-container mx-auto px-6 lg:px-10 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="font-display font-semibold text-3xl sm:text-4xl text-text-primary tracking-tight">
            Player Dashboard
          </h1>
          <p className="text-text-secondary text-sm mt-2">
            Welcome back, @{user?.discordUsername || "Player"}. Track upcoming room releases and winnings.
          </p>
        </motion.div>

        {/* Next Match & Room Credentials */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.06 }}
        >
          <Card variant="cyan" className="p-6 space-y-4">
            <CardHeader
              title="Next Scheduled Match"
              subtitle="Server-enforced time-released custom room details"
              action={<Swords className="w-4 h-4 text-accent-cyan" />}
            />

            {nextMatch ? (
              <div className="bg-bg-primary rounded-xl p-6 border border-line space-y-4">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <span className="font-mono text-xs text-accent-red uppercase tracking-widest">
                      Assigned Slot: #{nextMatch.slotNo}
                    </span>
                    <h3 className="font-display font-semibold text-2xl text-text-primary mt-1">
                      Free Fire Custom Room
                    </h3>
                    <p className="text-xs text-text-muted mt-1">
                      Start Time: {new Date(nextMatch.scheduledAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    {!nextMatch.isReleased ? (
                      <div>
                        <p className="font-mono text-xs text-text-muted uppercase tracking-widest mb-2 text-right">
                          Release In
                        </p>
                        <CountdownTimer targetDate={nextMatch.releaseAt} />
                      </div>
                    ) : (
                      <Badge variant="live" pulse>Credentials Released</Badge>
                    )}

                    <Button
                      variant={isCheckedIn ? "secondary" : "primary"}
                      size="sm"
                      loading={checkInLoading}
                      disabled={isCheckedIn}
                      onClick={handleCheckIn}
                    >
                      {isCheckedIn ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" /> Checked In (Ready)
                        </>
                      ) : (
                        <>
                          <Swords className="w-4 h-4" /> Check-In Squad Now
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {nextMatch.isReleased && nextMatch.credentials ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-line">
                    <div className="p-4 rounded-xl bg-bg-elevated border border-line">
                      <span className="text-[11px] font-mono text-text-muted uppercase tracking-widest block mb-1">
                        Room Code / ID
                      </span>
                      <p className="font-mono text-xl font-semibold text-accent-red select-all tracking-widest">
                        {nextMatch.credentials.roomCode}
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-bg-elevated border border-line">
                      <span className="text-[11px] font-mono text-text-muted uppercase tracking-widest block mb-1">
                        Password
                      </span>
                      <p className="font-mono text-xl font-semibold text-accent-cyan select-all tracking-widest">
                        {nextMatch.credentials.password}
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-bg-elevated border border-line">
                      <span className="text-[11px] font-mono text-text-muted uppercase tracking-widest block mb-1">
                        Map
                      </span>
                      <p className="font-mono text-base font-semibold text-text-primary">
                        {nextMatch.credentials.map || "Bermuda"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-lg bg-bg-elevated border border-line text-center text-xs text-text-muted font-mono flex items-center justify-center gap-2">
                    <Lock className="w-3.5 h-3.5" />
                    Room credentials will automatically appear here 15 minutes prior to match start.
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-10 text-text-muted text-sm">
                No upcoming room release scheduled. Register your team for a tournament to receive room slots!
              </div>
            )}
          </Card>
        </motion.div>

        {/* Winnings & Notifications */}
        <div className="grid md:grid-cols-2 gap-5">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.12 }}
          >
            <Card className="p-6 space-y-4 h-full">
              <CardHeader
                title="Your Winnings & Payouts"
                subtitle="Prize pool earnings tracker"
                action={<Wallet className="w-4 h-4 text-accent-cyan" />}
              />
              {payouts.length > 0 ? (
                <div className="space-y-3">
                  {payouts.map((p, i) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.06 }}
                      className="flex items-center justify-between p-3 rounded-xl bg-bg-elevated border border-line"
                    >
                      <div>
                        <span className="font-body font-medium text-sm text-text-primary">{p.tournament?.name}</span>
                        <span className="block text-xs text-text-muted mt-0.5">Placement: #{p.placement}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-base font-semibold text-accent-cyan block tabular-nums">
                          ₹{p.amount.toLocaleString("en-IN")}
                        </span>
                        <Badge variant={p.status === "paid" ? "verified" : "pending"} className="mt-1">
                          {p.status}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-text-muted text-xs">
                  No prize payouts recorded yet. Win tournaments to see earnings here!
                </div>
              )}
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.18 }}
          >
            <Card className="p-6 space-y-4 h-full">
              <CardHeader
                title="Notification Center"
                subtitle="Recent in-app alerts"
                action={<Bell className="w-4 h-4 text-accent-cyan" />}
              />
              {notifications.length > 0 ? (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-2">
                  {notifications.map((n, i) => (
                    <motion.div
                      key={n.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.06 }}
                      className="p-3 rounded-xl bg-bg-elevated border border-line border-l-2 border-l-accent-red text-xs space-y-1"
                    >
                      <p className="font-body font-medium text-text-primary">{n.title}</p>
                      <p className="text-text-muted">{n.body}</p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-text-muted text-xs">
                  No notifications yet. You will receive room release alerts and match results here.
                </div>
              )}
            </Card>
          </motion.div>
        </div>

        {/* My Registered Tournaments */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.24 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-4 h-4 text-accent-cyan" />
            <h3 className="font-display font-semibold text-lg text-text-primary">My Registered Tournaments</h3>
          </div>
          <DataTable
            data={myTournaments}
            loading={loading && myTournaments.length === 0}
            columns={[
              { header: "Tournament Name", key: "tournament", render: (r) => <span className="font-body font-medium text-text-primary">{r.tournament?.name}</span> },
              { header: "Format", key: "format", render: (r) => <span className="font-mono text-text-secondary">{r.tournament?.format}</span> },
              { header: "Prize Pool", key: "prize", render: (r) => <span className="font-mono text-accent-cyan tabular-nums">₹{r.tournament?.prizePool?.toLocaleString("en-IN")}</span> },
              { header: "Registration Status", key: "status", render: (r) => <Badge variant="verified">{r.status}</Badge> },
            ]}
            emptyMessage="Your team is not registered in any active tournaments."
          />
        </motion.div>

        {/* Disputes Appeals Tracker */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Gavel className="w-4 h-4 text-accent-cyan" />
              <h3 className="font-display font-semibold text-lg text-text-primary">Disputes &amp; Score Appeals</h3>
            </div>
            <Button variant="secondary" size="sm" onClick={() => setShowDisputeModal(true)}>
              <Gavel className="w-3.5 h-3.5" /> File Score Appeal
            </Button>
          </div>
          <DataTable
            data={disputes}
            loading={loading && disputes.length === 0}
            columns={[
              { header: "Dispute ID", key: "id", render: (r) => <span className="font-mono text-xs text-text-muted">#{r.id.slice(-6).toUpperCase()}</span> },
              { header: "Category", key: "category", render: (r) => <span className="font-mono text-xs text-accent-cyan uppercase">{r.category.replace(/_/g, " ")}</span> },
              { header: "Description", key: "description", render: (r) => <span className="text-xs text-text-secondary line-clamp-1">{r.description}</span> },
              { header: "Status", key: "status", render: (r) => (
                <Badge variant={r.status === "resolved_upheld" ? "verified" : r.status === "resolved_rejected" ? "default" : "pending"}>
                  {r.status.replace(/_/g, " ").toUpperCase()}
                </Badge>
              )},
              { header: "Resolution Note", key: "resolution", render: (r) => <span className="text-xs text-text-muted italic">{r.resolution || "Under review"}</span> },
            ]}
            emptyMessage="No disputes raised. All results are accepted!"
          />
        </motion.div>

        {/* Raise Dispute Modal */}
        <Modal open={showDisputeModal} onClose={() => setShowDisputeModal(false)} title="File Standings Appeal Dispute">
          <div className="space-y-4 font-display">
            <div className="p-3 bg-accent-red/10 border border-accent-red/20 rounded-xl flex items-start gap-3 text-xs text-text-secondary leading-relaxed">
              <AlertTriangle className="w-4 h-4 text-accent-red shrink-0 mt-0.5" />
              <span>
                <strong>Important:</strong> Only raise a dispute if your team scored differently than provisional match result logs. You must provide evidence (e.g. game lobby screenshot). Abuse of this system will result in point deduction.
              </span>
            </div>

            <div>
              <label className="text-[10px] font-mono text-text-muted uppercase tracking-widest block mb-1">Dispute Category</label>
              <select
                value={disputeCategory}
                onChange={(e) => setDisputeCategory(e.target.value)}
                className="w-full bg-bg-primary border border-line rounded-xl px-4 py-2.5 text-xs text-text-primary outline-none focus:border-accent-red transition-colors"
              >
                <option value="wrong_kill_count">Wrong Kill Count</option>
                <option value="wrong_placement">Wrong Placement</option>
                <option value="room_connectivity">Room Connectivity Issues</option>
                <option value="suspected_cheating">Suspected Cheating/Hacking</option>
                <option value="eligibility_appeal">Eligibility Appeal</option>
                <option value="other">Other Appeal</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono text-text-muted uppercase tracking-widest block mb-1">Detailed Description *</label>
              <textarea
                rows={3}
                value={disputeDescription}
                onChange={(e) => setDisputeDescription(e.target.value)}
                placeholder="Include details: Match number, what went wrong, correct score stats..."
                className="w-full bg-bg-primary border border-line rounded-xl px-4 py-2.5 text-xs text-text-primary outline-none focus:border-accent-red transition-colors resize-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono text-text-muted uppercase tracking-widest block mb-1">Upload Screenshot Evidence</label>
              <div className="relative font-mono">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleEvidenceUpload}
                  disabled={evidenceUploading}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="bg-bg-primary border border-dashed border-line rounded-xl px-4 py-3 text-center hover:border-accent-cyan transition-colors cursor-pointer text-xs text-text-secondary">
                  {evidenceUploading ? "Uploading Screenshot..." : disputeEvidence ? "✓ Evidence Image Uploaded" : "Upload Match Score Screenshot"}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-line">
              <Button variant="ghost" size="sm" onClick={() => setShowDisputeModal(false)}>Cancel</Button>
              <Button variant="primary" size="sm" loading={submittingDispute} onClick={handleRaiseDispute}>Submit Appeal</Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
