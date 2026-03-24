'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userData, logout, loading } = useAuth();
  const pathname = usePathname();

  // Redirect admins/owners away from user dashboard to their panel
  // But allow them to access their personal pages (profile, orders, certificates, addresses, my-courses)
  const allowedAdminPages = ['/profile', '/certificates', '/orders', '/addresses', '/my-courses'];
  useEffect(() => {
    if (!loading && userData) {
      const role = userData.role;
      if ((role === 'admin' || role === 'superadmin' || role === 'owner') && !allowedAdminPages.includes(pathname || '')) {
        window.location.href = '/admin';
      }
    }
  }, [userData, loading, pathname]);

  const navigation = [
    { name: 'My Courses', href: '/my-courses', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { name: 'Certificates', href: '/certificates', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { name: 'Orders', href: '/orders', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
    { name: 'Addresses', href: '/addresses', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' },
    { name: 'Profile', href: '/profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-black text-gray-900 dark:text-white flex flex-col md:flex-row">
      {/* Modern Sidebar */}
      <aside className="w-full md:w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col shadow-xl">
        {/* Logo Section */}
        <div className="p-8 border-b border-gray-200 dark:border-gray-800">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight">Philly Culture</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Dashboard</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-6 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 ${
                  isActive
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                <div className={`w-6 h-6 ${isActive ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                </div>
                <span className="font-medium">{item.name}</span>
                {isActive && (
                  <div className="ml-auto w-2 h-2 rounded-full bg-red-500"></div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Section & Logout */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-4 p-3 rounded-2xl bg-gray-50 dark:bg-gray-800">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {userData?.email?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{userData?.email}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Premium Member</p>
            </div>
          </div>

          <button
            onClick={async () => await logout()}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <ErrorBoundary>
          <div className="p-8 md:p-12">
            <div className="max-w-6xl mx-auto">
              {children}
            </div>
          </div>
        </ErrorBoundary>
      </main>
    </div>
  );
}