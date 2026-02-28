import { getActiveProducts } from '@/services/server/productService';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';

export const revalidate = 3600;

export default async function ShopPage() {
  const products = await getActiveProducts();

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="pt-24 pb-16 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">The Shop</h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Official Philly Culture gear, proprietary sauce kits, and premium merchandise.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <Link href={`/shop/${product.slug}`} key={product.productId} className="group block">
              <div className="bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 transition-all hover:border-amber-500 hover:shadow-2xl">
                <div className="aspect-square relative overflow-hidden bg-zinc-800">
                  {product.images?.[0] ? (
                    <img src={product.images[0]} alt={product.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600">No Image</div>
                  )}
                  {product.stock < 10 && product.stock > 0 && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                      Low Stock
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-lg font-bold group-hover:text-amber-500 transition-colors line-clamp-1">{product.name}</h2>
                  </div>
                  <div className="text-amber-500 font-bold">${product.price}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center text-zinc-500 py-20">
            No products available right now. Check back soon.
          </div>
        )}
      </main>
    </div>
  );
}