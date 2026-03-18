"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

interface EnrollButtonProps {
  programId: string;
  programPrice: number;
}

export default function EnrollButton({ programId, programPrice }: EnrollButtonProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset loading if browser restores page from bfcache (user hit Back from Stripe)
  useEffect(() => {
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) setLoading(false);
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  const handleEnroll = async () => {
    setLoading(true);
    setError(null);
    try {
      const body: any = { programId };
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
        setLoading(false);
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
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
        onClick={handleEnroll}
        disabled={loading}
        className="w-full bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white font-semibold text-[15px] py-3.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Processing...
          </span>
        ) : (
          "Enroll Now"
        )}
      </button>
      <p className="text-center text-xs text-gray-400">
        {user ? "Signed in as " + user.email : "No account needed — pay securely with Stripe"}
      </p>
    </div>
  );
}


  const handleEnroll = async () => {
    setLoading(true);
    setError(null);

    try {
      const body: any = { programId };

      // Pass email if logged in — enables duplicate-purchase check & pre-fills Stripe form
      if (user?.email) {
        body.userEmail = user.email;
      }

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
        setLoading(false);
      }
    } catch (err) {
      setError("Failed to start enrollment process");
      setLoading(false);
    }
  };

  return (
    <>
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-lg mb-6">
          <p className="font-semibold">Enrollment Error</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Price and Enrollment Section */}
      <div className="bg-gray-50 border rounded-lg p-8 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Program Price</p>
            <p className="text-4xl font-bold text-red-600">
              ${programPrice}
            </p>
            <p className="text-sm text-gray-500 mt-1">+ applicable sales tax</p>
          </div>
          <button
            onClick={handleEnroll}
            disabled={loading}
            className="bg-red-600 text-white px-8 py-4 rounded-lg hover:bg-red-700 transition-colors font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : "Enroll Now"}
          </button>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>Secure payment with Stripe • Automatic US tax calculation • No account required</span>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="text-center border-t pt-8">
        <button
          onClick={handleEnroll}
          disabled={loading}
          className="bg-red-600 text-white px-12 py-4 rounded-lg hover:bg-red-700 transition-colors font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Processing..." : `Enroll in This Program - $${programPrice}`}
        </button>
        <p className="text-sm text-gray-500 mt-4">
          {user ? "Start learning today with lifetime access" : "No account needed — pay securely with Stripe"}
        </p>
      </div>
    </>
  );
}
