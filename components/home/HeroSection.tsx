'use client';

import { useState, useEffect } from 'react';

export default function HeroSection() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="relative bg-white dark:bg-black overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-black dark:to-red-950"></div>
      
      {/* Hero Image with Parallax */}
      <div 
        className="absolute inset-0 opacity-0 dark:opacity-20"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600&q=80')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transform: `translateY(${scrollY * 0.5}px)`,
        }}
      ></div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="min-h-[90vh] flex flex-col justify-center py-24 sm:py-32">
          {/* Eyebrow */}
          <div className="mb-6 animate-fade-in">
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm font-medium">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
              Now offering online courses
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold tracking-tight text-gray-900 dark:text-white mb-8 animate-slide-up">
            Experience Philly
            <br />
            <span className="bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
              Through Food
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mb-12 leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Master iconic dishes with step-by-step video courses.
            <br />
            Cook with authentic ingredients delivered to your door.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <a 
              href="/academy" 
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-black dark:bg-white dark:text-black rounded-full overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            >
              <span className="relative z-10">Explore Academy</span>
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </a>
            <a 
              href="/shop" 
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-black dark:text-white bg-transparent border-2 border-gray-300 dark:border-gray-700 rounded-full hover:border-black dark:hover:border-white transition-all duration-300 hover:scale-105"
            >
              Shop Products
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-3 gap-8 max-w-2xl animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 dark:text-white">12+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Courses</div>
            </div>
            <div className="text-center border-l border-r border-gray-200 dark:border-gray-700">
              <div className="text-4xl font-bold text-gray-900 dark:text-white">5K+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Students</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 dark:text-white">4.9</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg className="w-6 h-6 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
}