"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import toast, { Toaster } from "react-hot-toast";
import { DebugPanel } from "@/components/DebugPanel";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";
  const errorParam = searchParams.get("error"); // Check for error param
  const { signIn, signInWithGoogle, userData, user, loading: authLoading } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAdminLogin, setIsAdminLogin] = useState(false);

  // Auto-redirect if already authenticated
  // IMPORTANT: Only redirect if NOT actively logging in (prevents race condition)
  useEffect(() => {
    console.log('🔵 [LOGIN PAGE] useEffect triggered', { 
      authLoading, 
      loading, 
      hasUser: !!user, 
      hasUserData: !!userData,
      role: userData?.role,
      errorParam 
    });
    
    if (authLoading) {
      console.log('⏸️  [LOGIN PAGE] Auth still loading, waiting...');
      return;
    }
    
    // 🔥 FIX: Don't auto-redirect if there's an error param (like session_expired)
    // This prevents the infinite loop when admin layout rejects expired tokens
    if (errorParam) {
      console.log('⚠️  [LOGIN PAGE] Error param detected, forcing fresh login:', errorParam);
      // Clear the error from URL but don't redirect
      if (errorParam === 'session_expired') {
        toast.error('Your session expired. Please sign in again.');
      }
      return;
    }
    
    if (!user || !userData) {
      console.log('⏸️  [LOGIN PAGE] No user/userData, not redirecting');
      return;
    }

    // User is authenticated — set role cookie and redirect based on role
    const role = userData.role;
    console.log('✅ [LOGIN PAGE] User authenticated, role:', role);
    
    if (role) {
      document.cookie = `role=${role}; path=/; max-age=2592000; SameSite=Lax`;
      console.log('🍪 [LOGIN PAGE] Role cookie set:', role);
    }

    // Clear the loading state since onAuthStateChanged has fired
    if (loading) {
      console.log('🔄 [LOGIN PAGE] Clearing loading state');
      setLoading(false);
    }

    if (role === 'admin' || role === 'superadmin' || role === 'owner') {
      console.log('🚀 [LOGIN PAGE] Redirecting to /admin');
      window.location.replace('/admin');
    } else {
      console.log('🚀 [LOGIN PAGE] Redirecting to', redirect !== '/login' ? redirect : '/dashboard');
      window.location.replace(redirect !== '/login' ? redirect : '/dashboard');
    }
  }, [user, userData, authLoading, loading, redirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔵 [LOGIN PAGE] Form submitted, signing in...');
    setLoading(true);

    try {
      console.log('🔵 [LOGIN PAGE] Calling signIn()...');
      await signIn(email, password);
      console.log('✅ [LOGIN PAGE] signIn() completed successfully');
      // Don't redirect here! Let the useEffect handle it after onAuthStateChanged fires
      // and populates user/userData. This prevents race condition where getUserRole()
      // returns null because auth.currentUser isn't set yet.
      toast.success('Signing in...');
    } catch (err: any) {
      console.error('❌ [LOGIN PAGE] Sign in failed:', err);
      console.error("Login error:", err);
      
      // Better error messages for common issues
      if (err.message?.includes('verify your email')) {
        toast.error(err.message, { duration: 6000 }); // Longer duration for verification message
      } else if (err.message?.includes('invalid-credential') || err.message?.includes('wrong-password')) {
        toast.error('Invalid email or password');
      } else if (err.message?.includes('too-many-requests')) {
        toast.error('Too many login attempts. Please wait a few minutes.');
      } else if (err.message?.includes('user-not-found')) {
        toast.error('No account found with this email');
      } else {
        toast.error(err.message || "Failed to sign in");
      }
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      // Don't redirect here! Let the useEffect handle it after onAuthStateChanged fires
      toast.success('Signing in...');
    } catch (err: any) {
      console.error("Google sign in error:", err);
      toast.error(err.message || "Failed to sign in with Google");
      setLoading(false);
    }
  };

  // Show nothing while checking auth state to prevent flash
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-950 dark:via-black dark:to-red-950">
        <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome Back</h1>
            <p className="text-gray-600 dark:text-gray-400">Sign in to your account</p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800 p-8">
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

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </label>
                  <Link href="/forgot-password" className="text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
                    Forgot password?
                  </Link>
                </div>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
              </div>

              {/* Admin Login Toggle */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/10 dark:to-orange-900/10 border border-red-200 dark:border-red-800">
                <input
                  type="checkbox"
                  id="adminLogin"
                  checked={isAdminLogin}
                  onChange={(e) => setIsAdminLogin(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                  disabled={loading}
                />
                <label htmlFor="adminLogin" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Sign in as Admin
                </label>
              </div>

              <button
                type="submit"
                className={`w-full py-3 px-4 ${
                  isAdminLogin 
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700' 
                    : 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700'
                } text-white font-semibold rounded-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2`}
                disabled={loading}
              >
                {loading ? "Signing in..." : (
                  <>
                    {isAdminLogin && (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    )}
                    {isAdminLogin ? "Sign in to Admin Panel" : "Sign In"}
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">Or continue with</span>
              </div>
            </div>

            {/* Google Sign In */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              type="button"
              className="w-full py-3 px-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            {/* Register Link */}
            <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{" "}
              <Link href="/register" className="font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </main>
      <DebugPanel />
    </>
  );
}
