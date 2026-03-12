'use client';

import Hero from '@/components/ui/animated-shader-hero';

export default function HeroSection() {
  return (
    <Hero
      className=""
      headline={{
        line1: "Taste the Culture",
        line2: "Live the Tradition"
      }}
      subtitle="Discover authentic Philly flavors through immersive culinary experiences. From street food classics to gourmet creations, bring the city's soul to your kitchen."
      buttons={{
        primary: {
          text: "Explore Academy",
          href: "/programs"
        }
      }}
    />
  );
}