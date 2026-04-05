'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Program {
  id: string;
  title: string;
  shortDescription: string;
  basePrice: number;
  thumbnail: string;
  totalHours: number;
  slug: string;
  featured?: boolean;
}

export default function FeaturedCourses() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPrograms() {
      try {
        const response = await fetch('/api/programs/featured');
        if (response.ok) {
          const data = await response.json();
          setPrograms(data.programs || []);
        }
      } catch (error) {
        console.error('Error fetching programs:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchPrograms();
  }, []);

  // Map programs to display format
  const displayCourses = programs.slice(0, 3).map(p => ({
    title: p.title,
    description: p.shortDescription,
    price: p.basePrice,
    image: p.thumbnail,
    duration: `${p.totalHours} hours`,
    lessons: 0, // Not tracking lesson count yet
    slug: p.slug,
  }));

  return (
    <section className="py-24 sm:py-32 px-6 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-sm font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide mb-3">
            Online Academy
          </h2>
          <h3 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Master Iconic Philly Dishes
          </h3>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Learn from expert chefs through step-by-step video courses
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          </div>
        ) : displayCourses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg">No programs available yet. Check back soon!</p>
          </div>
        ) : (
          <>
            {/* Course Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayCourses.map((course, index) => (
                <div 
                  key={index}
                  className="group hover-lift rounded-3xl overflow-hidden bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Course Image */}
                  <div className="relative h-64 overflow-hidden">
                    <div 
                      className="absolute inset-0 bg-cover bg-center transform group-hover:scale-110 transition-transform duration-700"
                      style={{ backgroundImage: `url(${course.image})` }}
                    ></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    
                    {/* Price Badge */}
                    <div className="absolute top-4 right-4 bg-white dark:bg-black text-black dark:text-white px-4 py-2 rounded-full font-bold shadow-lg">
                      ${course.price}
                    </div>
                  </div>

                  {/* Course Details */}
                  <div className="p-6">
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                      {course.title}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {course.description}
                    </p>

                    {/* Meta Info */}
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-500 mb-4">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {course.duration}
                      </span>
                      {course.lessons > 0 && (
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          {course.lessons} lessons
                        </span>
                      )}
                    </div>

                    {/* CTA Button */}
                    <Link 
                      href={(course as any).slug ? `/programs/${(course as any).slug}` : "/programs"}
                      className="block w-full text-center px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-full font-semibold hover:bg-red-600 dark:hover:bg-red-500 transition-colors"
                    >
                      Learn More
                    </Link>
              </div>
            </div>
          ))}
        </div>

        {/* View All Link */}
        <div className="text-center mt-12">
          <Link 
            href="/programs" 
            className="inline-flex items-center text-lg font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors group"
          >
            View all programs
            <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </>
        )}
      </div>
    </section>
  );
}