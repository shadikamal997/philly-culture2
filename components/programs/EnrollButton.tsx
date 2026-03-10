"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface EnrollButtonProps {
  programId: string;
  programPrice: number;
}

export default function EnrollButton({ programId, programPrice }: EnrollButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log('🔵 EnrollButton - Auth State:', { 
    hasUser: !!user, 
    userEmail: user?.email,
    authLoading,
    programId 
  });

  const handleEnroll = async () => {
    // Check authentication - wait for auth to load first
    if (authLoading) {
      console.log('⏳ Auth still loading...');
      return;
    }

    if (!user) {
      console.log('⚠️  User not authenticated, redirecting to login');
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    console.log('🔵 Starting enrollment for program:', programId, 'User:', user.email);
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/v1/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ programId, userEmail: user.email }),
      });

      const data = await res.json();

      if (res.ok && data.url) {
        console.log('✅ Checkout session created, redirecting to Stripe');
        window.location.href = data.url;
      } else {
        console.error('❌ Checkout failed:', data.error);
        setError(data.error || "Failed to create checkout session");
        setLoading(false);
      }
    } catch (error) {
      console.error("❌ Enrollment error:", error);
      setError("Failed to start enrollment process");
      setLoading(false);
    }
  };

  return (
    <>
      {/* Auth Loading State */}
      {authLoading && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-6 py-4 rounded-lg mb-6">
          <p className="text-sm">Loading authentication...</p>
        </div>
      )}

      {/* Not Logged In Message */}
      {!authLoading && !user && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-6 py-4 rounded-lg mb-6">
          <p className="font-semibold">Login Required</p>
          <p className="text-sm mt-1">You need to be logged in to enroll in this program.</p>
        </div>
      )}

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
            disabled={loading || authLoading}
            className="bg-red-600 text-white px-8 py-4 rounded-lg hover:bg-red-700 transition-colors font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {authLoading ? "Loading..." : loading ? "Processing..." : user ? "Enroll Now" : "Login to Enroll"}
          </button>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>Secure payment with Stripe • Automatic US tax calculation</span>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="text-center border-t pt-8">
        <button
          onClick={handleEnroll}
          disabled={loading || authLoading}
          className="bg-red-600 text-white px-12 py-4 rounded-lg hover:bg-red-700 transition-colors font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {authLoading 
            ? "Loading..." 
            : loading 
            ? "Processing..." 
            : user 
            ? `Enroll in This Program - $${programPrice}`
            : "Login to Enroll"}
        </button>
        <p className="text-sm text-gray-500 mt-4">
          {user ? "Start learning today with lifetime access" : "Please login to start your enrollment"}
        </p>
      </div>
    </>
  );
}
