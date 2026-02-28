'use client';
import { Sidebar } from '@/components/layout/Sidebar';
import { useAdminGuard } from '@/hooks/useAdminGuard';
import { Spinner } from '@/components/ui/Spinner';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin, isLoading } = useAdminGuard();

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <Spinner />
      </div>
    );
  }

  if (!isAdmin) {
    return null; // The hook will automatically redirect them
  }

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Topbar Fake Placeholder */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm">
          <h2 className="text-xl font-semibold opacity-80">Dashboard Area</h2>
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold cursor-pointer hover:bg-green-600 transition">
              A
            </div>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}