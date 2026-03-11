'use client';

import Hero from '@/components/ui/animated-shader-hero';

export default function HeroSection() {
  return (
    <Hero
      trustBadge={{
        text: "Trusted by 5,000+ food lovers",
        icons: ["🍕", "🥖", "🧀"]
      }}
      headline={{
        line1: "Experience Philly",
        line2: "Through Food"
      }}
      subtitle="Master iconic dishes with step-by-step video courses. Cook with authentic ingredients delivered to your door."
      buttons={{
        primary: {
          text: "Explore Academy",
          href: "/programs"
        },
        secondary: {
          text: "Shop Products",
          href: "/shop"
        }
      }}
      stats={[
        { value: "12+", label: "Courses" },
        { value: "5K+", label: "Students" },
        { value: "4.9", label: "Rating" }
      ]}
    />
  );
}