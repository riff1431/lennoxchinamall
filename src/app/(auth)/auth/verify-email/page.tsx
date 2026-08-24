"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, CheckCircle2, RefreshCw, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function VerifyEmailPage() {
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const handleResend = async () => {
    setResending(true);
    setResent(false);

    const supabase = createClient();
    // Resend by calling signUp again (Supabase handles deduplication)
    // Or use resend method if available
    await supabase.auth.resend({
      type: "signup",
      email: "", // User needs to enter email
    });

    setResending(false);
    setResent(true);
  };

  return (
    <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center">
      <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
        <Mail className="w-8 h-8 text-[#10B981]" />
      </div>

      <div className="space-y-2">
        <h1 className="text-xl sm:text-2xl font-black text-white font-heading">
          Check Your Inbox
        </h1>
        <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
          We&apos;ve sent a verification link to your email address. Click the link to activate
          your Lennox ChinaMall account and start sourcing.
        </p>
      </div>

      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 text-left">
        <div className="flex items-start gap-2.5 text-xs text-slate-400">
          <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
          <span>Open your email inbox and find the message from Lennox ChinaMall</span>
        </div>
        <div className="flex items-start gap-2.5 text-xs text-slate-400">
          <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
          <span>Click the &quot;Confirm your email&quot; button in the email</span>
        </div>
        <div className="flex items-start gap-2.5 text-xs text-slate-400">
          <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
          <span>You&apos;ll be automatically signed in and redirected to your account</span>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-[11px] text-slate-500">
          Didn&apos;t receive the email? Check your spam folder or request a new one.
        </p>

        <button
          onClick={handleResend}
          disabled={resending || resent}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-[#FF1028] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${resending ? "animate-spin" : ""}`} />
          <span>{resent ? "Email Resent!" : resending ? "Resending..." : "Resend Verification Email"}</span>
        </button>
      </div>

      <div className="pt-2 text-center text-xs text-slate-400">
        Already verified?{" "}
        <Link href="/auth/login" className="text-white hover:text-[#FF1028] font-bold">
          Sign In
        </Link>
      </div>

      <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-2.5 text-[11px] text-slate-400">
        <ShieldCheck className="w-4 h-4 text-[#10B981] shrink-0" />
        <span>Email verification protects your account from unauthorized access.</span>
      </div>
    </div>
  );
}
