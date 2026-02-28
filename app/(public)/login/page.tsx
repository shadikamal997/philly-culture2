'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebase/firebaseClient';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Failed to login. Please check your credentials.');
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
                        <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome Back</h1>
                        <p className="text-zinc-400">Sign in to your Philly Culture account</p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg text-sm mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-4">
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
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-medium text-zinc-300" htmlFor="password">
                                    Password
                                </label>
                                <Link href="#" className="text-xs text-amber-500 hover:text-amber-400">
                                    Forgot password?
                                </Link>
                            </div>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center mt-6 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="h-5 w-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                'Log In'
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-zinc-400 text-sm">
                        Don't have an account?{' '}
                        <Link href="/register" className="text-white hover:text-amber-500 font-medium transition-colors">
                            Create one now
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
