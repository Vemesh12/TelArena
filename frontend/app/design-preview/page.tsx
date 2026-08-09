"use client";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge, LiveBadge, VerifiedBadge, PendingBadge, RejectedBadge, UpcomingBadge } from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import { CountdownTimer } from "@/components/ui/CountdownTimer";
import { StatCallout } from "@/components/ui/StatCallout";
import { DataTable } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { Footer } from "@/components/ui/Footer";

const sampleData = [
  { rank: 1, team: "Hyderabad Hawks", tag: "HHK", kills: 42, pts: 128 },
  { rank: 2, team: "Vizag Vipers", tag: "VVP", kills: 38, pts: 114 },
  { rank: 3, team: "Warangal Warriors", tag: "WWR", kills: 31, pts: 95 },
  { rank: 4, team: "Nellore Ninjas", tag: "NNJ", kills: 25, pts: 78 },
];

export default function DesignPreviewPage() {
  const toast = useToast();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="min-h-screen pt-32 pb-16">
      <div className="max-w-container mx-auto px-6 lg:px-10 space-y-12">
        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-accent-red/10 border border-accent-red/30 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-accent-red" />
            <span className="font-display text-xs text-accent-red">Design System Preview</span>
          </div>
          <h1 className="font-display font-semibold tracking-tight text-4xl lg:text-5xl text-text-primary">
            TelArena UI Components
          </h1>
          <p className="font-body text-text-secondary text-sm mt-2 max-w-xl">
            Internal reference showcasing every reusable primitive, color, and typography treatment in the current design system.
          </p>
        </div>

        {/* Buttons */}
        <Card>
          <CardHeader title="Buttons" subtitle="Primary, secondary, and ghost variants across sizes" />
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="primary" onClick={() => toast.success("Action Triggered", "Primary button clicked")}>
              Primary
            </Button>
            <Button variant="secondary" onClick={() => toast.info("Secondary", "Secondary button clicked")}>
              Secondary
            </Button>
            <Button variant="ghost" onClick={() => toast.error("Ghost", "Ghost button clicked")}>
              Ghost
            </Button>
            <Button variant="primary" loading>Loading</Button>
            <Button variant="primary" disabled>Disabled</Button>
          </div>
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Button variant="primary" size="sm">Small</Button>
            <Button variant="primary" size="md">Medium</Button>
            <Button variant="primary" size="lg">Large</Button>
          </div>
        </Card>

        {/* Badges */}
        <Card>
          <CardHeader title="Badges" subtitle="Status indicators used across the tournament lifecycle" />
          <div className="flex flex-wrap items-center gap-4">
            <LiveBadge />
            <VerifiedBadge />
            <PendingBadge />
            <RejectedBadge />
            <UpcomingBadge />
            <Badge variant="default">Default</Badge>
          </div>
        </Card>

        {/* Card */}
        <Card>
          <CardHeader title="Card" subtitle="Standard container used for panels, tables, and grouped content" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card variant="angular" hover>
              <p className="font-display font-semibold text-text-primary text-sm">Angular</p>
              <p className="font-body text-text-secondary text-xs mt-1">Default card style, hoverable.</p>
            </Card>
            <Card variant="cyan">
              <p className="font-display font-semibold text-text-primary text-sm">Cyan Accent</p>
              <p className="font-body text-text-secondary text-xs mt-1">Used for highlighted or informational panels.</p>
            </Card>
            <Card variant="standard">
              <p className="font-display font-semibold text-text-primary text-sm">Standard</p>
              <p className="font-body text-text-secondary text-xs mt-1">Minimal bordered container.</p>
            </Card>
          </div>
        </Card>

        {/* Stat Callouts */}
        <Card>
          <CardHeader title="Stat Callouts" subtitle="Large animated metrics for prize pools and player counts" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCallout value={100000} prefix="₹" label="Total Prize Pool" color="red" />
            <StatCallout value={2048} label="Registered Players" color="cyan" />
            <StatCallout value={48} label="Teams Confirmed" color="gold" />
          </div>
        </Card>

        {/* Countdown */}
        <Card>
          <CardHeader title="Countdown Timer" subtitle="Room release and tournament start countdowns" />
          <CountdownTimer targetDate={new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)} label="Room Release Countdown" />
        </Card>

        {/* Data Table */}
        <Card>
          <CardHeader title="Data Table" subtitle="Standings, leaderboards, and admin tables with rank highlights" />
          <DataTable
            title="Stage 1 Standings"
            data={sampleData}
            columns={[
              { header: "Rank", key: "rank", render: (r) => <span className="font-display font-bold">#{r.rank}</span> },
              { header: "Team Name", key: "team", render: (r) => <span className="font-body font-medium">{r.team} ({r.tag})</span> },
              { header: "Kills", key: "kills", render: (r) => <span className="font-mono text-accent-cyan">{r.kills}</span> },
              { header: "Total Points", key: "pts", render: (r) => <span className="font-mono text-accent-red font-bold">{r.pts}</span> },
            ]}
            onExportCsv={() => toast.info("Exporting CSV", "Sample leaderboard exported")}
          />
        </Card>

        {/* Modal & Toast */}
        <Card>
          <CardHeader title="Modal & Toast" subtitle="Dialog and notification patterns" />
          <div className="flex gap-4">
            <Button variant="secondary" onClick={() => setModalOpen(true)}>Open Demo Modal</Button>
            <Button variant="ghost" onClick={() => toast.success("Toast Notification", "This is an in-app toast notice.")}>
              Trigger Toast
            </Button>
          </div>
        </Card>

        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Demo Modal Window">
          <div className="space-y-4">
            <p className="font-body text-text-secondary text-sm">
              This is the standard modal used for match evidence submission, dispute forms, and captain actions.
            </p>
            <div className="flex justify-end gap-3 pt-4 border-t border-line">
              <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={() => { setModalOpen(false); toast.success("Confirmed"); }}>
                Confirm Action
              </Button>
            </div>
          </div>
        </Modal>
      </div>

      <Footer />
    </div>
  );
}
