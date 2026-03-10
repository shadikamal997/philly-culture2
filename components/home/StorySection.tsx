import Image from 'next/image';

export default function StorySection() {
  return (
    <section className="py-24 px-6 bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-black">
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <div className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl order-2 md:order-1">
            <Image 
              src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&auto=format&fit=crop" 
              alt="Philadelphia Kitchen" 
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          </div>
          
          {/* Content */}
          <div className="order-1 md:order-2">
            <span className="inline-block px-4 py-2 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm font-semibold mb-6">
              Our Story
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Rooted in Philadelphia.<br />Inspired by Culture.
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              We bring the traditions, flavors, and energy of Philly kitchens into your home.
              Learn from real chefs. Cook with real ingredients. Experience culture through food.
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              Every recipe tells a story. Every course celebrates heritage. Every product honors authenticity.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}