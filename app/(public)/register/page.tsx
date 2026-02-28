'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/firebase/firebaseClient';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';

export default function RegisterPage() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // 1. Create Identity inside Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Create strict Identity Map in Firestore for Role enforcement
            await setDoc(doc(db, 'users', user.uid), {
                id: user.uid,
                email: user.email,
                firstName,
                lastName,
                role: 'user', // Default role
                enrolledCourses: [],
                createdAt: serverTimestamp(),
            });

            // 3. Complete and redirect
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            <Header />
            <div className="flex-1 flex items-center justify-center pt-24 pb-12 px-4">
                <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-xl max-w-md w-full shadow-2xl">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold tracking-tight mb-2">Join the Culture</h1>
                        <p className="text-zinc-400">Create an account to access courses and fast checkout</p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg text-sm mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-1" htmlFor="firstName">
                                    First Name
                                </label>
                                <input
                                    id="firstName"
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                                    placeholder="John"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-1" htmlFor="lastName">
                                    Last Name
                                </label>
                                <input
                                    id="lastName"
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                                    placeholder="Doe"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-1" htmlFor="email">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                                placeholder="you@example.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-1" htmlFor="password">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                            <p className="text-zinc-500 text-xs mt-2">Must be at least 6 characters long.</p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center mt-6 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="h-5 w-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-zinc-400 text-sm">
                        Already have an account?{' '}
                        <Link href="/login" className="text-white hover:text-amber-500 font-medium transition-colors">
                            Log in instead
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
