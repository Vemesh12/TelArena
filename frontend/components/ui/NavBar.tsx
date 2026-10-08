"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Menu, X, ChevronDown, User, LayoutDashboard, ShieldCheck, LogOut, Gamepad2,
  Eye, EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useSocket } from "@/hooks/useSocket";
import { useToast } from "./Toast";
import { Button } from "./Button";
import { Modal } from "./Modal";
import { api } from "@/lib/api";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/tournaments", label: "Tournaments" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/teams", label: "Teams" },
  { href: "/rewards", label: "Rewards" },
  { href: "/about", label: "About" },
];

export function NavBar() {
  const pathname = usePathname();
  const { user, logout, isLoading, refetch } = useAuth();
  const { isConnected, subscribeToPlayerNotifications } = useSocket();
  const toast = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Auth Modal State
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");

  // Mobile Login Form State
  const [loginPhone, setLoginPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Mobile Sign Up Form State
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regUsername, setRegUsername] = useState("");
  const [regFullName, setRegFullName] = useState("");
  const [regFreefireUid, setRegFreefireUid] = useState("");
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState("");

  useEffect(() => {
    if (!user?.id) return;
    const unsubscribe = subscribeToPlayerNotifications(user.id, (notif: any) => {
      toast.info(notif.title || "Notification", notif.body || "You have a new alert.");
      refetch();
    });
    return () => unsubscribe();
  }, [user?.id, subscribeToPlayerNotifications]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  const openAuthModal = (tab: "login" | "signup") => {
    setAuthTab(tab);
    setLoginError("");
    setRegError("");
    setLoginModalOpen(true);
  };

  const handleMobileLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginPhone) {
      setLoginError("Please enter your mobile number or username");
      return;
    }
    setLoginLoading(true);
    setLoginError("");
    try {
      const res = await api.loginMobile(loginPhone, loginPassword);
      await refetch();
      setLoginModalOpen(false);
      const userRole = res?.player?.role;
      window.location.href = userRole === "admin" || userRole === "super_admin" ? "/admin" : "/dashboard";
    } catch (err: any) {
      setLoginError(err.message || "Login failed. Check mobile number & password.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regPhone || !regPassword || !regUsername) {
      setRegError("Please complete all required fields (Mobile, Password, Username)");
      return;
    }
    setRegLoading(true);
    setRegError("");
    try {
      await api.register({
        phone: regPhone,
        password: regPassword,
        discordUsername: regUsername,
        fullName: regFullName || regUsername,
        freefireUid: regFreefireUid,
      });
      await refetch();
      setLoginModalOpen(false);
      window.location.href = "/dashboard";
    } catch (err: any) {
      setRegError(err.message || "Registration failed. Try a different mobile number or username.");
    } finally {
      setRegLoading(false);
    }
  };

  const autofillCredentials = (phone: string, pass: string) => {
    setLoginPhone(phone);
    setLoginPassword(pass);
  };

  const isAdminRole = user?.role === "admin" || user?.role === "super_admin" || user?.role === "moderator";

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-colors duration-300",
        scrolled ? "bg-bg-primary/80 backdrop-blur-xl border-b border-line" : "bg-transparent border-b border-transparent",
      )}
    >
      <div className="max-w-container mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-accent-red flex items-center justify-center">
              <Gamepad2 className="w-5 h-5 text-white" strokeWidth={2.25} />
            </div>
            <span className="font-display font-semibold text-xl text-text-primary tracking-tight">
              TelArena
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative px-4 py-2 rounded-lg font-body text-sm font-medium transition-colors duration-150",
                    isActive ? "text-text-primary bg-white/[0.06]" : "text-text-secondary hover:text-text-primary hover:bg-white/[0.04]",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
            {isAdminRole && (
              <Link
                href="/admin"
                className={cn(
                  "relative px-4 py-2 rounded-lg font-body text-sm font-medium transition-colors duration-150",
                  pathname.startsWith("/admin") ? "text-accent-cyan bg-accent-cyan/10" : "text-accent-cyan/80 hover:text-accent-cyan hover:bg-accent-cyan/5",
                )}
              >
                Admin
              </Link>
            )}
          </div>

          {/* Auth / Profile */}
          <div className="hidden lg:flex items-center gap-3">
            {isLoading ? (
              <div className="w-9 h-9 rounded-full bg-bg-elevated animate-pulse" />
            ) : user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 group px-2 py-1.5 rounded-lg hover:bg-white/[0.04] transition-colors"
                >
                  {user.discordAvatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.discordAvatar} alt={user.discordUsername} className="w-8 h-8 rounded-full border border-line" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-accent-red flex items-center justify-center text-white text-xs font-semibold">
                      {user.discordUsername?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <span className="text-text-secondary text-sm font-medium max-w-[110px] truncate">{user.discordUsername}</span>
                  <ChevronDown className={cn("w-4 h-4 text-text-muted transition-transform", dropdownOpen && "rotate-180")} />
                </button>
                <AnimatePresence>
                  {dropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-bg-elevated border border-line shadow-card-hover overflow-hidden z-50"
                      >
                        <Link href="/profile" className="flex items-center gap-2.5 px-4 py-3 text-sm text-text-secondary hover:text-text-primary hover:bg-white/[0.04] transition-colors">
                          <User className="w-4 h-4" /> Profile
                        </Link>
                        {isAdminRole ? (
                          <Link href="/admin" className="flex items-center gap-2.5 px-4 py-3 text-sm text-accent-cyan hover:bg-accent-cyan/5 transition-colors font-medium">
                            <ShieldCheck className="w-4 h-4" /> Admin Control Panel
                          </Link>
                        ) : (
                          <Link href="/dashboard" className="flex items-center gap-2.5 px-4 py-3 text-sm text-text-secondary hover:text-text-primary hover:bg-white/[0.04] transition-colors">
                            <LayoutDashboard className="w-4 h-4" /> Player Dashboard
                          </Link>
                        )}
                        <hr className="border-line" />
                        <button onClick={() => { logout(); setDropdownOpen(false); }} className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-accent-red hover:bg-accent-red/10 transition-colors">
                          <LogOut className="w-4 h-4" /> Logout
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => openAuthModal("login")}>
                  Login
                </Button>
                <Button variant="primary" size="sm" onClick={() => openAuthModal("signup")}>
                  Sign Up
                </Button>
              </div>
            )}
            <div className="flex items-center gap-1.5 pl-3 ml-1 border-l border-line">
              <span className={cn("w-1.5 h-1.5 rounded-full", isConnected ? "bg-status-success" : "bg-status-warning")} />
              <span className="text-[11px] font-mono text-text-muted">{isConnected ? "LIVE" : "OFFLINE"}</span>
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden text-text-secondary p-2 -mr-2 rounded-lg hover:bg-white/[0.04] transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="lg:hidden bg-bg-primary/95 backdrop-blur-xl border-t border-line overflow-hidden"
          >
            <div className="px-4 py-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-3 py-3.5 font-body text-sm font-medium text-text-secondary hover:text-text-primary border-b border-line/60"
                >
                  {link.label}
                </Link>
              ))}
              {user && isAdminRole ? (
                <Link href="/admin" className="block px-3 py-3.5 font-body text-sm font-semibold text-accent-cyan border-b border-line/60">
                  Admin Control Panel
                </Link>
              ) : user ? (
                <Link href="/dashboard" className="block px-3 py-3.5 font-body text-sm font-semibold text-accent-red border-b border-line/60">
                  Player Dashboard
                </Link>
              ) : null}
              {!user ? (
                <div className="py-4 flex gap-2">
                  <Button variant="ghost" className="flex-1" onClick={() => openAuthModal("login")}>
                    Login
                  </Button>
                  <Button variant="primary" className="flex-1" onClick={() => openAuthModal("signup")}>
                    Sign Up
                  </Button>
                </div>
              ) : (
                <button onClick={() => logout()} className="w-full flex items-center gap-2.5 py-4 text-sm text-accent-red">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile & Password Auth Modal */}
      <Modal open={loginModalOpen} onClose={() => setLoginModalOpen(false)} title="Sign in to TelArena" size="md">
        <div className="space-y-6">
          {/* Discord OAuth Login Banner */}
          <div className="bg-bg-elevated rounded-xl p-4 border border-[#5865F2]/30 text-center space-y-2">
            <span className="font-body text-xs text-text-secondary block font-medium">
              Instant one-click Discord login
            </span>
            <a
              href={api.getDiscordLoginUrl()}
              className="w-full inline-flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg bg-[#5865F2] hover:bg-[#4752C4] text-white font-body text-sm font-medium transition-all"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              Continue with Discord
            </a>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-line" /></div>
            <span className="relative bg-bg-card px-4 font-body text-[11px] text-text-muted uppercase tracking-wider">Or mobile login</span>
          </div>

          {/* Tab Switcher */}
          <div className="flex p-1 rounded-lg bg-bg-elevated border border-line gap-1">
            <button
              onClick={() => setAuthTab("login")}
              className={`flex-1 py-2 rounded-md font-body text-sm font-medium transition-all ${
                authTab === "login" ? "bg-white/[0.08] text-text-primary" : "text-text-muted hover:text-text-secondary"
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => setAuthTab("signup")}
              className={`flex-1 py-2 rounded-md font-body text-sm font-medium transition-all ${
                authTab === "signup" ? "bg-white/[0.08] text-text-primary" : "text-text-muted hover:text-text-secondary"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* TAB 1: MOBILE LOGIN FORM */}
          {authTab === "login" && (
            <form onSubmit={handleMobileLogin} className="space-y-4">
              {loginError && (
                <div className="p-3 rounded-lg bg-accent-red/10 border border-accent-red/30 text-xs text-accent-red">
                  {loginError}
                </div>
              )}

              <div>
                <label className="block text-xs font-body text-text-muted mb-1.5">Mobile number or username</label>
                <input
                  type="text"
                  required
                  value={loginPhone}
                  onChange={(e) => setLoginPhone(e.target.value)}
                  placeholder="e.g. 9999900001 or admin_test"
                  className="w-full bg-bg-primary border border-line rounded-lg px-4 py-2.5 text-sm text-text-primary font-mono outline-none focus:border-accent-red transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-body text-text-muted mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-bg-primary border border-line rounded-lg pl-4 pr-11 py-2.5 text-sm text-text-primary font-mono outline-none focus:border-accent-red transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors p-1"
                    aria-label={showLoginPassword ? "Hide password" : "Show password"}
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button variant="primary" type="submit" loading={loginLoading} className="w-full py-3">
                Log In
              </Button>

              {/* Seeded Credentials Reference Guide (Development Only) */}
              {process.env.NODE_ENV === "development" && (
                <div className="mt-6 pt-4 border-t border-line space-y-2">
                  <span className="font-body font-medium text-[11px] text-text-secondary uppercase tracking-wide block">
                    Test credentials (click to autofill)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                    <button type="button" onClick={() => autofillCredentials("9999900000", "admin123")} className="p-2.5 rounded-lg bg-bg-elevated hover:bg-white/[0.06] border border-line text-left transition-colors">
                      <span className="text-rank-gold font-semibold block">Super Admin</span>
                      <span className="text-text-muted">9999900000 / admin123</span>
                    </button>
                    <button type="button" onClick={() => autofillCredentials("9999900001", "admin123")} className="p-2.5 rounded-lg bg-bg-elevated hover:bg-white/[0.06] border border-line text-left transition-colors">
                      <span className="text-accent-red font-semibold block">System Admin</span>
                      <span className="text-text-muted">9999900001 / admin123</span>
                    </button>
                    <button type="button" onClick={() => autofillCredentials("9876543210", "captain123")} className="p-2.5 rounded-lg bg-bg-elevated hover:bg-white/[0.06] border border-line text-left transition-colors">
                      <span className="text-accent-cyan font-semibold block">Squad Captain</span>
                      <span className="text-text-muted">9876543210 / captain123</span>
                    </button>
                    <button type="button" onClick={() => autofillCredentials("9999900002", "mod123")} className="p-2.5 rounded-lg bg-bg-elevated hover:bg-white/[0.06] border border-line text-left transition-colors">
                      <span className="text-text-primary font-semibold block">Moderator</span>
                      <span className="text-text-muted">9999900002 / mod123</span>
                    </button>
                    <button type="button" onClick={() => autofillCredentials("9555544444", "player123")} className="p-2.5 rounded-lg bg-bg-elevated hover:bg-white/[0.06] border border-line text-left transition-colors sm:col-span-2">
                      <span className="text-text-primary font-semibold block">Standard Player</span>
                      <span className="text-text-muted">9555544444 / player123</span>
                    </button>
                  </div>
                </div>
              )}
            </form>
          )}

          {/* TAB 2: MOBILE SIGN UP FORM */}
          {authTab === "signup" && (
            <form onSubmit={handleSignUp} className="space-y-4">
              {regError && (
                <div className="p-3 rounded-lg bg-accent-red/10 border border-accent-red/30 text-xs text-accent-red">
                  {regError}
                </div>
              )}

              <div>
                <label className="block text-xs font-body text-text-muted mb-1.5">Mobile phone number</label>
                <input
                  type="text"
                  required
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full bg-bg-primary border border-line rounded-lg px-4 py-2.5 text-sm text-text-primary font-mono outline-none focus:border-accent-cyan transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-body text-text-muted mb-1.5">Create password</label>
                <div className="relative">
                  <input
                    type={showRegPassword ? "text" : "password"}
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-bg-primary border border-line rounded-lg pl-4 pr-11 py-2.5 text-sm text-text-primary font-mono outline-none focus:border-accent-cyan transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors p-1"
                    aria-label={showRegPassword ? "Hide password" : "Show password"}
                  >
                    {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-body text-text-muted mb-1.5">Gamer handle / username</label>
                <input
                  type="text"
                  required
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  placeholder="e.g. Sniper_99"
                  className="w-full bg-bg-primary border border-line rounded-lg px-4 py-2.5 text-sm text-text-primary font-mono outline-none focus:border-accent-cyan transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-body text-text-muted mb-1.5">Full name</label>
                  <input
                    type="text"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="e.g. Suresh Varma"
                    className="w-full bg-bg-primary border border-line rounded-lg px-4 py-2 text-sm text-text-primary outline-none focus:border-accent-cyan transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-body text-text-muted mb-1.5">Free Fire UID</label>
                  <input
                    type="text"
                    value={regFreefireUid}
                    onChange={(e) => setRegFreefireUid(e.target.value)}
                    placeholder="e.g. 849201938"
                    className="w-full bg-bg-primary border border-line rounded-lg px-4 py-2 text-sm text-text-primary font-mono outline-none focus:border-accent-cyan transition-colors"
                  />
                </div>
              </div>

              <Button variant="primary" type="submit" loading={regLoading} className="w-full py-3 mt-2">
                Create Account
              </Button>
            </form>
          )}
        </div>
      </Modal>
    </nav>
  );
}
