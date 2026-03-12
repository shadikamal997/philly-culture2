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
                console.error('🚫 [AUTH CONTEXT] EMAIL NOT VERIFIED!', {
                    email: currentUser.email,
                    emailVerified: currentUser.emailVerified,
                    uid: currentUser.uid
                });
                console.error('🚫 This will cause an infinite loop! User must verify email first.');
                
                // Sign out the unverified user to stop the loop
                await firebaseSignOut(auth);
                setUser(null);
                setUserData(null);
                setLoading(false);
                return; // Don't process unverified users
            }

            setUser(currentUser);

            if (currentUser) {
                console.log('✅ [AUTH CONTEXT] User email is verified:', currentUser.email);
                
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
                        console.error('🚫 [AUTH CONTEXT] USER DOCUMENT DOES NOT EXIST IN FIRESTORE!', {
                            uid: currentUser.uid,
                            email: currentUser.email
                        });
                        console.error('🚫 This will cause redirect issues! Creating user document...');
                        
                        // Create missing user document
                        const newUserData = {
                            email: currentUser.email,
                            name: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
                            role: 'owner', // Default to owner for now
                            createdAt: new Date().toISOString(),
                        };
                        
                        await setDoc(docRef, newUserData);
                        setUserData(newUserData);
                        console.log('✅ [AUTH CONTEXT] Created missing user document with role: owner');
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

            // 🔥 CRITICAL FIX: Make session cookie creation BLOCKING
            // If this fails, login should fail - don't allow redirect without session cookie
            console.log('🔄 [AUTH CONTEXT] Creating session cookie...');
            const response = await fetch('/api/auth/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken }),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                if (response.status === 429) {
                    throw new Error(data.error || 'Too many login attempts. Please wait a few minutes.');
                }
                // Session cookie creation failed - this is critical, throw error
                console.error('❌ [AUTH CONTEXT] Session cookie creation failed:', response.status, data.error);
                throw new Error('Failed to create session. Please try again.');
            }

            console.log('✅ [AUTH CONTEXT] Session cookie created successfully');
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
            console.log('🔵 [AUTH CONTEXT] Starting Google sign in...');
            
            // 🔥 CRITICAL FIX: Clear ALL old cookies first
            document.cookie = '__session=; path=/; max-age=0';
            document.cookie = 'role=; path=/; max-age=0';
            console.log('🧹 [AUTH CONTEXT] Cleared old cookies');
            
            const provider = new GoogleAuthProvider();
            provider.setCustomParameters({
                prompt: 'select_account' // Force account selection
            });
            
            let userCredential;
            try {
                userCredential = await signInWithPopup(auth, provider);
            } catch (popupError: any) {
                // Handle popup-specific errors
                if (popupError.code === 'auth/popup-closed-by-user') {
                    throw new Error('Sign in cancelled. Please try again.');
                } else if (popupError.code === 'auth/popup-blocked') {
                    throw new Error('Popup blocked by browser. Please allow popups and try again.');
                } else if (popupError.code === 'auth/cancelled-popup-request') {
                    throw new Error('Another sign-in popup is already open.');
                }
                throw popupError; // Re-throw other errors
            }
            
            const user = userCredential.user;
            console.log('✅ [AUTH CONTEXT] Google authentication successful');
            
            // Google accounts are pre-verified, skip check
            // (Google OAuth provides verified email addresses)

            const userDocRef = doc(db, 'users', user.uid);
            
            // Check if user already has a role in Firestore — never downgrade existing admins/owners
            let existingDoc;
            let retries = 0;
            while (retries < 3) {
                try {
                    existingDoc = await getDoc(userDocRef);
                    break;
                } catch (error: any) {
                    // For new users, the document won't exist - treat permission-denied as "new user"
                    if (error.code === 'permission-denied') {
                        console.log('⚠️  [AUTH CONTEXT] No existing user document (this is normal for new users)');
                        existingDoc = null;
                        break;
                    }
                    // For other errors, retry
                    if (retries < 2) {
                        await new Promise(resolve => setTimeout(resolve, 500 * (retries + 1)));
                        retries++;
                    } else {
                        throw error;
                    }
                }
            }
            
            const existingRole = existingDoc?.exists() ? existingDoc.data()?.role : null;
            const privilegedRoles = ['admin', 'superadmin', 'owner'];
            
            let role = existingRole || 'customer';
            
            // If no existing role, check server-side for owner email
            if (!existingRole && user.email) {
                const idToken = await user.getIdToken(true); // Force refresh
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

            // Split create vs update to comply with Firestore rules
            if (!existingDoc || !existingDoc.exists()) {
                // New user - create document with role
                await setDoc(userDocRef, {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    role,
                    enrolledCourses: [],
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
                console.log('✅ [AUTH CONTEXT] Created new user document with role:', role);
            } else {
                // Existing user - update without modifying role
                const updateData: any = {
                    email: user.email,
                    displayName: user.displayName,
                    updatedAt: new Date(),
                };
                
                // Only update role if it hasn't changed (Firestore rules block role changes)
                // This is safe because we already preserve privileged roles above
                if (existingRole !== role) {
                    console.log('⚠️  [AUTH CONTEXT] Role changed detected but cannot update via client. Use admin panel.');
                }
                
                await setDoc(userDocRef, updateData, { merge: true });
                console.log('✅ [AUTH CONTEXT] Updated existing user document');
            }

            const idToken = await user.getIdToken(true); // Force refresh
            // Non-blocking session cookie; role cookie covers middleware
            const sessionPromise = fetch('/api/auth/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken }),
            });
            
            try {
                const response = await sessionPromise;
                if (response.ok) {
                    console.log('✅ [AUTH CONTEXT] Session cookie created via Google sign-in');
                }
            } catch (e) {
                console.warn('⚠️ Session cookie failed (non-blocking):', e);
            }
            
            console.log('✅ [AUTH CONTEXT] Google sign in complete');
        } catch (error: any) {
            console.error('❌ [AUTH CONTEXT] Google sign in error:', error);
            throw error;
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

