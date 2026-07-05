"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppState } from "@/context/AppContext";

function GoogleCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithGoogle } = useAppState();

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      setErrorMsg(error || "Google Authentication failed.");
      setLoading(false);
      return;
    }

    if (!code) {
      setErrorMsg("No authorization code found.");
      setLoading(false);
      return;
    }

    const processCallback = async () => {
      try {
        const savedRole = localStorage.getItem("hyriq_oauth_role") || "candidate";
        const savedCoupon = localStorage.getItem("hyriq_oauth_coupon") || undefined;

        localStorage.removeItem("hyriq_oauth_role");
        localStorage.removeItem("hyriq_oauth_coupon");

        await loginWithGoogle(code, savedRole, savedCoupon);
        router.push("/");
      } catch (err: any) {
        if (err.requiresPayment && err.paymentInfo) {
          localStorage.setItem(
            "hyriq_google_autofill",
            JSON.stringify(err.paymentInfo)
          );
          router.push("/");
        } else {
          console.error("Google Auth callback error:", err);
          setErrorMsg(err.message || "Google Authentication failed. Please try again.");
          setLoading(false);
        }
      }
    };

    processCallback();
  }, [searchParams, loginWithGoogle, router]);

  return (
    <div className="min-h-screen bg-[#f5f7ff] flex flex-col items-center justify-center p-6 text-slate-800 font-sans">
      <div className="max-w-md w-full bg-white/40 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl p-8 text-center">
        <h2 className="font-serif-editorial text-3xl italic mb-4">hyriq.</h2>
        
        {loading ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="w-8 h-8 rounded-full border-2 border-neutral-200 border-t-neutral-800 animate-spin"></div>
            <p className="text-sm text-neutral-500 font-medium font-sans-clean">
              Verifying Google credentials...
            </p>
          </div>
        ) : (
          <div className="py-6">
            <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 text-xl mx-auto mb-4">
              ✕
            </div>
            <p className="text-sm font-semibold text-neutral-800 mb-2">
              Authentication Error
            </p>
            <p className="text-xs text-neutral-500 font-medium font-sans-clean mb-6">
              {errorMsg}
            </p>
            <button
              onClick={() => router.push("/")}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4.5 py-2.5 rounded-full w-full uppercase tracking-wider cursor-pointer"
            >
              Back to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f5f7ff] flex flex-col items-center justify-center p-6 text-slate-800 font-sans">
        <div className="max-w-md w-full bg-white/40 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl p-8 text-center flex flex-col items-center gap-4 py-8">
          <div className="w-8 h-8 rounded-full border-2 border-neutral-200 border-t-neutral-800 animate-spin"></div>
          <p className="text-sm text-neutral-500 font-medium font-sans-clean">
            Loading Google Sign-in callback...
          </p>
        </div>
      </div>
    }>
      <GoogleCallback />
    </Suspense>
  );
}
