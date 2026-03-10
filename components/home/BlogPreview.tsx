import Link from 'next/link';
import Image from 'next/image';

export const BlogPreview = () => {
    const articles = [
        { title: "The Untold History of the Philly Cheesesteak", category: "History", image: "https://images.unsplash.com/photo-1596649283733-030ec6062f6b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", slug: "history-of-cheesesteak" },
        { title: "Italian-American Traditions Passed Down Through Food", category: "Culture", image: "https://images.unsplash.com/photo-1512152272829-410e3d360980?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", slug: "italian-american-traditions" },
        { title: "5 Essential Chef Tips for Perfectly Sliced Ribeye", category: "Technique", image: "https://images.unsplash.com/photo-1558030006-450675393462?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", slug: "chef-tips" }
    ];

    return (
        <section className="py-24 bg-white dark:bg-black">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-4">
                    <div>
                        <span className="inline-block px-4 py-2 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-sm font-semibold mb-4">
                            From the Journal
                        </span>
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2">
                            Philly Food Stories
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-400">
                            Culture, techniques, and the history behind the recipes
                        </p>
                    </div>
                    <Link 
                        href="/blog" 
                        className="inline-flex items-center font-semibold text-red-600 dark:text-red-400 hover:translate-x-1 transition-transform"
                    >
                        Read All Articles
                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {articles.map((article, idx) => (
                        <Link 
                            key={idx} 
                            href={`/blog/${article.slug}`}
                            className="group block"
                        >
                            <div className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-200 dark:border-gray-800">
                                <div className="aspect-[4/3] relative overflow-hidden bg-gray-100 dark:bg-gray-800">
                                    <Image
                                        src={article.image}
                                        alt={article.title}
                                        fill
                                        className="object-cover group-hover:scale-110 transform transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                                    <div className="absolute top-4 left-4">
                                        <span className="inline-block bg-white/90 dark:bg-black/90 text-gray-900 dark:text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                            {article.category}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors leading-snug">
                                        {article.title}
                                    </h3>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};
