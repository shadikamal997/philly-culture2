import Link from 'next/link';

export const BlogPreview = () => {
    const articles = [
        { title: "The Untold History of the Philly Cheesesteak", category: "History", image: "https://images.unsplash.com/photo-1596649283733-030ec6062f6b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", slug: "history-of-cheesesteak" },
        { title: "Italian-American Traditions Passed Down Through Food", category: "Culture", image: "https://images.unsplash.com/photo-1512152272829-410e3d360980?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", slug: "italian-american-traditions" },
        { title: "5 Essential Chef Tips for Perfectly Sliced Ribeye", category: "Technique", image: "https://images.unsplash.com/photo-1558030006-450675393462?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", slug: "chef-tips" }
    ];

    return (
        <section className="py-24 bg-white border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-4xl font-extrabold text-gray-900">Philly Food Stories</h2>
                        <p className="mt-2 text-gray-500 text-lg">Culture, techniques, and the history behind the recipes.</p>
                    </div>
                    <Link href="/blog" className="hidden md:block font-bold text-green-600 hover:text-green-700">Read All Articles &rarr;</Link>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {articles.map((article, idx) => (
                        <div key={idx} className="group cursor-pointer">
                            <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-5">
                                <img
                                    src={article.image}
                                    alt={article.title}
                                    className="w-full h-full object-cover transform group-hover:scale-105 transition duration-500"
                                />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider text-green-600 mb-2 block">{article.category}</span>
                            <Link href={`/blog/${article.slug}`}>
                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition leading-snug">{article.title}</h3>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
