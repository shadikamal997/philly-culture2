'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
    onAuthStateChanged, 
    User, 
    signOut as firebaseSignOut,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    updateProfile,
    sendEmailVerification,
    sendPasswordResetEmail
} from 'firebase/auth';
import { auth, db } from '@/firebase/firebaseClient';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthContextType {
    user: User | null;
    userData: any | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, name: string) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
    user: null,
    userData: null,
    loading: true,
    signIn: async () => {},
    signUp: async () => {},
    signInWithGoogle: async () => {},
    logout: async () => {},
    resetPassword: async () => {},
});

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        console.log('🔵 AuthContext: Setting up auth listener');
        
        // Safety timeout: if Firebase never fires onAuthStateChanged within 8s,
        // force loading to false so the app doesn't get stuck on a spinner
        const loadingTimeout = setTimeout(() => {
            console.warn('⚠️  Auth state timeout - forcing loading to false');
            setLoading(false);
        }, 8000);
        
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            clearTimeout(loadingTimeout); // Cancel timeout since auth fired
            console.log('🔵 Auth state changed:', currentUser ? `User: ${currentUser.email}` : 'No user');
            setUser(currentUser);

            if (currentUser) {
                try {
                    const docRef = doc(db, 'users', currentUser.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        setUserData(data);
                        console.log('✅ User data loaded:', { email: data.email, role: data.role });
                        
                        if (data.role) {
                            document.cookie = `role=${data.role}; path=/; max-age=2592000`;
                        }
                    } else {
                        console.warn('⚠️  User document not found in Firestore');
                        setUserData(null);
                    }
                } catch (error) {
                    console.error("❌ Failed to fetch user data", error);
                    setUserData(null);
                }
            } else {
                setUserData(null);
                document.cookie = 'role=; path=/; max-age=0';
            }

            setLoading(false);
        });

        return () => {
            clearTimeout(loadingTimeout);
            console.log('🔵 AuthContext: Cleaning up auth listener');
            unsubscribe();
        };
    }, []);

    const signIn = async (email: string, password: string) => {
        try {
            console.log('🔵 Starting sign in process...');
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const idToken = await userCredential.user.getIdToken();

            // Try to create a server-side session cookie.
            // If this fails for any reason, we still continue — Firebase client
            // auth is valid and the role cookie (set in onAuthStateChanged) will
            // handle middleware access.
            try {
                const response = await fetch('/api/auth/session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ idToken }),
                });
                if (response.ok) {
                    console.log('✅ Session cookie created successfully');
                } else {
                    const data = await response.json().catch(() => ({}));
                    // 429 = rate limited — this IS a real error the user should see
                    if (response.status === 429) {
                        throw new Error(data.error || 'Too many login attempts. Please wait a few minutes.');
                    }
                    // Other failures: log but don't block the user
                    console.warn('⚠️ Session cookie creation failed (non-blocking):', data.error);
                }
            } catch (sessionErr: any) {
                // Re-throw rate-limit errors
                if (sessionErr.message?.includes('Too many') || sessionErr.message?.includes('wait')) {
                    throw sessionErr;
                }
                console.warn('⚠️ Session API error (non-blocking):', sessionErr.message);
            }

            console.log('✅ Sign in complete');
        } catch (error: any) {
            console.error('❌ Sign in error:', error);
            throw error;
        }
    };

    const signUp = async (email: string, password: string, name: string) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await updateProfile(user, { displayName: name });

            const role = email === process.env.NEXT_PUBLIC_OWNER_EMAIL ? 'owner' : 'customer';

            await setDoc(doc(db, 'users', user.uid), {
                uid: user.uid,
                email,
                displayName: name,
                role,
                enrolledCourses: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            await sendEmailVerification(user);

            const idToken = await user.getIdToken();
            // Non-blocking session cookie
            fetch('/api/auth/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken }),
            }).catch(e => console.warn('⚠️ Session cookie failed (non-blocking):', e));
        } catch (error: any) {
            console.error('Sign up error:', error);
            throw new Error(error.message || 'Failed to create account');
        }
    };

    const signInWithGoogle = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const userCredential = await signInWithPopup(auth, provider);
            const user = userCredential.user;

            const userDocRef = doc(db, 'users', user.uid);
            
            // Check if user already has a role in Firestore — never downgrade existing admins/owners
            const existingDoc = await getDoc(userDocRef);
            const existingRole = existingDoc.exists() ? existingDoc.data()?.role : null;
            const privilegedRoles = ['admin', 'superadmin', 'owner'];
            const role = privilegedRoles.includes(existingRole)
                ? existingRole // preserve existing privileged role
                : (user.email === process.env.NEXT_PUBLIC_OWNER_EMAIL ? 'owner' : (existingRole || 'customer'));

            await setDoc(
                userDocRef,
                {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    role,
                    enrolledCourses: existingDoc.exists() ? (existingDoc.data()?.enrolledCourses ?? []) : [],
                    createdAt: existingDoc.exists() ? existingDoc.data()?.createdAt : new Date(),
                    updatedAt: new Date(),
                },
                { merge: true }
            );

            const idToken = await user.getIdToken();
            // Non-blocking session cookie; role cookie covers middleware
            fetch('/api/auth/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken }),
            }).catch(e => console.warn('⚠️ Session cookie failed (non-blocking):', e));
        } catch (error: any) {
            console.error('Google sign in error:', error);
            throw new Error(error.message || 'Failed to sign in with Google');
        }
    };

    const logout = async () => {
        try {
            console.log('🔴 Starting logout process');
            
            // Clear session cookie first
            await fetch('/api/auth/session', {
                method: 'DELETE',
            });
            console.log('✅ Session cleared');
            
            // Sign out from Firebase
            await firebaseSignOut(auth);
            console.log('✅ Firebase sign out completed');
            
            // Redirect to home page
            window.location.href = '/';
        } catch (error) {
            console.error('❌ Logout error:', error);
            // Even if there's an error, try to redirect
            window.location.href = '/';
        }
    };

    const resetPassword = async (email: string) => {
        try {
            await sendPasswordResetEmail(auth, email);
        } catch (error: any) {
            console.error('Password reset error:', error);
            throw new Error(error.message || 'Failed to send password reset email');
        }
    };

    return (
        <AuthContext.Provider value={{ user, userData, loading, signIn, signUp, signInWithGoogle, logout, resetPassword }}>
            {children}
        </AuthContext.Provider>
    );
}

