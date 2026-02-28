import { getPublishedCourses } from '@/services/server/courseService';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';

export const revalidate = 3600; // Cache for 1 hour

export default async function AcademyPage() {
  const courses = await getPublishedCourses();

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="pt-24 pb-16 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">The Academy</h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Master the art of Philadelphia culture. Learn authentic recipes, business tactics, and history.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map(course => (
            <Link href={`/academy/${course.slug}`} key={course.courseId} className="group block">
              <div className="bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 transition-all hover:border-amber-500 hover:shadow-2xl hover:-translate-y-1">
                <div className="aspect-video relative overflow-hidden bg-zinc-800">
                  {course.thumbnailURL ? (
                    <img src={course.thumbnailURL} alt={course.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600">No Image</div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <span className="bg-amber-500/10 text-amber-500 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
                      {course.difficulty}
                    </span>
                    <span className="font-bold text-lg">${course.price}</span>
                  </div>
                  <h2 className="text-xl font-bold mb-2 group-hover:text-amber-500 transition-colors">{course.title}</h2>
                  <p className="text-zinc-400 text-sm line-clamp-2">{course.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {courses.length === 0 && (
          <div className="text-center text-zinc-500 py-20">
            No courses published yet. Check back soon.
          </div>
        )}
      </main>
    </div>
  );
}