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
    sendEmailVerification
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
}

export const AuthContext = createContext<AuthContextType>({
    user: null,
    userData: null,
    loading: true,
    signIn: async () => {},
    signUp: async () => {},
    signInWithGoogle: async () => {},
    logout: async () => {},
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
        
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
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
            console.log('🔵 AuthContext: Cleaning up auth listener');
            unsubscribe();
        };
    }, []);

    const signIn = async (email: string, password: string) => {
        try {
            console.log('🔵 Starting sign in process...');
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const idToken = await userCredential.user.getIdToken();
            
            console.log('🔵 Creating session cookie...');
            const response = await fetch('/api/auth/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken }),
            });

            if (!response.ok) {
                throw new Error('Failed to create session');
            }
            
            console.log('✅ Session created successfully');
        } catch (error: any) {
            console.error('❌ Sign in error:', error);
            throw new Error(error.message || 'Failed to sign in');
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
            const response = await fetch('/api/auth/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken }),
            });

            if (!response.ok) {
                throw new Error('Failed to create session');
            }
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

            const role = user.email === process.env.NEXT_PUBLIC_OWNER_EMAIL ? 'owner' : 'customer';

            const userDoc = doc(db, 'users', user.uid);
            await setDoc(
                userDoc,
                {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    role,
                    enrolledCourses: [],
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                { merge: true }
            );

            const idToken = await user.getIdToken();
            const response = await fetch('/api/auth/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken }),
            });

            if (!response.ok) {
                throw new Error('Failed to create session');
            }
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

    return (
        <AuthContext.Provider value={{ user, userData, loading, signIn, signUp, signInWithGoogle, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

