'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
// Note: Assuming a generic firebase context or direct auth import
// Example: import { auth, db } from '@/firebase/firebaseClient';

interface UseAdminGuardResult {
    isAdmin: boolean;
    isLoading: boolean;
}

export const useAdminGuard = (): UseAdminGuardResult => {
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // ⚠️ Placeholder: You must implement actual Firebase Auth listener here
        // Example:
        // const unsubscribe = onAuthStateChanged(auth, async (user) => {
        //   if (!user) {
        //     router.push('/login');
        //     return;
        //   }
        //   const userDoc = await getDoc(doc(db, 'users', user.uid));
        //   if (userDoc.exists() && userDoc.data().role === 'admin') {
        //     setIsAdmin(true);
        //   } else {
        //     router.push('/dashboard'); // Redirect non-admins to customer portal
        //   }
        //   setIsLoading(false);
        // });
        // return () => unsubscribe();

        // Mock implementation for scaffold:
        const mockCheck = setTimeout(() => {
            // For testing, pretend we're admin. Change this when wiring real DB
            setIsAdmin(true);
            setIsLoading(false);
        }, 500);

        return () => clearTimeout(mockCheck);
    }, [router]);

    return { isAdmin, isLoading };
};
