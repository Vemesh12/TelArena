import Link from "next/link";
import { Gamepad2 } from "lucide-react";

const footerLinks = [
  {
    title: "Platform",
    links: [
      { label: "Tournaments", href: "/tournaments" },
      { label: "Leaderboard", href: "/leaderboard" },
      { label: "Teams", href: "/teams" },
      { label: "Rewards", href: "/rewards" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Profile", href: "/profile" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "Verification", href: "/verify" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Discord", href: "#" },
      { label: "Instagram", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-bg-secondary border-t border-line mt-24">
      <div className="max-w-container mx-auto px-6 lg:px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-accent-red flex items-center justify-center">
                <Gamepad2 className="w-4 h-4 text-white" strokeWidth={2.25} />
              </div>
              <span className="font-display font-semibold text-base text-text-primary tracking-tight">
                TelArena
              </span>
            </div>
            <p className="text-text-muted text-sm leading-relaxed">
              India&apos;s verified BGMI &amp; Free Fire esports tournament platform.
            </p>
            <div className="flex items-center gap-2.5 mt-4">
              {["Discord", "Instagram", "YouTube"].map((s) => (
                <a key={s} href="#" className="w-8 h-8 rounded-lg bg-bg-elevated border border-line flex items-center justify-center text-text-muted hover:text-accent-red hover:border-accent-red/30 transition-all text-xs">
                  {s[0]}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4 className="font-mono text-xs uppercase tracking-widest text-text-secondary mb-4">{section.title}</h4>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-text-muted text-sm hover:text-text-primary transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-line flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-text-muted text-xs">© 2026 TelArena. All rights reserved.</p>
          <p className="text-text-muted text-xs font-mono tracking-wide">BUILT FOR COMPETITIVE PLAY</p>
        </div>
      </div>
    </footer>
  );
}
