import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export function Header() {
    const { user, logout } = useAuth();

    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-white backdrop-blur-md border-b border-gray-200 shadow-sm flex items-center justify-between px-6 z-50">
            <Link href="/" className="font-bold text-xl tracking-tighter text-black">
                PHILLY CULTURE
            </Link>

            <nav className="flex items-center gap-6">
                <Link href="/academy" className="text-gray-700 hover:text-black transition-colors">Academy</Link>
                <Link href="/shop" className="text-gray-700 hover:text-black transition-colors">Shop</Link>
                {user ? (
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="text-red-600 hover:text-red-700 font-medium">Dashboard</Link>
                        <button onClick={async () => await logout()} className="text-gray-500 hover:text-black text-sm">Logout</button>
                    </div>
                ) : (
                    <div className="flex items-center gap-4">
                        <Link href="/login" className="text-gray-700 hover:text-black transition-colors">Login</Link>
                        <Link href="/register" className="bg-red-600 text-white px-4 py-1.5 rounded-full font-bold hover:bg-red-700 transition-colors">Sign up</Link>
                    </div>
                )}
            </nav>
        </header>
    );
}
