import Link from 'next/link';
import Image from 'next/image';

export default function FinalCTA() {
  return (
    <section className="relative py-32 px-6 overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <Image 
          src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1600&auto=format&fit=crop" 
          alt="Cooking" 
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/80"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
          Start Your Culinary Journey Today
        </h2>
        <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
          Join thousands of home chefs mastering authentic Philadelphia cuisine through our expert-led courses
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link 
            href="/academy" 
            className="px-10 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full text-lg transition-all hover:shadow-2xl hover:scale-105"
          >
            Explore Academy
          </Link>
          <Link 
            href="/shop" 
            className="px-10 py-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-bold rounded-full text-lg border-2 border-white/30 transition-all hover:shadow-2xl"
          >
            Shop Products
          </Link>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
          <div>
            <div className="text-4xl font-bold text-white mb-2">5K+</div>
            <div className="text-white/70 text-sm">Active Students</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-white mb-2">12+</div>
            <div className="text-white/70 text-sm">Expert Courses</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-white mb-2">4.9</div>
            <div className="text-white/70 text-sm">Average Rating</div>
          </div>
        </div>
      </div>
    </section>
  );
}