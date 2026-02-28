'use client';
import Link from 'next/link';
import { useEffect } from 'react';
import { useCartContext } from '@/context/CartContext';

export default function CheckoutSuccessPage() {
    const { clearCart } = useCartContext();

    // Clear cart upon successful landing here
    useEffect(() => {
        clearCart();
    }, [clearCart]);

    return (
        <div className="min-h-[70vh] flex items-center justify-center p-4 bg-gray-50">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-gray-100 transform transition-all hover:scale-[1.01]">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <svg className="w-10 h-10 text-green-600 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                </div>

                <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Order Confirmed!</h1>
                <p className="text-gray-500 mb-8 leading-relaxed">
                    Thank you for your purchase. We have received your order and are processing it right now.
                </p>

                <div className="space-y-4">
                    <Link
                        href="/dashboard/my-courses"
                        className="block w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl transition shadow shadow-green-200"
                    >
                        Go to My Courses
                    </Link>
                    <Link
                        href="/"
                        className="block w-full bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 font-bold py-3.5 rounded-xl transition"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
}
