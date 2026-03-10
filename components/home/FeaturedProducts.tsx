'use client';

export default function FeaturedProducts() {
  const products = [
    {
      title: 'Signature Cheesesteak Kit',
      description: 'Everything you need to make authentic Philly cheesesteaks at home',
      price: 89,
      image: 'https://images.unsplash.com/photo-1607013251379-e6eecfffe234?w=800&q=80',
      badge: 'Best Seller',
    },
    {
      title: 'Premium Sauce Collection',
      description: 'Our signature sauces and seasonings in one bundle',
      price: 34,
      image: 'https://images.unsplash.com/photo-1472476443507-c7a5948772fc?w=800&q=80',
      badge: 'New',
    },
    {
      title: 'Chef\'s Essentials Bundle',
      description: 'Professional-grade tools and ingredients for home cooks',
      price: 129,
      image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80',
      badge: 'Premium',
    },
  ];

  return (
    <section className="py-24 sm:py-32 px-6 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-sm font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide mb-3">
            Shop
          </h2>
          <h3 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Bring the Flavor Home
          </h3>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Authentic ingredients and tools delivered to your door
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <div 
              key={index}
              className="group relative overflow-hidden rounded-3xl bg-white dark:bg-gray-900 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 animate-scale-in"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {/* Product Image */}
              <div className="relative h-80 overflow-hidden">
                <div 
                  className="absolute inset-0 bg-cover bg-center transform group-hover:scale-110 transition-transform duration-700"
                  style={{ backgroundImage: `url(${product.image})` }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                
                {/* Badge */}
                <div className="absolute top-4 left-4">
                  <span className="inline-block bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {product.badge}
                  </span>
                </div>

                {/* Quick Add Button */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button className="bg-white dark:bg-black text-black dark:text-white px-6 py-2 rounded-full font-semibold shadow-xl hover:bg-red-600 hover:text-white transition-colors">
                    Quick Add
                  </button>
                </div>
              </div>

              {/* Product Details */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                    {product.title}
                  </h4>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${product.price}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {product.description}
                </p>

                {/* View Product Link */}
                <a 
                  href="/shop"
                  className="inline-flex items-center text-sm font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors group/link"
                >
                  View Product
                  <svg className="w-4 h-4 ml-1 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Browse All Link */}
        <div className="text-center mt-12">
          <a 
            href="/shop" 
            className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-black dark:bg-white dark:text-black rounded-full hover:bg-red-600 dark:hover:bg-red-500 transition-all duration-300 hover:scale-105 shadow-lg"
          >
            Browse All Products
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}