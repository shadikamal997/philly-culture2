"use client";

import { Marquee } from "@/components/ui/marquee";
import { ProgramSlider } from "@/components/ui/program-slider";

const stats = [
  { label: "STUDENTS TRAINED", value: "5,000+" },
  { label: "COURSES COMPLETED", value: "200+" },
  { label: "AVERAGE RATING", value: "4.9/5" },
];

const programs = [
  {
    image: "/images/slider/photo1.jpg",
    category: "CLASSES",
    title: "Cooking Class",
  },
  {
    image: "/images/slider/photo3.jpg",
    category: "FAMILY",
    title: "Family Cooking",
  },
  {
    image: "/images/slider/photo2.jpg",
    category: "WORKSHOP",
    title: "Vegetable Prep",
  },
  {
    image: "/images/slider/photo5.jpg",
    category: "LESSONS",
    title: "Kitchen Skills",
  },
  {
    image: "/images/slider/photo6.jpg",
    category: "CULINARY",
    title: "Traditional Kitchen",
  },
];

function StatsMarquee() {
  return (
    <Marquee
      className="border-gray-200 border-y bg-gray-50 py-4 [--duration:20s] [--gap:3rem]"
      pauseOnHover
      repeat={4}
    >
      {stats.map((stat) => (
        <div
          className="flex items-center gap-3 whitespace-nowrap px-4"
          key={stat.label}
        >
          <span className="font-bold font-mono text-primary text-3xl tracking-tight">
            {stat.value}
          </span>
          <span className="font-medium font-mono text-base text-gray-600 uppercase tracking-[0.15em]">
            {stat.label}
          </span>
        </div>
      ))}
    </Marquee>
  );
}

export default function Hero() {
  return (
    <section className="flex flex-col w-full">
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
            </div>
          </div>
        </div>

        {/* Stats Marquee - At bottom of hero image */}
        <div className="absolute bottom-0 left-0 right-0 z-20">
          <StatsMarquee />
        </div>
      </div>

      {/* Program Slider - Full width */}
      <div className="relative w-full bg-white">
        <ProgramSlider programs={programs} />
      </div>
    </section>
  );
}
