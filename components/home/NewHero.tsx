"use client";

import { ArrowRight, Star, Users, BookOpen } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Marquee } from "@/components/ui/marquee";

const stats = [
  { emoji: "🎓", label: "STUDENTS TRAINED", value: "5,000+", icon: Users },
  { emoji: "📚", label: "COURSES COMPLETED", value: "200+", icon: BookOpen },
  { emoji: "⭐", label: "AVERAGE RATING", value: "4.9/5", icon: Star },
];

function StatsMarquee() {
  return (
    <Marquee
      className="border-white/20 border-y bg-black/40 py-4 backdrop-blur-md [--duration:25s] [--gap:3rem]"
      pauseOnHover
      repeat={4}
    >
      {stats.map((stat) => (
        <div
          className="flex items-center gap-4 whitespace-nowrap px-4"
          key={stat.label}
        >
          <span className="font-black font-mono text-primary text-2xl tracking-tight drop-shadow-lg">
            {stat.value}
          </span>
          <span className="font-semibold font-mono text-base text-white/90 uppercase tracking-[0.2em]">
            {stat.label}
          </span>
          <span className="text-2xl drop-shadow-lg">{stat.emoji}</span>
        </div>
      ))}
    </Marquee>
  );
}

export default function Hero() {
  return (
    <section className="relative flex h-screen w-full flex-col items-start justify-end">
      <div
        className="absolute inset-0 bg-center bg-cover"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1920&q=80)",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
      </div>

      {/* Stats Marquee - Positioned above content */}
      <div className="relative z-10 w-full mb-8">
        <StatsMarquee />
      </div>

      {/* Main Hero Content */}
      <div className="relative z-10 w-full px-6 pb-20 sm:px-10 sm:pb-28 lg:px-20 lg:pb-36 max-w-7xl mx-auto">
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
    </section>
  );
}
