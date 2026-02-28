import { getProductBySlug } from '@/services/server/productService';
import { notFound } from 'next/navigation';
import { Header } from '@/components/layout/Header';

export const revalidate = 3600;

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
    const product = await getProductBySlug(params.slug);

    if (!product) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-black text-white">
            <Header />
            <main className="pt-24 pb-16 px-4 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Gallery */}
                    <div className="space-y-4">
                        <div className="aspect-square bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 flex items-center justify-center">
                            {product.images?.[0] ? (
                                <img src={product.images[0]} alt={product.name} className="object-cover w-full h-full" />
                            ) : (
                                <div className="text-zinc-600 text-xl font-bold border-2 border-dashed border-zinc-700 m-8 rounded-lg w-full h-full flex items-center justify-center">Product Image</div>
                            )}
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex flex-col justify-center">
                        <nav className="text-sm text-zinc-500 mb-6">
                            Home / Shop / <span className="text-white">{product.name}</span>
                        </nav>
                        <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
                        <div className="text-3xl text-amber-500 font-bold mb-6">${product.price}</div>

                        <div className="prose prose-invert border-t border-zinc-800 pt-6 mb-8 text-zinc-400">
                            <p>{product.description}</p>
                        </div>

                        <div className="mb-8">
                            <div className="flex items-center gap-4 text-sm">
                                <span className={`flex items-center gap-2 ${product.stock > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                    {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                                </span>
                            </div>
                        </div>

                        <button
                            disabled={product.stock === 0}
                            className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-4 px-8 rounded-lg transition-colors text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {product.stock > 0 ? 'Add to Cart' : 'Sold Out'}
                        </button>

                        <div className="mt-8 grid grid-cols-2 gap-4 text-sm text-zinc-400 border-t border-zinc-800 pt-8">
                            <div>
                                <strong className="text-white block mb-1">Shipping</strong>
                                Ships nationwide within 3-5 business days. Local pickup available in Philly.
                            </div>
                            <div>
                                <strong className="text-white block mb-1">Returns</strong>
                                14-day return policy for unopened items.
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
