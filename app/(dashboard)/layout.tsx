'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-amber-500 font-bold">Loading Security Context...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col md:flex-row">
      {/* Protected Sidebar */}
      <aside className="w-full md:w-64 bg-zinc-900 border-r border-zinc-800 p-6 flex flex-col">
        <div className="mb-8 font-bold tracking-tighter text-xl">
          <Link href="/">PHILLY CULTURE</Link>
        </div>

        <nav className="flex-1 space-y-2">
          <Link href="/dashboard/my-courses" className="block px-4 py-3 rounded-lg hover:bg-zinc-800 transition-colors">My Courses</Link>
          <Link href="/dashboard/orders" className="block px-4 py-3 rounded-lg hover:bg-zinc-800 transition-colors">Order History</Link>
          <Link href="/dashboard/addresses" className="block px-4 py-3 rounded-lg hover:bg-zinc-800 transition-colors">Addresses</Link>
          <Link href="/dashboard/billing" className="block px-4 py-3 rounded-lg hover:bg-zinc-800 transition-colors">Billing</Link>
          <Link href="/dashboard/security" className="block px-4 py-3 rounded-lg hover:bg-zinc-800 transition-colors">Security</Link>
        </nav>

        <button
          onClick={() => logout()}
          className="mt-8 text-left px-4 py-3 text-red-500/80 hover:text-red-500 font-bold transition-colors"
        >
          Log Out
        </button>
      </aside>

      {/* Authenticated Execution Context */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}