'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function ResetAuthPage() {
  const { logout, user } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState('Clearing authentication...');
  const hasRunRef = useRef(false);

  useEffect(() => {
    // Prevent running multiple times
    if (hasRunRef.current) {
      console.log('🛑 Reset already ran, skipping...');
      return;
    }
    hasRunRef.current = true;

    async function clearEverything() {
      try {
        // Step 1: Clear all cookies
        setStatus('Clearing cookies...');
        document.cookie.split(";").forEach((c) => {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
        
        // Step 2: Clear session storage
        setStatus('Clearing session storage...');
        sessionStorage.clear();
        
        // Step 3: Clear local storage
        setStatus('Clearing local storage...');
        localStorage.clear();
        
        // Step 4: Call logout API
        setStatus('Clearing server session...');
        await fetch('/api/auth/session', {
          method: 'DELETE',
        });
        
        // Step 5: Sign out from Firebase
        if (user) {
          setStatus('Signing out from Firebase...');
          await logout();
        }
        
        // Step 6: Done!
        setStatus('✅ Authentication cleared! Redirecting...');
        
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
        
      } catch (error) {
        console.error('Error clearing auth:', error);
        setStatus('❌ Error occurred. Redirecting anyway...');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
    }
    
    clearEverything();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-950 dark:via-black dark:to-red-950">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Resetting Authentication
        </h1>
        <p className="text-gray-600 dark:text-gray-400">{status}</p>
      </div>
    </div>
  );
}
