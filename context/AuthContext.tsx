'use client';

import React, { createContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, db } from '@/firebase/firebaseClient';
import { doc, getDoc } from 'firebase/firestore';

interface AuthContextType {
    user: User | null;
    userData: any | null; // Detailed user doc from Firestore
    loading: boolean;
    logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
    user: null,
    userData: null,
    loading: true,
    logout: async () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);

            if (currentUser) {
                try {
                    const docRef = doc(db, 'users', currentUser.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        setUserData(docSnap.data());
                    } else {
                        setUserData(null);
                    }
                } catch (error) {
                    console.error("Failed to fetch user data", error);
                    setUserData(null);
                }
            } else {
                setUserData(null);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const logout = async () => {
        await firebaseSignOut(auth);
    };

    return (
        <AuthContext.Provider value={{ user, userData, loading, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
