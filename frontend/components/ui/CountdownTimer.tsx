"use client";
import { useState, useEffect } from "react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface CountdownTimerProps {
  targetDate: Date | string;
  label?: string;
  onEnd?: () => void;
}

function getTimeLeft(target: Date): TimeLeft {
  const diff = Math.max(0, target.getTime() - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

function TimeBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-bg-elevated border border-accent-red/30 px-3 py-2 min-w-[56px] text-center relative overflow-hidden">
        {/* scan line effect */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="w-full h-[1px] bg-accent-red/20 animate-scan-line" />
        </div>
        <span suppressHydrationWarning className="font-mono text-2xl font-bold text-accent-red tabular-nums glow-text-red">
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="font-display text-[9px] uppercase tracking-widest text-text-muted mt-1">{label}</span>
    </div>
  );
}

export function CountdownTimer({ targetDate, label, onEnd }: CountdownTimerProps) {
  const target = typeof targetDate === "string" ? new Date(targetDate) : targetDate;
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [ended, setEnded] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTimeLeft(getTimeLeft(target));
    const interval = setInterval(() => {
      const tl = getTimeLeft(target);
      setTimeLeft(tl);
      if (tl.days === 0 && tl.hours === 0 && tl.minutes === 0 && tl.seconds === 0) {
        setEnded(true);
        onEnd?.();
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (!mounted) {
    return (
      <div className="flex items-end gap-2 opacity-50">
        <TimeBox value={0} label="Days" />
        <span className="text-accent-red font-bold text-xl pb-6">:</span>
        <TimeBox value={0} label="Hrs" />
        <span className="text-accent-red font-bold text-xl pb-6">:</span>
        <TimeBox value={0} label="Min" />
        <span className="text-accent-red font-bold text-xl pb-6">:</span>
        <TimeBox value={0} label="Sec" />
      </div>
    );
  }

  if (ended) {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-red/20 border border-accent-red/40">
        <span className="w-2 h-2 rounded-full bg-accent-red animate-ping" />
        <span className="font-display font-bold text-accent-red uppercase tracking-widest text-sm">LIVE NOW</span>
      </div>
    );
  }

  return (
    <div>
      {label && (
        <p className="font-display text-xs text-text-secondary uppercase tracking-widest mb-3">{label}</p>
      )}
      <div className="flex items-end gap-2">
        <TimeBox value={timeLeft.days} label="Days" />
        <span className="text-accent-red font-bold text-xl pb-6">:</span>
        <TimeBox value={timeLeft.hours} label="Hrs" />
        <span className="text-accent-red font-bold text-xl pb-6">:</span>
        <TimeBox value={timeLeft.minutes} label="Min" />
        <span className="text-accent-red font-bold text-xl pb-6">:</span>
        <TimeBox value={timeLeft.seconds} label="Sec" />
      </div>
    </div>
  );
}
