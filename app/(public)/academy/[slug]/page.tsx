import { getCourseBySlug, getCourseLessons } from '@/services/server/courseService';
import { notFound } from 'next/navigation';
import { Header } from '@/components/layout/Header';

export const revalidate = 3600;

export default async function CourseDetailPage({ params }: { params: { slug: string } }) {
    const course = await getCourseBySlug(params.slug);

    if (!course) {
        notFound();
    }

    const lessons = await getCourseLessons(course.courseId);

    return (
        <div className="min-h-screen bg-black text-white">
            <Header />
            <main className="pt-24 pb-16">
                {/* Hero */}
                <div className="bg-zinc-900 border-b border-zinc-800">
                    <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <span className="text-amber-500 font-bold tracking-wider uppercase text-sm mb-4 block">
                                {course.difficulty} • {lessons.length} Lessons
                            </span>
                            <h1 className="text-4xl md:text-5xl font-bold mb-6">{course.title}</h1>
                            <p className="text-lg text-zinc-400 mb-8 leading-relaxed">
                                {course.description}
                            </p>
                            <div className="flex items-center gap-4">
                                <button className="bg-amber-500 hover:bg-amber-400 text-black font-bold py-4 px-8 rounded-lg transition-colors text-lg">
                                    Enroll Now for ${course.price}
                                </button>
                            </div>
                        </div>
                        <div className="aspect-video bg-zinc-800 rounded-xl overflow-hidden border border-zinc-700 shadow-2xl relative">
                            {course.thumbnailURL ? (
                                <img src={course.thumbnailURL} alt={course.title} className="object-cover w-full h-full" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-600">Course Preview</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Curriculum */}
                <div className="max-w-4xl mx-auto px-4 py-16">
                    <h2 className="text-3xl font-bold mb-8">Course Curriculum</h2>
                    <div className="space-y-4">
                        {lessons.length > 0 ? (
                            lessons.map((lesson, idx) => (
                                <div key={lesson.lessonId} className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg flex justify-between items-center group hover:border-zinc-600 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-full bg-black border border-zinc-700 flex items-center justify-center text-sm font-bold text-zinc-500 group-hover:text-amber-500 group-hover:border-amber-500 transition-colors">
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">{lesson.title}</h3>
                                            <p className="text-sm text-zinc-500">{lesson.description}</p>
                                        </div>
                                    </div>
                                    <div className="text-sm text-zinc-500 font-mono">
                                        {Math.floor(lesson.durationInSeconds / 60)}:{(lesson.durationInSeconds % 60).toString().padStart(2, '0')}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-zinc-500 italic">Curriculum is currently being structured.</p>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
