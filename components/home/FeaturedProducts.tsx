'use client';

import { useCartContext } from '@/context/CartContext';
import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export const FeaturedProducts = () => {
    const { addItem } = useCartContext();

    const products = [
        { id: 'p1', name: 'Signature Secret Sauce', category: 'sauces', price: 12.99, img: 'https://images.unsplash.com/photo-1599813958994-1a3b914856f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
        { id: 'p2', name: 'Original Cheesesteak Kit', category: 'kits', price: 65.00, img: 'https://images.unsplash.com/photo-1574213038661-bc8ee08b04a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
        { id: 'p3', name: 'Philly Spice Blend', category: 'tools', price: 9.50, img: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
        { id: 'p4', name: 'Chef Canvas Apron', category: 'merchandise', price: 35.00, img: 'https://images.unsplash.com/photo-1583337225181-ed6a1334c9f7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' }
    ];

    return (
        <section className="py-24 bg-gray-50 border-y border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">Bring the <span className="text-green-600">Flavor</span> Home</h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">Shop our authentic kits, sauces, and culinary tools. Shipped nationally across the US.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 hover:cursor-pointer">
                    {products.map(product => (
                        <div key={product.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 group">
                            <Link href={`/shop/${product.id}`} className="block relative aspect-square overflow-hidden bg-gray-100">
                                <img src={product.img} alt={product.name} className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-500" />
                            </Link>
                            <div className="p-6">
                                <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-2">{product.category}</p>
                                <Link href={`/shop/${product.id}`}>
                                    <h3 className="text-lg font-bold text-gray-900 mb-1 leading-snug group-hover:text-green-600 transition">{product.name}</h3>
                                </Link>
                                <div className="flex items-center justify-between mt-4">
                                    <span className="text-xl font-extrabold text-gray-900">${product.price.toFixed(2)}</span>
                                    <button
                                        onClick={() => addItem({
                                            itemId: product.id,
                                            type: 'product',
                                            name: product.name,
                                            price: product.price,
                                            quantity: 1,
                                            image: product.img,
                                            isDigital: false
                                        })}
                                        className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-green-600 hover:text-white transition shadow-sm"
                                        aria-label="Add to cart"
                                    >
                                        <ShoppingBag className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <Link href="/shop" className="inline-flex items-center justify-center px-8 py-4 border-2 border-gray-900 text-gray-900 font-bold rounded-full hover:bg-gray-900 hover:text-white transition-colors">
                        View All Products
                    </Link>
                </div>
            </div>
        </section>
    );
};
