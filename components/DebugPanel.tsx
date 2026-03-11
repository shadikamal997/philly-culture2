'use client';

import { useEffect, useState } from 'react';

interface LogEntry {
  time: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export function DebugPanel() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Intercept console.log
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;

    console.log = (...args) => {
      originalLog(...args);
      const message = args.join(' ');
      if (message.includes('[LOGIN PAGE]') || message.includes('[AUTH CONTEXT]')) {
        setLogs(prev => [...prev, {
          time: new Date().toLocaleTimeString(),
          message,
          type: message.includes('✅') ? 'success' : message.includes('❌') ? 'error' : message.includes('⚠️') ? 'warning' : 'info'
        }].slice(-20)); // Keep last 20 logs
      }
    };

    console.warn = (...args) => {
      originalWarn(...args);
      const message = args.join(' ');
      if (message.includes('[LOGIN PAGE]') || message.includes('[AUTH CONTEXT]')) {
        setLogs(prev => [...prev, {
          time: new Date().toLocaleTimeString(),
          message,
          type: 'warning'
        }].slice(-20));
      }
    };

    console.error = (...args) => {
      originalError(...args);
      const message = args.join(' ');
      if (message.includes('[LOGIN PAGE]') || message.includes('[AUTH CONTEXT]')) {
        setLogs(prev => [...prev, {
          time: new Date().toLocaleTimeString(),
          message,
          type: 'error'
        }].slice(-20));
      }
    };

    return () => {
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
    };
  }, []);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-black text-white px-4 py-2 rounded-lg shadow-lg z-[9999] hover:bg-gray-800"
      >
        Show Debug Panel
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-[500px] max-h-[400px] bg-black text-white rounded-lg shadow-2xl z-[9999] overflow-hidden border-2 border-red-500">
      <div className="bg-red-600 px-4 py-2 flex justify-between items-center">
        <h3 className="font-bold text-sm">🐛 LOGIN DEBUG PANEL</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-white hover:text-gray-200 font-bold"
        >
          ✕
        </button>
      </div>
      
      <div className="p-4 overflow-y-auto max-h-[340px] text-xs font-mono space-y-1">
        {logs.length === 0 ? (
          <div className="text-gray-400">Waiting for login attempt...</div>
        ) : (
          logs.map((log, idx) => (
            <div
              key={idx}
              className={`p-2 rounded ${
                log.type === 'success' ? 'bg-green-900 text-green-100' :
                log.type === 'error' ? 'bg-red-900 text-red-100' :
                log.type === 'warning' ? 'bg-yellow-900 text-yellow-100' :
                'bg-gray-800 text-gray-100'
              }`}
            >
              <span className="text-gray-400">[{log.time}]</span> {log.message}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
