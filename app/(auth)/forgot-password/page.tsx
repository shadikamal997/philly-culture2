"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import toast, { Toaster } from "react-hot-toast";

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await resetPassword(email);
      setEmailSent(true);
      toast.success("Password reset email sent! Check your inbox.");
    } catch (err: any) {
      console.error("Password reset error:", err);
      toast.error(err.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-center" />
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-950 dark:via-black dark:to-red-950 px-6 py-16">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                <span className="text-white font-bold text-2xl">P</span>
              </div>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {emailSent ? "Check Your Email" : "Reset Password"}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {emailSent 
                ? "We've sent you a password reset link" 
                : "Enter your email to reset your password"}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800 p-8">
            {emailSent ? (
              <div className="text-center space-y-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                
                <div className="space-y-2">
                  <p className="text-gray-700 dark:text-gray-300">
                    We've sent a password reset link to:
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {email}
                  </p>
                </div>

                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                  <p>Click the link in the email to reset your password.</p>
                  <p>The link will expire in 1 hour.</p>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => setEmailSent(false)}
                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium text-sm"
                  >
                    Didn't receive the email? Try again
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                    placeholder="your@email.com"
                    required
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold rounded-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
            )}

            {/* Back to Login */}
            <div className="mt-6 text-center">
              <Link 
                href="/login" 
                className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white inline-flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to login
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
