'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface NavItem {
  name: string;
  href: string;
  icon: string;
  badge?: number;
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const { userData, logout } = useAuth();

  const navigation: NavItem[] = [
    { name: 'Dashboard', href: '/admin', icon: '📊' },
    { name: 'Programs', href: '/admin/programs', icon: '📚' },
    { name: 'Create Program', href: '/admin/programs/create', icon: '➕' },
    { name: 'Students', href: '/admin/students', icon: '👥' },
    { name: 'Chats', href: '/admin/chats', icon: '💬' },
    { name: 'Orders', href: '/admin/orders', icon: '🛒' },
    { name: 'Analytics', href: '/admin/analytics', icon: '📈' },
    { name: 'Certificates', href: '/admin/certificates', icon: '🎓' },
    { name: 'Cohorts', href: '/admin/cohorts', icon: '👨‍👩‍👧‍👦' },
    { name: 'Tax Reports', href: '/admin/tax', icon: '💰' },
    { name: 'Audit Logs', href: '/admin/audit-logs', icon: '📝' },
  ];

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  const handleLogout = async () => {
    console.log('Admin logout clicked');
    await logout();
  };

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 min-h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
            <span className="text-white font-bold text-xl">P</span>
          </div>
          <div>
            <h2 className="font-bold text-gray-900 dark:text-white">Admin Panel</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">{userData?.role || 'Admin'}</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
              ${
                isActive(item.href)
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-medium'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }
            `}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="flex-1">{item.name}</span>
            {item.badge && (
              <span className="px-2 py-1 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full">
                {item.badge}
              </span>
            )}
          </Link>
        ))}
      </nav>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors mb-2"
        >
          <span className="text-xl">👤</span>
          <span>My Dashboard</span>
        </Link>

        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {userData?.displayName || 'Admin User'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {userData?.email}
          </p>
          <button
            onClick={handleLogout}
            className="mt-2 w-full px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
