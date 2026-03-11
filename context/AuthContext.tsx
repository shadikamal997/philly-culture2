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
            
            // 🔒 CRITICAL: Block unverified users from setting state
            // This prevents the login redirect race condition where onAuthStateChanged
            // fires BEFORE signIn()'s emailVerified check completes
            if (currentUser && !currentUser.emailVerified) {
                console.warn('⚠️  Blocking unverified user from auth state');
                setUser(null);
                setUserData(null);
                setLoading(false);
                return; // Don't process unverified users
            }

            setUser(currentUser);

            if (currentUser) {
                
                try {
                    const docRef = doc(db, 'users', currentUser.uid);
                    
                    // 🔥 FIX: Retry logic for Firestore permissions race condition
                    // Sometimes Firestore SDK doesn't have auth token yet when onAuthStateChanged fires
                    let docSnap;
                    let retries = 0;
                    const maxRetries = 3;
                    
                    while (retries < maxRetries) {
                        try {
                            console.log(`🔄 [AUTH CONTEXT] Fetching user data (attempt ${retries + 1}/${maxRetries})...`);
                            docSnap = await getDoc(docRef);
                            console.log('✅ [AUTH CONTEXT] User document fetched successfully');
                            break; // Success!
                        } catch (error: any) {
                            if (error.code === 'permission-denied' && retries < maxRetries - 1) {
                                console.warn(`⚠️  [AUTH CONTEXT] Permission denied, retrying in ${500 * (retries + 1)}ms...`);
                                await new Promise(resolve => setTimeout(resolve, 500 * (retries + 1)));
                                retries++;
                            } else {
                                throw error; // Give up
                            }
                        }
                    }
                    
                    if (docSnap && docSnap.exists()) {
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
                    console.error("❌ Failed to fetch user data after retries:", error);
                    setUserData(null);
                }
            } else {
                setUser(null);
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
            console.log('🔵 [AUTH CONTEXT] Starting sign in process for:', email);
            
            // 🔥 CRITICAL FIX: Clear ALL old cookies first to prevent expired token loops
            document.cookie = '__session=; path=/; max-age=0';
            document.cookie = 'role=; path=/; max-age=0';
            console.log('🧹 [AUTH CONTEXT] Cleared old cookies');
            
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log('✅ [AUTH CONTEXT] Firebase authentication successful');
            
            // 🔒 SECURITY: Check email verification
            if (!userCredential.user.emailVerified) {
                console.error('❌ [AUTH CONTEXT] Email not verified - signing out immediately');
                await firebaseSignOut(auth);
                throw new Error('Please verify your email address before signing in. Check your inbox for the verification link.');
            }
            
            console.log('✅ [AUTH CONTEXT] Email is verified, continuing login...');
            
            // 🔥 CRITICAL: Get a FRESH ID token (force refresh to avoid expired tokens)
            const idToken = await userCredential.user.getIdToken(true); // true = force refresh
            console.log('✅ [AUTH CONTEXT] Fresh ID token obtained');

            // Fire session cookie creation with a 5s timeout.
            // This is best-effort — the role cookie (set by onAuthStateChanged) handles
            // middleware access if the session API is slow or fails.
            const sessionPromise = fetch('/api/auth/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken }),
            });
            const timeoutPromise = new Promise<Response>((_, reject) =>
                setTimeout(() => reject(new Error('Session API timeout')), 5000)
            );

            try {
                const response = await Promise.race([sessionPromise, timeoutPromise]);
                if (response.ok) {
                    console.log('✅ [AUTH CONTEXT] Session cookie created');
                } else {
                    const data = await response.json().catch(() => ({}));
                    if (response.status === 429) {
                        throw new Error(data.error || 'Too many login attempts. Please wait a few minutes.');
                    }
                    console.warn('⚠️ [AUTH CONTEXT] Session API non-ok (non-blocking):', response.status, data.error);
                }
            } catch (sessionErr: any) {
                if (sessionErr.message?.includes('Too many') || sessionErr.message?.includes('wait')) {
                    throw sessionErr;
                }
                console.warn('⚠️ [AUTH CONTEXT] Session API error (non-blocking):', sessionErr.message);
            }

            console.log('✅ [AUTH CONTEXT] Sign in complete');
        } catch (error: any) {
            console.error('❌ [AUTH CONTEXT] Sign in error:', error);
            throw error;
        }
    };

    const signUp = async (email: string, password: string, name: string) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await updateProfile(user, { displayName: name });

            // 🔒 SECURITY: Get role from server-side (owner email not exposed to client)
            const idToken = await user.getIdToken();
            let role = 'customer';
            
            try {
                const roleResponse = await fetch('/api/user/get-role', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${idToken}`,
                    },
                    body: JSON.stringify({ uid: user.uid, email }),
                });
                
                if (roleResponse.ok) {
                    const { role: serverRole } = await roleResponse.json();
                    role = serverRole;
                } else {
                    console.warn('⚠️ Failed to get role from server, defaulting to customer');
                }
            } catch (error) {
                console.warn('⚠️ Role API error, defaulting to customer:', error);
            }

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
            
            // Google accounts are pre-verified, skip check
            // (Google OAuth provides verified email addresses)

            const userDocRef = doc(db, 'users', user.uid);
            
            // Check if user already has a role in Firestore — never downgrade existing admins/owners
            const existingDoc = await getDoc(userDocRef);
            const existingRole = existingDoc.exists() ? existingDoc.data()?.role : null;
            const privilegedRoles = ['admin', 'superadmin', 'owner'];
            
            let role = existingRole || 'customer';
            
            // If no existing role, check server-side for owner email
            if (!existingRole && user.email) {
                const idToken = await user.getIdToken();
                try {
                    const roleResponse = await fetch('/api/user/get-role', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${idToken}`,
                        },
                        body: JSON.stringify({ uid: user.uid, email: user.email }),
                    });
                    
                    if (roleResponse.ok) {
                        const { role: serverRole } = await roleResponse.json();
                        role = serverRole;
                    }
                } catch (error) {
                    console.warn('⚠️ Role API error, using default:', error);
                }
            }
            
            // Preserve existing privileged roles
            if (privilegedRoles.includes(existingRole)) {
                role = existingRole;
            }

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

