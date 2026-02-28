'use client';
import Link from 'next/link';

export default function CheckoutCancelPage() {
    return (
        <div className="min-h-[60vh] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-sm p-8 text-center border border-red-100">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Cancelled</h1>
                <p className="text-gray-500 mb-8">
                    Your payment was cancelled and your card was not charged. Your items are still saved in your cart.
                </p>

                <Link
                    href="/checkout"
                    className="inline-block bg-gray-900 hover:bg-gray-800 text-white font-semibold px-8 py-3 rounded-xl transition"
                >
                    Return to Checkout
                </Link>
            </div>
        </div>
    );
}
