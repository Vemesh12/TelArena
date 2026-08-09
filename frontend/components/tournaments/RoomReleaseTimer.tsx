"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { KeyRound, Copy, Check, Info } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

interface RoomReleaseTimerProps {
  roomCode?: string;
  password?: string;
  scheduledAt?: string;
  releaseMinutes?: number;
  slotNo?: number;
}

export function RoomReleaseTimer({
  roomCode = "TEL-849201",
  password = "4910",
  scheduledAt,
  releaseMinutes = 15,
  slotNo = 3,
}: RoomReleaseTimerProps) {
  const toast = useToast();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);

  const [timeLeft, setTimeLeft] = useState<{ mins: number; secs: number }>({ mins: 12, secs: 45 });
  const [released, setReleased] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.secs > 0) return { ...prev, secs: prev.secs - 1 };
        if (prev.mins > 0) return { mins: prev.mins - 1, secs: 59 };
        setReleased(true);
        return { mins: 0, secs: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const copyToClipboard = (text: string, type: "code" | "pass") => {
    navigator.clipboard.writeText(text);
    if (type === "code") {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
      toast.success("Copied", `Room ID ${text} copied to clipboard.`);
    } else {
      setCopiedPass(true);
      setTimeout(() => setCopiedPass(false), 2000);
      toast.success("Copied", `Password ${text} copied to clipboard.`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="card-angular-cyan p-6 space-y-4"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-line pb-4">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-success opacity-60" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-status-success" />
          </span>
          <h4 className="font-display font-semibold text-base text-text-primary flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-accent-cyan" /> Match Room Credentials
          </h4>
        </div>
        <div className="font-mono text-xs text-accent-cyan bg-accent-cyan/10 px-3 py-1.5 rounded-lg border border-accent-cyan/25 font-medium">
          Your slot: #{slotNo}
        </div>
      </div>

      {!released ? (
        <div className="text-center py-6 space-y-2">
          <span className="text-xs font-mono text-text-muted uppercase tracking-widest block">
            Room code releases in
          </span>
          <div className="font-mono text-4xl font-semibold text-accent-red tracking-wider tabular-nums">
            {String(timeLeft.mins).padStart(2, "0")}:{String(timeLeft.secs).padStart(2, "0")}
          </div>
          <p className="text-xs text-text-secondary">
            Room ID &amp; passcode unlock automatically {releaseMinutes} minutes before match start.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-bg-primary border border-line flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono text-text-muted block mb-1">Custom Room ID</span>
                <span className="font-mono text-xl text-accent-cyan font-semibold tracking-widest">
                  {roomCode}
                </span>
              </div>
              <Button variant="secondary" size="sm" onClick={() => copyToClipboard(roomCode, "code")}>
                {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>

            <div className="p-4 rounded-xl bg-bg-primary border border-line flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono text-text-muted block mb-1">Room Password</span>
                <span className="font-mono text-xl text-accent-red font-semibold tracking-widest">
                  {password}
                </span>
              </div>
              <Button variant="secondary" size="sm" onClick={() => copyToClipboard(password, "pass")}>
                {copiedPass ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-accent-cyan/10 border border-accent-cyan/25 text-xs text-accent-cyan font-mono flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <span>All squad members must join the lobby in <strong>Slot #{slotNo}</strong>. Joining the wrong slot results in immediate match disqualification.</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
