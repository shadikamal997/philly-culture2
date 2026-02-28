import Link from 'next/link';

export const HeroSection = () => {
    return (
        <section className="relative w-full h-[85vh] min-h-[600px] flex items-center bg-gray-900 overflow-hidden">
            {/* Background Image Overlay Optional - Using CSS gradient placeholder here */}
            <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-green-900 opacity-90"></div>

            {/* Decorative Texture */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col md:flex-row items-center gap-12">

                {/* Left Side: Copy & Calls to Action */}
                <div className="flex-1 text-center md:text-left space-y-8">
                    <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-tight">
                        Experience <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">Philly Culture</span> Through Food.
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-300 font-medium max-w-2xl">
                        Authentic flavors. Online cooking classes. Signature products delivered directly to your door.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 pt-4">
                        <Link
                            href="/academy"
                            className="w-full sm:w-auto px-8 py-4 bg-green-500 hover:bg-green-600 text-white rounded-full font-bold text-lg shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:shadow-[0_0_25px_rgba(34,197,94,0.6)] transition-all flex justify-center"
                        >
                            Explore Courses
                        </Link>
                        <Link
                            href="/shop"
                            className="w-full sm:w-auto px-8 py-4 bg-transparent border-2 border-white/20 hover:border-white text-white rounded-full font-bold text-lg hover:bg-white/10 transition-all flex justify-center"
                        >
                            Shop Products
                        </Link>
                    </div>
                </div>

                {/* Right Side: Visual Element (e.g. Hero Video Loop / Image Grid) */}
                <div className="hidden lg:block flex-1">
                    <div className="relative w-full aspect-square rounded-3xl overflow-hidden shadow-2xl skew-y-3 transform hover:skew-y-0 transition-transform duration-700">
                        {/* Using a placeholder visual. In real app, put an optimized next/image or video here */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-orange-400 to-green-800 mix-blend-multiply opacity-60"></div>
                        <img
                            src="https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                            alt="Delicious Philly Cheesesteak"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

            </div>
        </section>
    );
};
