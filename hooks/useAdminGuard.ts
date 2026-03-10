'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface UseAdminGuardResult {
    isAdmin: boolean;
    isLoading: boolean;
}

export const useAdminGuard = (): UseAdminGuardResult => {
    const [isAdmin, setIsAdmin] = useState(false);
    const { user, userData, loading: authLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Wait for authentication to complete
        if (authLoading) {
            return;
        }

        // Check if user is logged in
        if (!user) {
            console.warn('🔒 Admin Guard: No user authenticated, redirecting to login');
            router.replace('/login');
            return;
        }

        // Check if user data is loaded and has admin role
        if (!userData) {
            console.warn('🔒 Admin Guard: User data not loaded yet');
            setIsAdmin(false);
            return;
        }

        // Verify admin role
        const hasAdminRole = userData.role === 'admin';
        
        if (hasAdminRole) {
            console.log('✅ Admin Guard: Access granted');
            setIsAdmin(true);
        } else {
            console.warn('🔒 Admin Guard: Insufficient permissions, redirecting to home');
            alert('Access Denied: You do not have administrator privileges.');
            router.replace('/');
            setIsAdmin(false);
        }
    }, [user, userData, authLoading, router]);

    // Loading state is true if auth is loading OR if we haven't determined admin status yet
    const isLoading = authLoading || (!isAdmin && !!user && !!userData && userData.role !== 'admin');

    return { isAdmin, isLoading };
};
