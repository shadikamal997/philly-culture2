import { Metadata } from 'next';
import { HeroSection } from '@/components/home/HeroSection';
import { FeaturedCourses } from '@/components/home/FeaturedCourses';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { StorySection } from '@/components/home/StorySection';
import { HowItWorks } from '@/components/home/HowItWorks';
import { Testimonials } from '@/components/home/Testimonials';
import { EmailCapture } from '@/components/home/EmailCapture';
import { BlogPreview } from '@/components/home/BlogPreview';
import { FinalCTA } from '@/components/home/FinalCTA';

export const metadata: Metadata = {
  title: 'Philly Culture Update | Online Cooking Classes & Signature Food Kits',
  description: 'Experience authentic Philadelphia food culture. Buy our signature physical food kits or master iconic dishes with our online step-by-step video courses.',
  keywords: 'Philadelphia cooking classes online, Philly cheesesteak course, Buy Philly food kits, Authentic Italian-American recipes, American cultural cooking classes',
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col font-sans">

      {/* 1. Emotion & Main Conversion Drivers */}
      <HeroSection />

      {/* 2. High Margin Product Highlights */}
      <FeaturedCourses />

      {/* 3. Physical E-commerce Offerings */}
      <FeaturedProducts />

      {/* 4. Brand Trust & Authenticity */}
      <StorySection />

      {/* 5. Simplified Workflow Explanation */}
      <HowItWorks />

      {/* 6. Social Proof */}
      <Testimonials />

      {/* 7. Retargeting Asset Collection */}
      <EmailCapture />

      {/* 8. Content Marketing & SEO */}
      <BlogPreview />

      {/* 9. Safety Net CTA */}
      <FinalCTA />

    </main>
  );
}