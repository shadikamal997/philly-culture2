'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/firebase/firebaseClient';
import { signInAnonymously } from 'firebase/auth';

export default function FirebaseTestPage() {
  const [status, setStatus] = useState<string>('Testing Firebase connection...');
  const [details, setDetails] = useState<string[]>([]);
  
  const addLog = (msg: string) => {
    setDetails(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  useEffect(() => {
    async function testFirebase() {
      try {
        addLog('✅ Firebase client initialized');
        
        // Test 1: Check Firebase config
        const config = auth.app.options;
        addLog(`✅ Project ID: ${config.projectId}`);
        addLog(`✅ Auth Domain: ${config.authDomain}`);
        
        // Test 2: Try to reach Firebase Auth
        addLog('Testing network connectivity to Firebase Auth...');
        
        try {
          // Try anonymous sign in as a connectivity test
          await signInAnonymously(auth);
          addLog('✅ Firebase Auth is reachable');
          addLog('✅ Network connection is working');
          setStatus('✅ All Firebase tests passed!');
          
          // Sign out immediately
          await auth.signOut();
          addLog('Cleaned up test session');
          
        } catch (authError: any) {
          if (authError.code === 'auth/network-request-failed') {
            addLog('❌ Network request failed');
            addLog('Possible causes:');
            addLog('  - Firewall blocking Firebase');
            addLog('  - VPN/Proxy issues');
            addLog('  - Slow or unstable internet');
            addLog('  - Firebase temporarily down');
            setStatus('❌ Network connectivity issue detected');
          } else if (authError.code === 'auth/operation-not-allowed') {
            addLog('⚠️  Anonymous auth disabled (expected)');
            addLog('✅ But Firebase Auth IS reachable!');
            setStatus('✅ Firebase is working (anonymous auth disabled)');
          } else {
            addLog(`⚠️  Auth error: ${authError.code}`);
            addLog(`Message: ${authError.message}`);
            setStatus(`⚠️  Error: ${authError.code}`);
          }
        }
        
      } catch (error: any) {
        addLog(`❌ Unexpected error: ${error.message}`);
        setStatus('❌ Firebase test failed');
      }
    }
    
    testFirebase();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            🔥 Firebase Connectivity Test
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Diagnostic tool to check Firebase configuration and network connectivity
          </p>
          
          <div className="mb-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <h2 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
              Status: {status}
            </h2>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-6 font-mono text-sm space-y-1 max-h-96 overflow-y-auto">
            {details.length === 0 ? (
              <div className="text-gray-400">Running tests...</div>
            ) : (
              details.map((log, idx) => (
                <div
                  key={idx}
                  className={`${
                    log.includes('✅') ? 'text-green-400' :
                    log.includes('❌') ? 'text-red-400' :
                    log.includes('⚠️') ? 'text-yellow-400' :
                    'text-gray-300'
                  }`}
                >
                  {log}
                </div>
              ))
            )}
          </div>
          
          <div className="mt-6 flex gap-4">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
            >
              🔄 Re-run Test
            </button>
            <a
              href="/login"
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition"
            >
              ← Back to Login
            </a>
          </div>
          
          <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              💡 If you see "network-request-failed":
            </h3>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 list-disc list-inside">
              <li>Check your internet connection</li>
              <li>Disable VPN or proxy temporarily</li>
              <li>Check if your firewall is blocking Firebase</li>
              <li>Wait a few minutes and try again (Firebase might be rate-limiting)</li>
              <li>Try using mobile hotspot to test if it's your network</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
