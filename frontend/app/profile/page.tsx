"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/Badge";
import { CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { Footer } from "@/components/ui/Footer";
import { useToast } from "@/components/ui/Toast";
import { getVerificationBadgeVariant } from "@/lib/utils";
import { api } from "@/lib/api";
import Link from "next/link";

export default function ProfilePage() {
  const { user, refetch } = useAuth();
  const toast = useToast();
  const [editing, setEditing] = useState(false);

  // Form Field States
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [freefireUid, setFreefireUid] = useState("");
  const [age, setAge] = useState("");
  const [primaryLanguage, setPrimaryLanguage] = useState("Telugu");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setPhone(user.phone || "");
      setFreefireUid(user.freefireUid || "");
      setAge(user.age ? String(user.age) : "");
      setPrimaryLanguage(user.primaryLanguage || "Telugu");
    }
  }, [user]);

  const verifStatus = user?.verification?.status || "not_started";
  const badgeVariant = getVerificationBadgeVariant(verifStatus);

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.completeOnboarding({
        fullName,
        freefireUid,
        phone,
        age: age ? Number(age) : undefined,
        primaryLanguage,
      });
      await refetch();
      toast.success("Profile Updated", "Your player details have been saved.");
      setEditing(false);
    } catch (err: any) {
      toast.error("Update Failed", err.message || "Could not update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-16">
      <div className="max-w-container mx-auto px-6 lg:px-10 space-y-6">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="card-angular p-8 flex flex-col md:flex-row items-center justify-between gap-6 border-accent-top"
        >
          <div className="flex items-center gap-6">
            <div className="relative">
              {user?.discordAvatar ? (
                <img src={user.discordAvatar} alt={user.discordUsername} className="w-20 h-20 rounded-full border-2 border-accent-red" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-accent-red/15 text-accent-red font-display font-semibold flex items-center justify-center text-2xl">
                  {user?.discordUsername?.[0]?.toUpperCase() || "P"}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1">
                <Badge variant={badgeVariant}>{verifStatus.replace("_", " ")}</Badge>
              </div>
            </div>

            <div>
              <h1 className="font-display font-semibold text-3xl text-text-primary tracking-tight">
                {user?.fullName || user?.discordUsername || "Player Profile"}
              </h1>
              <p className="text-text-secondary text-sm font-mono mt-1">@{user?.discordUsername}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs font-mono text-text-muted">Role: <span className="text-accent-cyan font-semibold">{user?.role || "player"}</span></span>
                <span className="text-white/20">·</span>
                <span className="text-xs font-mono text-text-muted">TES Score: <span className="text-accent-red font-semibold">{user?.verification?.tesScore || 0}/100</span></span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/verify">
              <Button variant="primary" size="sm">
                {verifStatus === "not_started" ? "Start TES Verification" : "View Verification Status"}
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Details Section */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Identity & Game Info */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="card-angular p-6 space-y-4"
          >
            <CardHeader title="Player Credentials" subtitle="Your in-game identity and personal details" />

            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-body text-text-muted mb-1.5">Full name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Suresh Varma"
                    className="w-full bg-bg-primary border border-line rounded-lg px-4 py-2.5 text-sm text-text-primary outline-none focus:border-accent-red transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-body text-text-muted mb-1.5">Free Fire UID</label>
                  <input
                    type="text"
                    value={freefireUid}
                    onChange={(e) => setFreefireUid(e.target.value)}
                    placeholder="e.g. 1434263454"
                    className="w-full bg-bg-primary border border-line rounded-lg px-4 py-2.5 text-sm text-text-primary font-mono outline-none focus:border-accent-cyan transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-body text-text-muted mb-1.5">Phone number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 8186945403"
                    className="w-full bg-bg-primary border border-line rounded-lg px-4 py-2.5 text-sm text-text-primary font-mono outline-none focus:border-accent-red transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-body text-text-muted mb-1.5">Age (years)</label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="e.g. 21"
                      className="w-full bg-bg-primary border border-line rounded-lg px-4 py-2.5 text-sm text-text-primary font-mono outline-none focus:border-accent-red transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-body text-text-muted mb-1.5">Primary language</label>
                    <select
                      value={primaryLanguage}
                      onChange={(e) => setPrimaryLanguage(e.target.value)}
                      className="w-full bg-bg-primary border border-line rounded-lg px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent-red transition-colors"
                    >
                      <option value="Telugu">Telugu</option>
                      <option value="English">English</option>
                      <option value="Hindi">Hindi</option>
                      <option value="Tamil">Tamil</option>
                      <option value="Kannada">Kannada</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
                  <Button variant="primary" size="sm" loading={loading} onClick={handleSave}>Save Changes</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-line">
                  <span className="text-xs font-mono text-text-muted">Full name</span>
                  <span className="text-sm font-semibold text-text-primary">{user?.fullName || "Not Provided"}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-line">
                  <span className="text-xs font-mono text-text-muted">Free Fire UID</span>
                  <span className="text-sm font-mono text-accent-cyan font-semibold">{user?.freefireUid || "Not Linked"}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-line">
                  <span className="text-xs font-mono text-text-muted">Phone number</span>
                  <span className="text-sm font-mono text-text-primary">{user?.phone || "Not Linked"}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-line">
                  <span className="text-xs font-mono text-text-muted">Age</span>
                  <span className="text-sm font-mono text-text-primary">{user?.age ? `${user.age} yrs` : "Not Provided"}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-xs font-mono text-text-muted">Primary language</span>
                  <span className="text-sm font-semibold text-accent-red">{user?.primaryLanguage || "Telugu"}</span>
                </div>
                <Button variant="ghost" size="sm" className="w-full mt-4" onClick={() => setEditing(true)}>
                  Edit Profile
                </Button>
              </div>
            )}
          </motion.div>

          {/* Current Team Status */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.06 }}
            className="card-angular p-6 space-y-4"
          >
            <CardHeader title="Current Team" subtitle="Squad membership and roster status" />

            <div className="text-center py-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-bg-elevated border border-line flex items-center justify-center mx-auto text-accent-red">
                <Users className="w-5 h-5" strokeWidth={2} />
              </div>
              <p className="text-text-secondary text-sm">You are currently not in a confirmed team roster.</p>
              <div className="flex justify-center gap-3 pt-2">
                <Link href="/teams"><Button variant="primary" size="sm">Create / Join Team</Button></Link>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Match History */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.12 }}
          className="card-angular p-6 space-y-4"
        >
          <CardHeader title="Match History" subtitle="Your recent tournament match performances" />
          <DataTable
            data={[]}
            columns={[
              { header: "Tournament", key: "tournament" },
              { header: "Match", key: "match" },
              { header: "Placement", key: "placement" },
              { header: "Kills", key: "kills" },
              { header: "Points", key: "points" },
            ]}
            emptyMessage="No match history found. Join a tournament to get started!"
          />
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
