'use client';

import { usePathname } from 'next/navigation';
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const isDashboard = pathname?.startsWith('/dashboard') || 
                      pathname?.startsWith('/my-courses') || 
                      pathname?.startsWith('/certificates') || 
                      pathname?.startsWith('/orders') || 
                      pathname?.startsWith('/addresses') || 
                      pathname?.startsWith('/profile');
  const isAdmin = pathname?.startsWith('/admin');
  const isOwner = pathname?.startsWith('/owner');
  const hideNavAndFooter = isDashboard || isAdmin || isOwner;

  return (
    <>
      {!hideNavAndFooter && <Navbar />}
      <div className={hideNavAndFooter ? "min-h-screen" : "pt-20 min-h-screen"}>
        {children}
      </div>
      {!hideNavAndFooter && <Footer />}
    </>
  );
}
