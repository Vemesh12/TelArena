"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { KeyRound, Copy, Check, Info, Lock, Clock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useSocket } from "@/hooks/useSocket";

interface RoomReleaseTimerProps {
  roomId?: string;
  roomCode?: string;
  password?: string;
  scheduledAt?: string;
  releaseMinutes?: number;
  slotNo?: number;
  map?: string;
}

export function RoomReleaseTimer({
  roomId,
  roomCode,
  password,
  scheduledAt,
  releaseMinutes = 15,
  slotNo,
  map,
}: RoomReleaseTimerProps) {
  const toast = useToast();
  const { subscribeToRoom } = useSocket();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const [liveCode, setLiveCode] = useState(roomCode);
  const [livePass, setLivePass] = useState(password);
  const [liveMap, setLiveMap] = useState(map);

  useEffect(() => {
    setLiveCode(roomCode);
    setLivePass(password);
    setLiveMap(map);
  }, [roomCode, password, map]);

  useEffect(() => {
    if (!roomId) return;
    const unsub = subscribeToRoom(roomId, (data: any) => {
      if (data?.roomCode) setLiveCode(data.roomCode);
      if (data?.password) setLivePass(data.password);
      if (data?.map) setLiveMap(data.map);
      toast.info("Room Released!", "Match room credentials have been unlocked live.");
    });
    return () => {
      if (typeof unsub === "function") unsub();
    };
  }, [roomId, subscribeToRoom]);

  const calculateRemaining = () => {
    if (!scheduledAt) {
      return { hours: 0, mins: 0, secs: 0, isReleased: Boolean(liveCode && livePass) };
    }
    const matchTime = new Date(scheduledAt).getTime();
    const releaseTime = matchTime - releaseMinutes * 60 * 1000;
    const diff = releaseTime - Date.now();
    if (diff <= 0) {
      return { hours: 0, mins: 0, secs: 0, isReleased: true };
    }
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);
    return { hours, mins, secs, isReleased: false };
  };

  const [timeState, setTimeState] = useState(calculateRemaining);

  useEffect(() => {
    setTimeState(calculateRemaining());
    const timer = setInterval(() => {
      setTimeState(calculateRemaining());
    }, 1000);
    return () => clearInterval(timer);
  }, [scheduledAt, releaseMinutes, liveCode, livePass]);

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

  const isReleased = timeState.isReleased || Boolean(liveCode && livePass);

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
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isReleased ? 'bg-status-success' : 'bg-accent-amber'} opacity-60`} />
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isReleased ? 'bg-status-success' : 'bg-accent-amber'}`} />
          </span>
          <h4 className="font-display font-semibold text-base text-text-primary flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-accent-cyan" /> Match Room Credentials
          </h4>
        </div>
        <div className="flex items-center gap-2">
          {liveMap && (
            <span className="font-mono text-xs text-text-secondary bg-bg-elevated px-2.5 py-1 rounded-md border border-line">
              Map: {liveMap}
            </span>
          )}
          {slotNo !== undefined && (
            <div className="font-mono text-xs text-accent-cyan bg-accent-cyan/10 px-3 py-1.5 rounded-lg border border-accent-cyan/25 font-medium">
              Your slot: #{slotNo}
            </div>
          )}
        </div>
      </div>

      {!isReleased ? (
        <div className="text-center py-6 space-y-2">
          <div className="flex items-center justify-center gap-2 text-accent-amber text-xs font-mono uppercase tracking-widest">
            <Lock className="w-3.5 h-3.5" /> Room credentials locked
          </div>
          <div className="font-mono text-4xl font-semibold text-accent-red tracking-wider tabular-nums">
            {timeState.hours > 0 ? `${String(timeState.hours).padStart(2, "0")}:` : ""}
            {String(timeState.mins).padStart(2, "0")}:{String(timeState.secs).padStart(2, "0")}
          </div>
          <p className="text-xs text-text-secondary">
            Room ID &amp; passcode unlock automatically {releaseMinutes} minutes before match start.
          </p>
        </div>
      ) : liveCode && livePass ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-bg-primary border border-line flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono text-text-muted block mb-1">Custom Room ID</span>
                <span className="font-mono text-xl text-accent-cyan font-semibold tracking-widest">
                  {liveCode}
                </span>
              </div>
              <Button variant="secondary" size="sm" onClick={() => copyToClipboard(liveCode, "code")}>
                {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>

            <div className="p-4 rounded-xl bg-bg-primary border border-line flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono text-text-muted block mb-1">Room Password</span>
                <span className="font-mono text-xl text-accent-red font-semibold tracking-widest">
                  {showPass ? livePass : "••••••••"}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPass(!showPass)}
                  aria-label={showPass ? "Hide password" : "Show password"}
                  className="px-2"
                >
                  {showPass ? <EyeOff className="w-4 h-4 text-text-muted" /> : <Eye className="w-4 h-4 text-text-muted" />}
                </Button>
                <Button variant="secondary" size="sm" onClick={() => copyToClipboard(livePass, "pass")}>
                  {copiedPass ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>

          {slotNo !== undefined && (
            <div className="p-3 rounded-lg bg-accent-cyan/10 border border-accent-cyan/25 text-xs text-accent-cyan font-mono flex items-start gap-2">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <span>All squad members must join the Free Fire custom lobby in <strong>Slot #{slotNo}</strong>. Joining the wrong slot results in immediate match disqualification.</span>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-5 space-y-2">
          <div className="inline-flex p-2.5 rounded-full bg-accent-cyan/10 border border-accent-cyan/25 text-accent-cyan mb-1">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
          <h5 className="font-display font-semibold text-sm text-text-primary">Lobby Creation in Progress</h5>
          <p className="text-xs text-text-secondary max-w-md mx-auto">
            The release window is open. Match referees are generating the custom room in Free Fire. Room code and password will appear momentarily.
          </p>
        </div>
      )}
    </motion.div>
  );
}
