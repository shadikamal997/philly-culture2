"use client";

import Link from "next/link";
import { Equal, X } from "lucide-react";
import { Button } from "@/components/ui/liquid-glass-button";
import React from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, userData, logout } = useAuth();
  const [menuState, setMenuState] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [showDropdown, setShowDropdown] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    setShowDropdown(false);
  };

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const menuItems = [
    { name: "Programs", href: "/programs" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <header>
      <nav
        data-state={menuState && "active"}
        className="fixed left-0 w-full z-50 px-2"
      >
        <div
          className={cn(
            "mx-auto mt-2 max-w-6xl px-6 transition-all duration-300 lg:px-12 bg-white/80 backdrop-blur-md border border-gray-100 rounded-2xl shadow-md",
            isScrolled &&
              "bg-white/90 max-w-4xl border-gray-200 lg:px-5 shadow-lg"
          )}
        >
          <div className="relative flex flex-wrap items-center justify-between gap-6 lg:gap-0 py-2">
            <div className="flex w-full justify-between lg:w-auto">
              <Link
                href="/"
                aria-label="home"
                className="flex gap-2 items-center"
              >
                <p className="font-bold text-2xl tracking-tight text-black">
                  Philly Culture
                </p>
              </Link>

              <button
                onClick={() => setMenuState(!menuState)}
                aria-label={menuState == true ? "Close Menu" : "Open Menu"}
                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
              >
                <Equal className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                <X className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
              </button>
            </div>

            <div className="absolute inset-0 m-auto hidden size-fit lg:block">
              <ul className="flex gap-8 text-sm">
                {menuItems.map((item, index) => (
                  <li key={index}>
                    <Link
                      href={item.href}
                      className="text-gray-700 hover:text-black block duration-150 font-medium"
                    >
                      <span>{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white in-data-[state=active]:block lg:in-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none">
              <div className="lg:hidden">
                <ul className="space-y-6 text-base">
                  {menuItems.map((item, index) => (
                    <li key={index}>
                      <Link
                        href={item.href}
                        className="text-gray-700 hover:text-black block duration-150"
                      >
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-2 sm:space-y-0 md:w-fit">
                {user ? (
                  <div className="relative">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDropdown(!showDropdown)}
                      className={cn(isScrolled && "lg:hidden", "cursor-pointer")}
                    >
                      <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs mr-2">
                        {(user.displayName || userData?.displayName || user.email || "U")
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                      <span>{user.displayName || userData?.displayName || user.email}</span>
                    </Button>

                    {showDropdown && (
                      <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                        <Link
                          href="/dashboard"
                          className="block px-4 py-2 hover:bg-gray-100 text-sm"
                          onClick={() => setShowDropdown(false)}
                        >
                          Dashboard
                        </Link>
                        {userData?.role === "owner" && (
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
                  <>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className={cn(isScrolled && "lg:hidden")}
                    >
                      <Link href="/login">
                        <span>Login</span>
                      </Link>
                    </Button>
                    <Button
                      asChild
                      size="sm"
                      className={cn(
                        isScrolled ? "lg:inline-flex" : "hidden lg:inline-flex"
                      )}
                    >
                      <Link href="/login">
                        <span>Get Started</span>
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
