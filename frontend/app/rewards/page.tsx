"use client";
import { motion } from "framer-motion";
import { Trophy, Wallet, Gift, Sparkles } from "lucide-react";
import { Footer } from "@/components/ui/Footer";

const perks = [
  { icon: Trophy, title: "Cash Prize Pools", body: "Every ranked tournament pays real INR prize pools direct to your captain's wallet." },
  { icon: Wallet, title: "Instant Payouts", body: "Verified UPI payouts processed within 48 hours of standings being finalized." },
  { icon: Gift, title: "Season Rewards", body: "Top squads each season unlock exclusive in-app badges and priority slot access." },
  { icon: Sparkles, title: "Merit Ranking", body: "Your TelArena rating carries across tournaments — consistency is rewarded." },
];

export default function RewardsPage() {
  return (
    <div className="min-h-screen pt-32 pb-16">
      <div className="max-w-container mx-auto px-6 lg:px-10">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p className="font-mono text-xs text-accent-cyan uppercase tracking-widest mb-3">Rewards</p>
          <h1 className="font-display font-semibold text-4xl sm:text-5xl text-text-primary tracking-tight mb-4">
            Compete for real prizes,<br className="hidden sm:block" /> not just clout.
          </h1>
          <p className="text-text-secondary text-lg max-w-xl">
            Every verified TelArena tournament pays out. Here&apos;s how rewards work across the platform.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-14">
          {perks.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="card-angular p-6"
            >
              <div className="w-11 h-11 rounded-xl bg-accent-red/10 flex items-center justify-center mb-4">
                <p.icon className="w-5 h-5 text-accent-red" strokeWidth={2} />
              </div>
              <h3 className="font-display font-semibold text-lg text-text-primary mb-2">{p.title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed">{p.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
