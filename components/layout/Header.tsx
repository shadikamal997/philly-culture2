import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export function Header() {
    const { user, logout } = useAuth();

    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-md border-b border-zinc-800 flex items-center justify-between px-6 z-50">
            <Link href="/" className="font-bold text-xl tracking-tighter text-white">
                PHILLY CULTURE
            </Link>

            <nav className="flex items-center gap-6">
                <Link href="/academy" className="text-zinc-300 hover:text-white transition-colors">Academy</Link>
                <Link href="/shop" className="text-zinc-300 hover:text-white transition-colors">Shop</Link>
                {user ? (
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="text-amber-500 hover:text-amber-400 font-medium">Dashboard</Link>
                        <button onClick={async () => await logout()} className="text-zinc-500 hover:text-white text-sm">Logout</button>
                    </div>
                ) : (
                    <div className="flex items-center gap-4">
                        <Link href="/login" className="text-zinc-300 hover:text-white transition-colors">Login</Link>
                        <Link href="/register" className="bg-amber-500 text-black px-4 py-1.5 rounded-full font-bold hover:bg-amber-400 transition-colors">Sign up</Link>
                    </div>
                )}
            </nav>
        </header>
    );
}
