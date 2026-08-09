"use client";
import { motion } from "framer-motion";

// Abstract "battle-royale drop zone" visual — a shrinking storm-circle radar,
// landing markers, and a slow radar sweep. No game IP, pure geometry.
export function HeroVisual({ className }: { className?: string }) {
  return (
    <div className={className} aria-hidden="true">
      <svg viewBox="0 0 640 640" className="w-full h-full overflow-visible">
        <defs>
          <radialGradient id="zoneGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00D4FF" stopOpacity="0.16" />
            <stop offset="70%" stopColor="#00D4FF" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#00D4FF" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="redGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#EF2D56" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#EF2D56" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="sweepFade" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00D4FF" stopOpacity="0" />
            <stop offset="100%" stopColor="#00D4FF" stopOpacity="0.35" />
          </linearGradient>
        </defs>

        {/* ambient glow field */}
        <circle cx="320" cy="320" r="300" fill="url(#zoneGlow)" />
        <circle cx="420" cy="180" r="160" fill="url(#redGlow)" />

        {/* topographic contour rings (static, map-like) */}
        {[280, 230, 180].map((r, i) => (
          <circle
            key={r}
            cx="320" cy="320" r={r}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={1}
            strokeDasharray={i === 1 ? "2 6" : undefined}
          />
        ))}

        {/* shrinking storm circle — outer boundary, slow pulse */}
        <motion.circle
          cx="320" cy="320" r="240"
          fill="none"
          stroke="#00D4FF"
          strokeOpacity={0.3}
          strokeWidth={1.5}
          animate={{ r: [240, 250, 240], opacity: [0.3, 0.15, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* inner safe zone — the "current" circle, breathing */}
        <motion.circle
          cx="340" cy="300" r="120"
          fill="none"
          stroke="#EF2D56"
          strokeWidth={2}
          strokeOpacity={0.55}
          animate={{ r: [120, 112, 120] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* radar sweep */}
        <motion.g
          style={{ transformOrigin: "320px 320px" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
        >
          <path d="M320 320 L320 80 A240 240 0 0 1 470 152 Z" fill="url(#sweepFade)" opacity={0.5} />
          <line x1="320" y1="320" x2="320" y2="80" stroke="#00D4FF" strokeOpacity={0.5} strokeWidth={1.5} />
        </motion.g>

        {/* landing / squad markers */}
        {[
          { x: 250, y: 260 }, { x: 400, y: 340 }, { x: 360, y: 220 },
          { x: 300, y: 380 }, { x: 420, y: 260 },
        ].map((p, i) => (
          <g key={i}>
            <motion.circle
              cx={p.x} cy={p.y} r={4}
              fill={i === 0 ? "#EF2D56" : "#00D4FF"}
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.3, ease: "easeInOut" }}
            />
            <motion.circle
              cx={p.x} cy={p.y} r={4}
              fill="none"
              stroke={i === 0 ? "#EF2D56" : "#00D4FF"}
              strokeWidth={1}
              animate={{ r: [4, 22], opacity: [0.6, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.3, ease: "easeOut" }}
            />
          </g>
        ))}

        {/* parachute drop trails */}
        {[
          { x1: 220, y1: 40, x2: 260, y2: 250 },
          { x1: 460, y1: 20, x2: 410, y2: 210 },
        ].map((l, i) => (
          <motion.line
            key={i}
            x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
            stroke="#A1A1AA"
            strokeWidth={1}
            strokeDasharray="3 5"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.35, 0.35, 0] }}
            transition={{ duration: 5, repeat: Infinity, delay: i * 1.6, ease: "easeInOut" }}
          />
        ))}
      </svg>
    </div>
  );
}
