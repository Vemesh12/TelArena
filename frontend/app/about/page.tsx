"use client";
import { motion } from "framer-motion";
import { ShieldCheck, Users, Trophy, Radio } from "lucide-react";
import { Footer } from "@/components/ui/Footer";

const pillars = [
  { icon: ShieldCheck, title: "Verified Identity", body: "Every player passes a multi-signal eligibility check before their first match." },
  { icon: Users, title: "Fair Matchmaking", body: "Balanced groups, transparent scoring configs, and audited match results." },
  { icon: Trophy, title: "Real Stakes", body: "Entry fees and prize pools handled with a full payout & dispute pipeline." },
  { icon: Radio, title: "Live Operations", body: "Room credentials, standings, and notifications update in real time." },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-32 pb-16">
      <div className="max-w-container mx-auto px-6 lg:px-10">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p className="font-mono text-xs text-accent-cyan uppercase tracking-widest mb-3">About TelArena</p>
          <h1 className="font-display font-semibold text-4xl sm:text-5xl text-text-primary tracking-tight mb-4 max-w-2xl">
            Built for competitors who take the game seriously.
          </h1>
          <p className="text-text-secondary text-lg max-w-xl">
            TelArena is a tournament operations platform for BGMI and Free Fire — from registration and identity
            verification through live match rooms, scoring, and payouts.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-14">
          {pillars.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="card-angular p-6"
            >
              <div className="w-11 h-11 rounded-xl bg-accent-cyan/10 flex items-center justify-center mb-4">
                <p.icon className="w-5 h-5 text-accent-cyan" strokeWidth={2} />
              </div>
              <h3 className="font-display font-semibold text-base text-text-primary mb-2">{p.title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed">{p.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
