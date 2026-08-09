"use client";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

interface StatCalloutProps {
  value: number | string;
  label: string;
  prefix?: string;
  suffix?: string;
  color?: "red" | "cyan" | "gold";
  animate?: boolean;
  className?: string;
}

export function StatCallout({ value, label, prefix, suffix, color = "red", animate = true, className }: StatCalloutProps) {
  const [displayed, setDisplayed] = useState(0);
  const isNumeric = typeof value === "number";
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!animate || !isNumeric) return;
    let start = 0;
    const end = value as number;
    const duration = 1200;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setDisplayed(end); clearInterval(timer); }
      else setDisplayed(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [value]);

  const colorClass =
    color === "red" ? "text-accent-red glow-text-red" :
    color === "cyan" ? "text-accent-cyan glow-text-cyan" :
    "text-rank-gold";

  const glowClass =
    color === "red" ? "glow-red" :
    color === "cyan" ? "glow-cyan" :
    "shadow-[0_0_20px_rgba(255,215,0,0.3)]";

  return (
    <div
      ref={ref}
      className={cn(
        "relative card-angular p-6 text-center overflow-hidden",
        className,
      )}
    >
      {/* Top accent line */}
      <div className={cn("absolute top-0 left-0 right-0 h-[2px]",
        color === "red" ? "bg-accent-red" : color === "cyan" ? "bg-accent-cyan" : "bg-rank-gold")} />
      
      <div className={cn("font-display text-4xl font-black tabular-nums", colorClass)}>
        {prefix && <span className="text-2xl">{prefix}</span>}
        {animate && isNumeric ? displayed.toLocaleString() : String(value)}
        {suffix && <span className="text-2xl">{suffix}</span>}
      </div>
      <div className="font-body text-text-secondary text-xs uppercase tracking-widest mt-2">{label}</div>
    </div>
  );
}
