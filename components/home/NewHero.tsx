"use client";

import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Marquee } from "@/components/ui/marquee";
import { ProgramSlider } from "@/components/ui/program-slider";

const stats = [
  { label: "STUDENTS TRAINED", value: "5,000+" },
  { label: "COURSES COMPLETED", value: "200+" },
  { label: "AVERAGE RATING", value: "4.9/5" },
];

const programs = [
  {
    image: "https://images.unsplash.com/photo-1556910096-6f5e72db6803?w=600&h=800&fit=crop",
    category: "CULINARY BASICS",
    title: "Essential Cooking Techniques",
  },
  {
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=800&fit=crop",
    category: "STREET FOOD",
    title: "Philly Cheesesteak Mastery",
  },
  {
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=800&fit=crop",
    category: "FINE DINING",
    title: "Gourmet Plating & Presentation",
  },
  {
    image: "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=600&h=800&fit=crop",
    category: "BAKING",
    title: "Artisan Bread Workshop",
  },
  {
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=800&fit=crop",
    category: "INTERNATIONAL",
    title: "Global Flavors Exploration",
  },
];

function StatsMarquee() {
  return (
    <Marquee
      className="border-gray-200 border-y bg-gray-50 py-2 [--duration:20s] [--gap:2rem]"
      pauseOnHover
      repeat={4}
    >
      {stats.map((stat) => (
        <div
          className="flex items-center gap-2 whitespace-nowrap px-2"
          key={stat.label}
        >
          <span className="font-bold font-mono text-primary text-sm tracking-tight">
            {stat.value}
          </span>
          <span className="font-medium font-mono text-xs text-gray-600 uppercase tracking-[0.15em]">
            {stat.label}
          </span>
        </div>
      ))}
    </Marquee>
  );
}

export default function Hero() {
  return (
    <section className="relative flex flex-col w-full">
      {/* Hero Background Section */}
      <div className="relative h-screen w-full">
        <div
          className="absolute inset-0 bg-center bg-cover"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1920&q=80)",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        </div>

        {/* Main Hero Content */}
        <div className="relative z-10 h-full flex items-center w-full px-6 sm:px-10 lg:px-20 max-w-7xl mx-auto">
          <div className="flex flex-col gap-8">
            {/* Headline Section */}
            <div className="space-y-6 max-w-4xl">
              <h1 className="font-bold text-5xl text-white leading-[1] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl drop-shadow-2xl">
                Taste the <span className="text-primary">Culture</span>
                <br />
                Live the <span className="text-primary">Tradition</span>
              </h1>
              <p className="text-xl sm:text-2xl md:text-3xl text-white/90 font-light italic tracking-wide">
                — that's Philly
              </p>
              
              {/* CTA Button */}
              <div className="pt-4">
                <Button className="rounded-none py-0 pr-0 font-semibold text-black text-xl bg-primary hover:bg-primary/90 shadow-2xl hover:shadow-primary/50 transition-all duration-300 hover:scale-105">
                  Explore Academy
                  <span className="border-black/20 border-l p-4">
                    <ArrowRight className="w-6 h-6" />
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Program Slider - Full width */}
      <div className="relative w-full bg-white">
        <ProgramSlider programs={programs} />
      </div>

      {/* Stats Marquee - Positioned at bottom */}
      <div className="relative w-full bg-white pb-8">
        <div className="max-w-3xl mx-auto">
          <StatsMarquee />
        </div>
      </div>
    </section>
  );
}
