import Link from 'next/link';

export const FinalCTA = () => {
    return (
        <section className="bg-gray-900 py-32 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-20"></div>
            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6">
                <h2 className="text-5xl md:text-6xl font-extrabold mb-8 tracking-tight">Start Your Culinary Journey Today</h2>
                <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto font-medium">Whether you're looking to learn techniques passed down through generations, or just want authentic kits delivered fast.</p>
                <div className="flex justify-center items-center gap-6">
                    <Link href="/academy" className="px-10 py-5 bg-green-500 hover:bg-green-600 rounded-full font-extrabold text-lg text-white shadow-xl hover:shadow-2xl transition">
                        Explore Academy
                    </Link>
                    <Link href="/shop" className="px-10 py-5 bg-transparent border-2 border-white/30 hover:border-white rounded-full font-extrabold text-lg text-white transition">
                        Shop Ingredients
                    </Link>
                </div>
            </div>
        </section>
    );
};
