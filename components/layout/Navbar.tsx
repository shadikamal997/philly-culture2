"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

const AnimatedNavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  const defaultTextColor = 'text-gray-700';
  const hoverTextColor = 'text-black';

  return (
    <Link href={href} className={`group relative inline-block overflow-hidden h-6 flex items-center text-base`}>
      <div className="flex flex-col transition-transform duration-400 ease-out transform group-hover:-translate-y-1/2">
        <span className={defaultTextColor}>{children}</span>
        <span className={hoverTextColor}>{children}</span>
      </div>
    </Link>
  );
};

export default function Navbar() {
  const { user, userData, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = async () => {
    await logout();
    setShowDropdown(false);
  };

  const navLinksData = [
    { label: 'Programs', href: '/programs' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <>
      {/* Logo - Fixed on left side */}
      <div className="fixed top-8 left-8 z-50">
        <Link href="/" className="font-bold text-2xl text-black hover:text-gray-700 transition-colors">
          Philly Culture
        </Link>
      </div>

      {/* Floating Navbar - Centered */}
      <header className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50
                         flex items-center
                         px-8 py-4 backdrop-blur-md
                         rounded-full
                         border border-gray-200 bg-white/90 shadow-lg">

        <nav className="flex items-center space-x-8">
          {navLinksData.map((link) => (
            <AnimatedNavLink key={link.href} href={link.href}>
              {link.label}
            </AnimatedNavLink>
          ))}
        </nav>

        <div className="flex items-center gap-4 ml-8 pl-8 border-l border-gray-200">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 bg-white/80 text-gray-700 rounded-full hover:border-black hover:text-black transition-colors duration-200"
              >
                <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center text-sm">
                  {(user.displayName || userData?.displayName || user.email || 'U').charAt(0).toUpperCase()}
                </div>
                <span className="text-base">{user.displayName || userData?.displayName || user.email}</span>
              </button>
              
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                  <Link
                    href="/dashboard"
                    className="block px-4 py-2 hover:bg-gray-100 text-sm"
                    onClick={() => setShowDropdown(false)}
                  >
                    Dashboard
                  </Link>
                  {userData?.role === 'owner' && (
                    <Link
                      href="/admin"
                      className="block px-4 py-2 hover:bg-gray-100 text-sm"
                      onClick={() => setShowDropdown(false)}
                    >
                      Admin
                    </Link>
                  )}
                  <Link
                    href="/profile"
                    className="block px-4 py-2 hover:bg-gray-100 text-sm"
                    onClick={() => setShowDropdown(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600 text-sm"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="px-5 py-2.5 text-base border border-gray-300 bg-white/80 text-gray-700 rounded-full hover:border-black hover:text-black transition-colors duration-200">
              Login
            </Link>
          )}
        </div>
      </header>
    </>
  );
}
