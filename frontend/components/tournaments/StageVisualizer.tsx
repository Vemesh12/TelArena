"use client";
import React from "react";
import { motion } from "framer-motion";
import { Trophy, ChevronRight, Zap } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

interface StageItem {
  id: string;
  name: string;
  status: "completed" | "active" | "upcoming";
  teamsCount: number;
  dateStr: string;
  advancement: string;
}

interface StageVisualizerProps {
  stages?: StageItem[];
  activeStageId?: string;
}

const defaultStages: StageItem[] = [
  {
    id: "stage_q1",
    name: "Open Qualifiers (48 Squads)",
    status: "completed",
    teamsCount: 48,
    dateStr: "Jul 15 – Jul 18",
    advancement: "Top 24 teams advance to Group Stage",
  },
  {
    id: "stage_g1",
    name: "Group Stage (Groups A–D)",
    status: "active",
    teamsCount: 24,
    dateStr: "Jul 20 – Jul 24",
    advancement: "Top 12 teams advance to Grand Finals",
  },
  {
    id: "stage_f1",
    name: "Grand Finals (12 Squads)",
    status: "upcoming",
    teamsCount: 12,
    dateStr: "Jul 26 – Jul 28",
    advancement: "₹50,000 prize pool distribution",
  },
];

export function StageVisualizer({ stages = defaultStages }: StageVisualizerProps) {
  return (
    <div className="card-angular p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-4">
        <div>
          <h3 className="font-display font-semibold text-base text-text-primary flex items-center gap-2">
            <Trophy className="w-4 h-4 text-accent-red" /> Stage Progression
          </h3>
          <p className="text-xs text-text-secondary mt-1">
            Squad qualification and advancement rules from qualifiers to finals
          </p>
        </div>
        <Badge variant="live">Live Progression</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
        {stages.map((stg, idx) => {
          const isCompleted = stg.status === "completed";
          const isActive = stg.status === "active";

          return (
            <motion.div
              key={stg.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: idx * 0.08 }}
              className={cn(
                "relative p-5 rounded-xl border transition-all",
                isActive
                  ? "bg-bg-card border-accent-red/40 shadow-glow-red"
                  : isCompleted
                  ? "bg-bg-elevated border-accent-cyan/20 opacity-90"
                  : "bg-bg-primary border-line opacity-60",
              )}
            >
              {idx < stages.length - 1 && (
                <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 items-center justify-center w-6 h-6 rounded-full bg-bg-elevated border border-line">
                  <ChevronRight className="w-3.5 h-3.5 text-accent-cyan" />
                </div>
              )}

              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[11px] text-text-muted">Stage 0{idx + 1}</span>
                <Badge variant={isCompleted ? "verified" : isActive ? "live" : "pending"}>
                  {stg.status}
                </Badge>
              </div>

              <h4 className="font-display font-semibold text-sm text-text-primary">
                {stg.name}
              </h4>

              <div className="mt-4 space-y-2 font-mono text-xs text-text-secondary border-t border-line pt-3">
                <div className="flex justify-between">
                  <span className="text-text-muted">Teams</span>
                  <span className="text-accent-cyan font-medium">{stg.teamsCount} squads</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Schedule</span>
                  <span className="text-text-primary">{stg.dateStr}</span>
                </div>
                <div className="mt-2 flex items-start gap-1.5 text-[11px] text-accent-red bg-accent-red/10 rounded-lg p-2 border border-accent-red/15">
                  <Zap className="w-3.5 h-3.5 shrink-0 mt-px" />
                  {stg.advancement}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
