'use client';
import { useState } from 'react';
import { useCartContext } from '@/context/CartContext';
import { CheckoutButton } from '@/components/checkout/CheckoutButton';
import Link from 'next/link';

export default function CheckoutPage() {
    const { items, subtotal, hasPhysicalItems } = useCartContext();

    // Validation state
    const [shippingInfo, setShippingInfo] = useState({
        fullName: '', addressLine1: '', addressLine2: '', city: '', state: '', zip: '', phone: ''
    });

    const [customerInfo, setCustomerInfo] = useState({ email: '', fullName: '' });

    // Simplified tax logic for frontend (DO NOT TRUST for backend)
    const tax = subtotal * 0.08;
    const shipping = hasPhysicalItems ? (subtotal >= 50 ? 0 : 7.00) : 0;
    const total = subtotal + tax + shipping;

    const handleValidationFail = () => {
        alert("Please fill out all required shipping fields before processing.");
    };

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">Your cart is empty</h1>
                <p className="text-gray-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
                <Link href="/" className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full font-medium transition shadow-sm">
                    Continue Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-8">Checkout Securely</h1>

            <div className="flex flex-col lg:flex-row gap-12">
                {/* LEFT COLUMN: Forms */}
                <div className="lg:w-2/3 space-y-8">

                    {/* Section 1: Customer Contact Info */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800">1. Contact Information</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                                <input
                                    type="email"
                                    placeholder="you@example.com"
                                    value={customerInfo.email}
                                    onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                                <input
                                    type="text"
                                    value={customerInfo.fullName}
                                    onChange={(e) => setCustomerInfo({ ...customerInfo, fullName: e.target.value })}
                                    placeholder="Jane Doe"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Shipping (Conditional) */}
                    {hasPhysicalItems && (
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 animate-fade-in-up">
                            <h2 className="text-2xl font-bold mb-6 text-gray-800">2. Shipping Address</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 1 *</label>
                                    <input type="text" onChange={(e) => setShippingInfo({ ...shippingInfo, addressLine1: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 2 (Optional)</label>
                                    <input type="text" onChange={(e) => setShippingInfo({ ...shippingInfo, addressLine2: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                                    <input type="text" onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                                        <input type="text" onChange={(e) => setShippingInfo({ ...shippingInfo, state: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code *</label>
                                        <input type="text" onChange={(e) => setShippingInfo({ ...shippingInfo, zip: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {!hasPhysicalItems && (
                        <div className="bg-green-50 p-6 rounded-2xl border border-green-100 flex items-center space-x-4 text-green-800">
                            <svg className="w-6 h-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="font-medium text-sm">Your cart contains only digital courses. No shipping address is required and access will be granted immediately upon payment.</p>
                        </div>
                    )}

                </div>

                {/* RIGHT COLUMN: Order Summary Floating Panel */}
                <div className="lg:w-1/3">
                    <div className="bg-gray-50 p-8 rounded-2xl sticky top-8 border border-gray-200">
                        <h2 className="text-xl font-bold mb-6 border-b border-gray-200 pb-4 text-gray-800">Order Summary</h2>

                        <div className="space-y-4 mb-8 max-h-64 overflow-y-auto pr-2">
                            {items.map(item => (
                                <div key={item.itemId} className="flex justify-between items-start text-sm">
                                    <div className="flex-1 pr-4">
                                        <p className="font-medium text-gray-900 truncate" title={item.name}>{item.name}</p>
                                        <p className="text-gray-500">Qty: {item.quantity}</p>
                                    </div>
                                    <p className="font-semibold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-3 pt-6 border-t border-gray-200 text-sm">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Estimated Tax (8%)</span>
                                <span>${tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Shipping</span>
                                {shipping === 0 ? (
                                    <span className="text-green-600 font-medium">Free</span>
                                ) : (
                                    <span>${shipping.toFixed(2)}</span>
                                )}
                            </div>
                            <div className="flex justify-between font-bold text-2xl pt-4 border-t border-gray-300 text-gray-900 mt-4">
                                <span>Total</span>
                                <span className="text-green-600">${total.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="mt-8">
                            <CheckoutButton
                                customerInfo={customerInfo}
                                shippingInfo={shippingInfo}
                                onValidationFail={handleValidationFail}
                            />
                            <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center">
                                <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                Secure encrypted payment powered by Stripe.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
