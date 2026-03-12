"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

export default function Navbar() {
  const { user, userData, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = async () => {
    await logout();
    setShowDropdown(false);
  };

  return (
    <header className="fixed top-0 w-full bg-white text-black shadow-md z-50 h-16">
      <div className="max-w-6xl mx-auto flex justify-between items-center px-6 h-full">
        <Link href="/" className="font-bold text-lg">
          Philly Culture Academy
        </Link>

        <nav className="flex gap-6 text-sm items-center">
          <Link href="/programs" className="hover:text-red-500 transition-colors">
            Programs
          </Link>
          <Link href="/about" className="hover:text-red-500 transition-colors">
            About
          </Link>
          <Link href="/contact" className="hover:text-red-500 transition-colors">
            Contact
          </Link>
          
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 hover:text-red-500 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center">
                  {(user.displayName || userData?.displayName || user.email || 'U').charAt(0).toUpperCase()}
                </div>
                <span>{user.displayName || userData?.displayName || user.email}</span>
              </button>
              
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-lg shadow-lg py-2">
                  <Link
                    href="/dashboard"
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={() => setShowDropdown(false)}
                  >
                    Dashboard
                  </Link>
                  {userData?.role === 'owner' && (
                    <Link
                      href="/admin"
                      className="block px-4 py-2 hover:bg-gray-100"
                      onClick={() => setShowDropdown(false)}
                    >
                      Admin
                    </Link>
                  )}
                  <Link
                    href="/profile"
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={() => setShowDropdown(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="hover:text-red-500 transition-colors">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
