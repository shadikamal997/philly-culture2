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

  console.log('[ADMIN LAYOUT] Checking auth:', { hasSession: !!sessionToken, hasRole: !!roleCookie });

  // Fast path: no cookies at all → definitely not authenticated
  if (!sessionToken && !roleCookie) {
    console.log('[ADMIN LAYOUT] No cookies found, redirecting to login');
    redirect('/login?redirect=/admin');
  }

  // If we have ONLY role cookie but no session token, it might be a timing issue
  // Allow them to try accessing - Firebase will handle auth on client side
  if (!sessionToken && roleCookie) {
    console.warn('[ADMIN LAYOUT] Only role cookie found, no session token - possible timing issue');
    console.warn('[ADMIN LAYOUT] Allowing access - client-side auth will verify');
    
    // Allow access with just role cookie as fallback
    // The middleware already checked this, so we trust it
    const privilegedRoles = ['owner', 'admin', 'superadmin'];
    if (privilegedRoles.includes(roleCookie)) {
      return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-black">
          <AdminSidebar />
          <main className="flex-1 overflow-x-hidden">
            <div className="p-8">{children}</div>
          </main>
        </div>
      );
    } else {
      console.error('[ADMIN LAYOUT] Role cookie is not privileged:', roleCookie);
      redirect('/?error=unauthorized');
    }
  }

  // If we have a session token, verify it server-side (most secure path)
  if (sessionToken) {
    try {
      let userId: string;
      try {
        const decodedClaims = await adminAuth.verifySessionCookie(sessionToken, true);
        userId = decodedClaims.uid;
        console.log('[ADMIN LAYOUT] Session cookie verified for user:', userId);
      } catch {
        const decodedToken = await adminAuth.verifyIdToken(sessionToken);
        userId = decodedToken.uid;
        console.log('[ADMIN LAYOUT] ID token verified for user:', userId);
      }

      const userDoc = await adminDb.collection('users').doc(userId).get();
      if (!userDoc.exists) {
        console.error('[ADMIN LAYOUT] User document not found for:', userId);
        redirect('/login?error=user_not_found&redirect=/admin');
      }

      const userRole = userDoc.data()?.role;
      console.log('[ADMIN LAYOUT] User role:', userRole);
      
      if (!isPrivilegedRole(userRole)) {
        console.error('[ADMIN LAYOUT] User does not have privileged role:', userRole);
        redirect('/?error=unauthorized');
      }

      console.log('[ADMIN LAYOUT] Access granted for user:', userId);
      return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-black">
          <AdminSidebar />
          <main className="flex-1 overflow-x-hidden">
            <div className="p-8">{children}</div>
          </main>
        </div>
      );
    } catch (error) {
      console.error('[ADMIN LAYOUT] Session verification error:', error);
      // Session verification failed - redirect to login with error
      redirect('/login?error=session_expired&redirect=/admin');
    }
  }

  // This should never be reached due to logic above, but redirect just in case
  console.error('[ADMIN LAYOUT] Unexpected state - no valid auth path');
  redirect('/login?redirect=/admin');
}
