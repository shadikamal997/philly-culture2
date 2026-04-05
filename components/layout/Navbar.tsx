"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect, useRef } from "react";

const AnimatedNavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  const defaultTextColor = 'text-gray-700';
  const hoverTextColor = 'text-black';
  const textSizeClass = 'text-sm';

  return (
    <Link href={href} className={`group relative inline-block overflow-hidden h-5 flex items-center ${textSizeClass}`}>
      <div className="flex flex-col transition-transform duration-400 ease-out transform group-hover:-translate-y-1/2">
        <span className={defaultTextColor}>{children}</span>
        <span className={hoverTextColor}>{children}</span>
      </div>
    </Link>
  );
};

export default function Navbar() {
  const { user, userData, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [headerShapeClass, setHeaderShapeClass] = useState('rounded-full');
  const shapeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = async () => {
    await logout();
    setShowDropdown(false);
  };

  useEffect(() => {
    if (shapeTimeoutRef.current) {
      clearTimeout(shapeTimeoutRef.current);
    }

    if (isOpen) {
      setHeaderShapeClass('rounded-xl');
    } else {
      shapeTimeoutRef.current = setTimeout(() => {
        setHeaderShapeClass('rounded-full');
      }, 300);
    }

    return () => {
      if (shapeTimeoutRef.current) {
        clearTimeout(shapeTimeoutRef.current);
      }
    };
  }, [isOpen]);

  const logoElement = (
    <Link href="/" className="font-bold text-lg text-black hover:text-gray-700 transition-colors">
      Philly Culture
    </Link>
  );

  const navLinksData = [
    { label: 'Programs', href: '/programs' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  const loginButtonElement = (
    <Link href="/login" className="px-4 py-2 sm:px-3 text-xs sm:text-sm border border-gray-300 bg-white/80 text-gray-700 rounded-full hover:border-black hover:text-black transition-colors duration-200 w-full sm:w-auto text-center">
      Login
    </Link>
  );

  const userMenuElement = user ? (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white/80 text-gray-700 rounded-full hover:border-black hover:text-black transition-colors duration-200"
      >
        <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs">
          {(user.displayName || userData?.displayName || user.email || 'U').charAt(0).toUpperCase()}
        </div>
        <span className="hidden sm:inline text-sm">{user.displayName || userData?.displayName || user.email}</span>
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
  ) : null;

  return (
    <header className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50
                       flex flex-col items-center
                       pl-6 pr-6 py-3 backdrop-blur-md
                       ${headerShapeClass}
                       border border-gray-200 bg-white/90 shadow-lg
                       w-[calc(100%-2rem)] sm:w-auto
                       transition-[border-radius] duration-0 ease-in-out`}>

      <div className="flex items-center justify-between w-full gap-x-6 sm:gap-x-8">
        <div className="flex items-center">
          {logoElement}
        </div>

        <nav className="hidden sm:flex items-center space-x-4 sm:space-x-6 text-sm">
          {navLinksData.map((link) => (
            <AnimatedNavLink key={link.href} href={link.href}>
              {link.label}
            </AnimatedNavLink>
          ))}
        </nav>

        <div className="hidden sm:flex items-center gap-2 sm:gap-3">
          {user ? userMenuElement : loginButtonElement}
        </div>

        <button className="sm:hidden flex items-center justify-center w-8 h-8 text-gray-700 focus:outline-none" onClick={toggleMenu} aria-label={isOpen ? 'Close Menu' : 'Open Menu'}>
          {isOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          )}
        </button>
      </div>

      <div className={`sm:hidden flex flex-col items-center w-full transition-all ease-in-out duration-300 overflow-hidden
                       ${isOpen ? 'max-h-[1000px] opacity-100 pt-4' : 'max-h-0 opacity-0 pt-0 pointer-events-none'}`}>
        <nav className="flex flex-col items-center space-y-4 text-base w-full">
          {navLinksData.map((link) => (
            <Link key={link.href} href={link.href} className="text-gray-700 hover:text-black transition-colors w-full text-center">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-col items-center space-y-4 mt-4 w-full">
          {user ? (
            <>
              <Link href="/dashboard" className="text-gray-700 hover:text-black transition-colors w-full text-center">
                Dashboard
              </Link>
              {userData?.role === 'owner' && (
                <Link href="/admin" className="text-gray-700 hover:text-black transition-colors w-full text-center">
                  Admin
                </Link>
              )}
              <Link href="/profile" className="text-gray-700 hover:text-black transition-colors w-full text-center">
                Profile
              </Link>
              <button onClick={handleLogout} className="text-red-600 hover:text-red-700 transition-colors w-full text-center">
                Logout
              </button>
            </>
          ) : (
            loginButtonElement
          )}
        </div>
      </div>
    </header>
  );
}
