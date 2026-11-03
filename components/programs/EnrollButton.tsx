"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency } from "@/lib/formatCurrency";

interface EnrollButtonProps {
  programId: string;
  programPrice: number;
  currency?: string | null; // Currency of programPrice; missing means USD
  eurPrice?: number | null; // Optional EUR price for USD programs
}

type CheckoutCurrency = "usd" | "eur";

const Spinner = () => (
  <span className="flex items-center justify-center gap-2">
    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
    Processing...
  </span>
);

export default function EnrollButton({ programId, programPrice, currency, eurPrice }: EnrollButtonProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState<CheckoutCurrency | null>(null);
  const [error, setError] = useState<string | null>(null);

  const programCurrency: CheckoutCurrency = currency === "eur" ? "eur" : "usd";
  // EUR checkouts offer card or SEPA Direct Debit (EU bank account)
  const offersEur = programCurrency === "usd" && !!eurPrice && eurPrice > 0;

  // Reset loading if browser restores page from bfcache (user hit Back from Stripe)
  useEffect(() => {
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) setLoading(null);
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  const handleEnroll = async (checkoutCurrency: CheckoutCurrency) => {
    setLoading(checkoutCurrency);
    setError(null);
    try {
      const body: any = { programId, currency: checkoutCurrency };
      if (user?.email) body.userEmail = user.email;

      const res = await fetch("/api/v1/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Failed to create checkout session");
        setLoading(null);
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(null);
    }
  };

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          {error}
        </p>
      )}
      <button
        onClick={() => handleEnroll(programCurrency)}
        disabled={loading !== null}
        className="w-full bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white font-semibold text-[15px] py-3.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading === programCurrency ? <Spinner /> : "Enroll Now"}
      </button>
      {programCurrency === "eur" && (
        <p className="text-center text-xs text-gray-500">Pay by card or SEPA Direct Debit</p>
      )}
      {offersEur && (
        <button
          onClick={() => handleEnroll("eur")}
          disabled={loading !== null}
          className="w-full border border-gray-200 hover:border-gray-300 hover:bg-gray-50 active:scale-[0.98] text-gray-900 font-semibold text-[15px] py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading === "eur" ? (
            <Spinner />
          ) : (
            <span className="flex flex-col items-center leading-tight">
              <span>Pay in EUR · {formatCurrency(eurPrice!, "eur")}</span>
              <span className="text-xs font-normal text-gray-500 mt-1">Card or SEPA Direct Debit</span>
            </span>
          )}
        </button>
      )}
      <p className="text-center text-xs text-gray-400">
        {user ? "Signed in as " + user.email : "No account needed — pay securely with Stripe"}
      </p>
    </div>
  );
}
