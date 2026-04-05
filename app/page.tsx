'use client';

import NewHero from '@/components/home/NewHero';
import FeaturedCourses from '@/components/home/FeaturedCourses';
import HowItWorks from '@/components/home/HowItWorks';
import StorySection from '@/components/home/StorySection';
import Testimonials from '@/components/home/Testimonials';
import EmailCapture from '@/components/home/EmailCapture';

export default function Home() {
  return (
    <main className="overflow-x-hidden -mt-16">
      {/* Hero Section with Marquee and Stats */}
      <NewHero />
      
      {/* Featured Courses */}
      <FeaturedCourses />
      
      {/* How It Works */}
      <HowItWorks />
      
      {/* Brand Story */}
      <StorySection />
      
      {/* Testimonials */}
      <Testimonials />
      
      {/* Email Capture */}
      <EmailCapture />
    </main>
  );
}
