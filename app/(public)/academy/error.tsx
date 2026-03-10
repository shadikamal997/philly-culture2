'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function ProgramsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Programs page error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6">
      <div className="max-w-md text-center">
        <div className="text-5xl mb-4">📚</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Programs</h1>
        <p className="text-gray-600 mb-6">
          We're having trouble loading our programs. Please try again.
        </p>
        
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 transition"
          >
            Retry
          </button>
          <Link
            href="/"
            className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-medium hover:bg-gray-300 transition"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
