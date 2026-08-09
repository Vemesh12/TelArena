"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gamepad2, Camera, Smartphone, ShieldCheck, CheckCircle2, MapPin, Check,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";

const stepMeta = [
  { num: 1, title: "Free Fire UID", desc: "In-game ownership check", icon: Gamepad2 },
  { num: 2, title: "Mobile OTP", desc: "Telecom circle verification", icon: Smartphone },
  { num: 3, title: "TES Result", desc: "Automatic decision", icon: ShieldCheck },
];

export default function VerifyPage() {
  const { user, refetch } = useAuth();
  const toast = useToast();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [ffCode, setFfCode] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [appealNote, setAppealNote] = useState("");
  const [digilockerUrl, setDigilockerUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [detectedCircle, setDetectedCircle] = useState("");

  const verif = user?.verification || {};
  const status = verif.status || "not_started";

  useEffect(() => {
    if (user?.phone) {
      setPhone(user.phone);
    }
  }, [user]);

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadLoading(true);
    try {
      const uploadRes = await api.uploadFile(file);
      await api.submitFFScreenshot(uploadRes.url);
      toast.success("Screenshot Uploaded!", "Your Free Fire signature ownership has been verified. Initial TES re-calculated!");
      await refetch();
      setStep(2);
    } catch (err: any) {
      toast.error("Upload Failed", err.message);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleInitiateFF = async () => {
    setLoading(true);
    try {
      const res: any = await api.initiateFF();
      setFfCode(res.code);
      toast.info("Free Fire Code Generated", res.instructions);
    } catch (err: any) {
      toast.error("Failed to generate code", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!phone) return toast.error("Error", "Please enter phone number");
    setLoading(true);
    try {
      await api.sendOtp(phone);
      setOtpSent(true);
      toast.success("OTP Sent", `Verification code sent to ${phone} (Stub OTP: 123456)`);
    } catch (err: any) {
      toast.error("Failed to send OTP", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) return toast.error("Error", "Please enter OTP");
    setLoading(true);
    try {
      const res: any = await api.verifyOtp(phone, otp);
      if (res.success) {
        setDetectedCircle(res.telecomCircle || "Andhra Pradesh & Telangana");
        toast.success("OTP & Telecom Verified", `Telecom Circle Detected: ${res.telecomCircle || 'Andhra Pradesh & Telangana'}. +30 TES Score Added!`);
        await refetch();
        setStep(3);
      } else {
        toast.error("Verification Failed", res.message || "Invalid OTP");
      }
    } catch (err: any) {
      toast.error("OTP Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAppeal = async () => {
    if (!appealNote) return toast.error("Error", "Please describe your appeal");
    setLoading(true);
    try {
      await api.submitAppeal(appealNote);
      toast.success("Appeal Submitted", "Our team will manually review your profile within 48 hours.");
      await refetch();
    } catch (err: any) {
      toast.error("Appeal Failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDigilockerSubmit = async () => {
    if (!digilockerUrl) return toast.error("Error", "Please enter your DigiLocker share URL");
    setLoading(true);
    try {
      await api.submitDigilocker(digilockerUrl);
      toast.success("DigiLocker Submitted", "DigiLocker document submitted! An admin will review it shortly. (+20 Pts on approval)");
      await refetch();
    } catch (err: any) {
      toast.error("DigiLocker Submission Failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDigilockerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadLoading(true);
    try {
      const uploadRes = await api.uploadFile(file);
      await api.submitDigilocker(uploadRes.url);
      toast.success("Document Uploaded!", "Your DigiLocker document has been submitted for admin manual review. (+20 Pts on approval)");
      await refetch();
    } catch (err: any) {
      toast.error("Upload Failed", err.message);
    } finally {
      setUploadLoading(false);
    }
  };

  const statusVariant =
    status === "approved" || status === "auto_approved" ? "verified" :
    status === "manual_review" ? "pending" : "rejected";

  return (
    <div className="min-h-screen pt-32 pb-16">
      <div className="max-w-2xl mx-auto px-6 lg:px-10">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p className="font-mono text-xs text-accent-cyan uppercase tracking-widest mb-3">Verification</p>
          <h1 className="font-display font-semibold text-4xl sm:text-5xl text-text-primary tracking-tight mb-4">
            Eligibility &amp; TES Verification
          </h1>
          <p className="text-text-secondary text-base max-w-xl">
            Complete the 3-step Telugu Eligibility Score (TES) verification to unlock tournament registration.
          </p>
        </motion.div>

        {/* Current Status Callout */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="card-angular p-6 flex items-center justify-between mt-10"
        >
          <div>
            <span className="font-mono text-xs text-text-muted uppercase tracking-widest">Current TES Status</span>
            <div className="flex items-center gap-3 mt-2">
              <h2 className="font-display font-semibold text-2xl text-text-primary tracking-tight capitalize">
                {status.replace(/_/g, " ")}
              </h2>
              <Badge variant={statusVariant}>{status.toUpperCase()}</Badge>
            </div>
            <p className="text-text-secondary text-xs mt-2 max-w-xs">
              {verif.tesDecision || "Complete step 1 and step 2 to calculate your eligibility score."}
            </p>
          </div>

          <div className="text-right shrink-0">
            <span className="font-mono text-xs text-text-muted uppercase tracking-widest">TES Score</span>
            <p className="font-mono text-4xl font-bold text-accent-red mt-1 tabular-nums">{verif.tesScore || 0}<span className="text-lg text-text-muted">/100</span></p>
          </div>
        </motion.div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between mt-10 mb-6 px-1">
          {stepMeta.map((s, i) => {
            const isActive = step === s.num;
            const isDone = step > s.num;
            return (
              <div key={s.num} className="flex items-center flex-1 last:flex-none">
                <button
                  onClick={() => setStep(s.num as any)}
                  className="flex items-center gap-3 group cursor-pointer"
                >
                  <span
                    className={`flex items-center justify-center w-9 h-9 rounded-full font-display font-semibold text-sm shrink-0 transition-all ${
                      isDone
                        ? "bg-status-success/15 text-status-success border border-status-success/40"
                        : isActive
                        ? "bg-accent-red text-white border border-accent-red glow-red"
                        : "bg-white/[0.04] text-text-muted border border-line group-hover:border-white/20"
                    }`}
                  >
                    {isDone ? <Check className="w-4 h-4" strokeWidth={2.5} /> : s.num}
                  </span>
                  <span className="hidden sm:block text-left">
                    <span className={`block font-display text-sm font-semibold ${isActive ? "text-text-primary" : "text-text-secondary"}`}>
                      {s.title}
                    </span>
                    <span className="block text-[11px] text-text-muted">{s.desc}</span>
                  </span>
                </button>
                {i < stepMeta.length - 1 && (
                  <div className={`h-px flex-1 mx-3 ${isDone ? "bg-status-success/40" : "bg-line"}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Cards */}
        <Card className="p-6">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <CardHeader title="Free Fire UID Check" subtitle="Generate a temporary code to set in your Free Fire profile bio" />
                {ffCode ? (
                  <div className="space-y-4 bg-bg-secondary rounded-xl p-4 border border-line">
                    <span className="text-xs font-mono text-text-muted uppercase tracking-widest">Verification Code</span>
                    <div className="font-mono text-2xl font-bold text-accent-red tracking-widest">{ffCode}</div>
                    <p className="text-xs text-text-secondary">
                      Set this code in your Free Fire profile signature, then capture a screenshot of your profile and upload it below.
                    </p>

                    <label className="border border-dashed border-line hover:border-accent-cyan/40 p-6 rounded-xl text-center bg-bg-primary transition-colors relative cursor-pointer flex flex-col items-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleScreenshotUpload}
                        disabled={uploadLoading}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <Camera className="w-6 h-6 text-text-muted" strokeWidth={1.75} />
                      <span className="block text-xs font-display font-medium text-text-secondary">
                        {uploadLoading ? "Uploading Screenshot..." : "Select Profile Screenshot to Upload"}
                      </span>
                      <span className="block text-[11px] text-text-muted">PNG, JPG up to 5MB</span>
                    </label>
                  </div>
                ) : (
                  <Button variant="primary" loading={loading} onClick={handleInitiateFF}>
                    Generate Free Fire Check Code
                  </Button>
                )}
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <CardHeader title="Mobile OTP & Telecom Circle" subtitle="Verify your phone number to check Telugu circle eligibility" />
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-mono text-text-muted uppercase tracking-widest">Registered Mobile Number *</label>
                      {user?.phone && (
                        <span className="text-[11px] font-mono text-status-success font-semibold inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Account Linked
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full bg-bg-secondary border border-line rounded-lg px-4 py-2.5 text-sm text-text-primary font-mono focus:border-accent-red outline-none transition-colors"
                    />
                  </div>

                  {(detectedCircle || verif.telecomCircle) && (
                    <div className="p-3 rounded-lg bg-accent-cyan/10 border border-accent-cyan/30 text-xs font-mono text-accent-cyan flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        Telecom Circle: <strong>{detectedCircle || verif.telecomCircle || "Andhra Pradesh & Telangana"}</strong>
                      </span>
                      <Badge variant="live">+30 TES PTS</Badge>
                    </div>
                  )}

                  {!otpSent ? (
                    <Button variant="primary" size="sm" loading={loading} onClick={handleSendOtp}>
                      Send OTP Code
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-mono text-text-muted uppercase tracking-widest mb-1.5">Enter 6-Digit OTP Code</label>
                        <input
                          type="text"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          placeholder="123456"
                          className="w-full bg-bg-secondary border border-line rounded-lg px-4 py-2.5 text-sm text-text-primary font-mono tracking-widest focus:border-accent-red outline-none transition-colors"
                        />
                      </div>
                      <Button variant="primary" size="sm" loading={loading} onClick={handleVerifyOtp}>
                        Verify OTP &amp; Detect Telecom Circle
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <CardHeader title="TES Score Outcome" subtitle="Automatic decision computed from signals" />
                <div className="bg-bg-secondary rounded-xl p-6 border border-line space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-display font-semibold text-sm text-text-primary">TES Eligibility Score</span>
                    <span className="font-mono text-2xl font-bold text-accent-cyan tabular-nums">{verif.tesScore || 50}<span className="text-sm text-text-muted">/100</span></span>
                  </div>
                  <p className="text-xs text-text-secondary">{verif.tesDecision || "Pending complete signal verification."}</p>

                  {(verif.telecomCircle || detectedCircle) && (
                    <div className="pt-4 border-t border-line text-xs font-mono text-text-muted flex justify-between">
                      <span>Telecom Region:</span>
                      <span className="text-accent-cyan font-semibold">{verif.telecomCircle || detectedCircle || "Andhra Pradesh & Telangana"} (+30 Pts)</span>
                    </div>
                  )}

                   {/* DigiLocker Submission */}
                  {!verif.digilockerVerified && (
                    <div className="pt-4 border-t border-line space-y-2 bg-bg-primary p-3 border border-white/5 rounded-lg">
                      <span className="block text-xs font-semibold text-text-primary flex items-center gap-1">
                        <span>Boost Score with DigiLocker e-KYC 🪪</span>
                        <span className="text-[10px] text-accent-cyan bg-accent-cyan/10 px-1.5 py-0.5 border border-accent-cyan/35 font-mono uppercase font-bold">+20 Pts</span>
                      </span>
                      <p className="text-[11px] text-text-secondary leading-relaxed">
                        Upload your downloaded DigiLocker PDF or document screenshot. An admin will verify it.
                      </p>
                      <div className="border border-dashed border-white/10 hover:border-accent-cyan/35 p-4 rounded-md text-center bg-bg-secondary transition-colors relative cursor-pointer">
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={handleDigilockerUpload}
                          disabled={uploadLoading}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                        <div className="space-y-1">
                          <span className="block text-lg">📁</span>
                          <span className="block text-[11px] font-display text-text-secondary uppercase">
                            {uploadLoading ? "Uploading Document..." : "Select DigiLocker PDF or Image"}
                          </span>
                        </div>
                      </div>
                      {verif.digilockerUrl && (
                        <span className="block text-[10px] text-accent-cyan font-mono mt-1">
                          Current status: Document submitted, pending review
                        </span>
                      )}
                    </div>
                  )}

                  {status !== "approved" && status !== "auto_approved" && (
                    <div className="pt-4 border-t border-line space-y-3">
                      <p className="text-xs text-text-muted">Need manual review or appeal?</p>
                      <div className="space-y-2">
                        <textarea
                          value={appealNote}
                          onChange={(e) => setAppealNote(e.target.value)}
                          placeholder="Describe your appeal or upload proof..."
                          className="w-full bg-bg-primary border border-line rounded-lg p-3 text-xs text-text-primary outline-none focus:border-accent-red transition-colors"
                          rows={3}
                        />
                        <Button variant="secondary" size="sm" loading={loading} onClick={handleAppeal}>
                          Submit Appeal for Manual Check
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </div>
    </div>
  );
}
