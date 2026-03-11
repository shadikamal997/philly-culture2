import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { adminAuth, adminDb } from '@/firebase/firebaseAdmin';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { isPrivilegedRole } from '@/lib/constants/roles';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get('__session')?.value;
  const roleCookie = cookieStore.get('role')?.value;

  // Fast path: no cookies at all → definitely not authenticated
  if (!sessionToken && !roleCookie) {
    redirect('/login?redirect=/admin');
  }

  // If we have a session token, verify it server-side (most secure path)
  if (sessionToken) {
    try {
      let userId: string;
      try {
        const decodedClaims = await adminAuth.verifySessionCookie(sessionToken, true);
        userId = decodedClaims.uid;
      } catch {
        const decodedToken = await adminAuth.verifyIdToken(sessionToken);
        userId = decodedToken.uid;
      }

      const userDoc = await adminDb.collection('users').doc(userId).get();
      if (!userDoc.exists) redirect('/login?redirect=/admin');

      const userRole = userDoc.data()?.role;
      if (!isPrivilegedRole(userRole)) {
        redirect('/?error=unauthorized');
      }

      return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-black">
          <AdminSidebar />
          <main className="flex-1 overflow-x-hidden">
            <div className="p-8">{children}</div>
          </main>
        </div>
      );  } catch (error) {
      console.error('Admin session verification error:', error);
      // Session verification failed - redirect to login with error
      redirect('/login?error=session_expired&redirect=/admin');
    }
  }

  // No valid session token found - require login
  redirect('/login?redirect=/admin');
}
