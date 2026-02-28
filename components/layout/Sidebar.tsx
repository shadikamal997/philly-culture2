'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const Sidebar = () => {
    const pathname = usePathname();

    const links = [
        { name: 'Overview', href: '/overview' },
        { name: 'Courses', href: '/manage-courses' },
        { name: 'Products', href: '/manage-products' },
        { name: 'Orders', href: '/manage-orders' },
        { name: 'Users', href: '/manage-users' },
        { name: 'Analytics', href: '/analytics' },
        { name: 'Settings', href: '/settings' },
    ];

    return (
        <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col transition-all">
            <div className="p-6 text-2xl font-bold tracking-wider text-green-400 border-b border-gray-800">
                Philly Admin
            </div>
            <nav className="flex-1 mt-6 px-4 space-y-2">
                {links.map((link) => {
                    const isActive = pathname.includes(link.href);
                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                                    ? 'bg-green-600 text-white shadow-md'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                }`}
                        >
                            {link.name}
                        </Link>
                    );
                })}
            </nav>
            <div className="p-4 border-t border-gray-800 text-xs text-gray-500 text-center">
                v1.0.0
            </div>
        </aside>
    );
};
