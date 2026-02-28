import Link from 'next/link';
import { PlayCircle, Clock, ChartBar } from 'lucide-react';

export const FeaturedCourses = () => {
    // Mock data representing what would come from Firestore via getServerSideProps or fetch
    const topCourses = [
        { id: '1', title: 'The Ultimate Philly Cheesesteak', price: 49, duration: '2.5 Hours', difficulty: 'Beginner', img: 'https://images.unsplash.com/photo-1550547660-d9450f859349?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
        { id: '2', title: 'South Philly Italian Hoagies', price: 39, duration: '1.5 Hours', difficulty: 'Intermediate', img: 'https://images.unsplash.com/photo-1614777986387-0b5c92c89284?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
        { id: '3', title: 'Soft Pretzel Masterclass', price: 29, duration: '3 Hours', difficulty: 'Advanced', img: 'https://images.unsplash.com/photo-1599388836511-7299e530263f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    ];

    return (
        <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">Master Philly's <span className="text-green-600">Most Iconic</span> Dishes</h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">Step-by-step video masterclasses led by authentic Philadelphia chefs. Start learning instantly.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {topCourses.map(course => (
                        <div key={course.id} className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
                            <div className="relative h-60 overflow-hidden">
                                <img src={course.img} alt={course.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                                    <PlayCircle className="w-4 h-4 text-green-600" />
                                    <span className="text-xs font-bold text-gray-900">Video Course</span>
                                </div>
                            </div>
                            <div className="p-8">
                                <h3 className="text-2xl font-bold text-gray-900 mb-3 line-clamp-2">{course.title}</h3>

                                <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 border-b border-gray-100 pb-6">
                                    <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {course.duration}</span>
                                    <span className="flex items-center gap-1.5"><ChartBar className="w-4 h-4" /> {course.difficulty}</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-3xl font-extrabold text-gray-900">${course.price}</span>
                                    <Link href={`/academy/${course.id}`} className="px-6 py-3 bg-gray-900 text-white rounded-full font-semibold hover:bg-green-600 transition-colors text-sm">
                                        Enroll Now
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <Link href="/academy" className="inline-flex items-center gap-2 font-bold text-green-600 hover:text-green-700 text-lg group">
                        View All Courses
                        <span className="transform group-hover:translate-x-1 transition-transform">&rarr;</span>
                    </Link>
                </div>
            </div>
        </section>
    );
};
