'use client';

import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Certificate {
  id: string;
  courseId: string;
  courseTitle: string;
  earnedAt: Date;
  certificateUrl?: string;
}

export default function CertificatesPage() {
  const { userData } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For now, we'll show a placeholder since certificates aren't implemented yet
    setLoading(false);
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Certificates</h1>
        <p className="text-gray-600 dark:text-gray-400">View and download your earned certificates</p>
      </div>

      <div className="text-center py-20">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No certificates yet</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Complete courses to earn certificates.</p>
        <Link
          href="/my-courses"
          className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
        >
          View My Courses
        </Link>
      </div>
    </div>
  );
}