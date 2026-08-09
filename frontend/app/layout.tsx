import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { NavBar } from "@/components/ui/NavBar";
import { ToastProvider } from "@/components/ui/Toast";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk", weight: ["500", "600", "700"] });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono", weight: ["400", "500", "600"] });

export const metadata: Metadata = {
  title: "TelArena — India's Premier Esports Tournament Platform",
  description: "Compete in verified BGMI & Free Fire tournaments. Register, verify, build your team, and win real prize pools with TelArena.",
  keywords: ["BGMI", "Free Fire", "esports", "tournament", "TelArena", "gaming", "India"],
  openGraph: {
    title: "TelArena — India's Premier Esports Tournament Platform",
    description: "Compete in verified BGMI & Free Fire tournaments. Register now.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-bg-primary text-text-primary font-body min-h-screen">
        <ToastProvider>
          <NavBar />
          <main>{children}</main>
        </ToastProvider>
      </body>
    </html>
  );
}
