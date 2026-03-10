import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { adminAuth, adminDb } from '@/firebase/firebaseAdmin';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 🔒 SERVER-SIDE ADMIN VERIFICATION
  const cookieStore = cookies();
  const sessionToken = cookieStore.get('__session')?.value;

  if (!sessionToken) {
    redirect('/login?redirect=/admin');
  }

  try {
    // Verify Firebase token
    const decodedToken = await adminAuth.verifyIdToken(sessionToken);
    const userId = decodedToken.uid;

    // Check user role in Firestore
    const userDoc = await adminDb.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      redirect('/login?redirect=/admin');
    }

    const userData = userDoc.data();
    const userRole = userData?.role;

    // Only allow admin, superadmin, or owner roles
    if (userRole !== 'admin' && userRole !== 'superadmin' && userRole !== 'owner') {
      redirect('/?error=unauthorized');
    }

    // User is verified admin, render children with sidebar
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-black">
        <AdminSidebar />
        <main className="flex-1 overflow-x-hidden">
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>
    );
  } catch (error) {
    console.error('Admin auth error:', error);
    redirect('/login?redirect=/admin');
  }
}
