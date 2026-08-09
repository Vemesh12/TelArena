"use client";
import { useEffect, Suspense } from "react";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { useSearchParams } from "next/navigation";

function CallbackContent() {
  const params = useSearchParams();

  useEffect(() => {
    const token = params.get("access_token");
    if (token) {
      api.setToken(token);
      window.location.href = "/dashboard";
    } else {
      window.location.href = "/";
    }
  }, [params]);

  return (
    <div className="text-center">
      <Loader2 className="w-8 h-8 text-accent-red animate-spin mx-auto mb-4" />
      <p className="font-body text-text-secondary text-sm">Connecting your Discord account...</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary">
      <Suspense fallback={
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-accent-red animate-spin mx-auto mb-4" />
          <p className="font-body text-text-secondary text-sm">Loading...</p>
        </div>
      }>
        <CallbackContent />
      </Suspense>
    </div>
  );
}
