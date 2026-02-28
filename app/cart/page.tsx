'use client';
import Link from 'next/link';
import { useCartContext } from '@/context/CartContext';

export default function CartPage() {
    const { items, subtotal, removeItem, updateQuantity, hasPhysicalItems } = useCartContext();

    // Simplified tax logic for frontend display only 
    const tax = subtotal * 0.08;
    const shipping = hasPhysicalItems ? (subtotal >= 50 ? 0 : 7.00) : 0;
    const total = subtotal + tax + shipping;

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
                <p className="text-gray-500 mb-8">Ready to start cooking? Add some courses or products.</p>
                <Link href="/" className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold transition">
                    Browse Store
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-8">Shopping Cart</h1>

            <div className="flex flex-col lg:flex-row gap-12">
                {/* LEFT COLUMN: Items List */}
                <div className="lg:w-2/3">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                        {/* Table Header */}
                        <div className="hidden sm:grid grid-cols-12 gap-4 p-6 border-b border-gray-100 bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                            <div className="col-span-6">Product</div>
                            <div className="col-span-3 text-center">Quantity</div>
                            <div className="col-span-3 text-right">Total</div>
                        </div>

                        {/* Items */}
                        <div className="divide-y divide-gray-100">
                            {items.map((item) => (
                                <div key={item.itemId} className="p-6 grid grid-cols-1 sm:grid-cols-12 gap-6 items-center hover:bg-gray-50/50 transition">

                                    {/* Product Info */}
                                    <div className="col-span-1 border-b border-gray-100 pb-4 sm:border-0 sm:pb-0 sm:col-span-6 flex gap-4">
                                        <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-xs text-gray-400 font-medium">No Img</div>
                                            )}
                                        </div>
                                        <div className="flex flex-col justify-center">
                                            <h3 className="font-bold text-gray-900 mb-1">{item.name}</h3>
                                            <p className="text-sm font-medium text-gray-500 mb-2">${item.price.toFixed(2)}</p>
                                            <button
                                                onClick={() => removeItem(item.itemId)}
                                                className="text-left text-sm text-red-500 hover:text-red-700 font-medium w-max transition"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>

                                    {/* Quantity Control */}
                                    <div className="col-span-1 sm:col-span-3 flex justify-between sm:justify-center items-center">
                                        <span className="sm:hidden font-medium text-gray-500">Quantity:</span>
                                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
                                            <button
                                                className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:text-gray-900 font-medium transition"
                                                onClick={() => updateQuantity(item.itemId, item.quantity - 1)}
                                            >-</button>
                                            <span className="w-12 text-center text-sm font-semibold">{item.quantity}</span>
                                            <button
                                                className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:text-gray-900 font-medium transition"
                                                onClick={() => updateQuantity(item.itemId, item.quantity + 1)}
                                            >+</button>
                                        </div>
                                    </div>

                                    {/* Line Total */}
                                    <div className="col-span-1 sm:col-span-3 flex justify-between sm:justify-end items-center">
                                        <span className="sm:hidden font-medium text-gray-500">Total:</span>
                                        <span className="font-bold text-lg text-gray-900">
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </span>
                                    </div>

                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Summary */}
                <div className="lg:w-1/3">
                    <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200 sticky top-8">
                        <h2 className="text-xl font-bold mb-6 text-gray-900 border-b border-gray-200 pb-4">Cart Totals</h2>

                        <div className="space-y-4 text-sm text-gray-600 mb-8">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span className="font-medium text-gray-900">${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Estimated Tax (8%)</span>
                                <span className="font-medium text-gray-900">${tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Shipping</span>
                                {shipping === 0 ? (
                                    <span className="font-medium text-green-600">Free</span>
                                ) : (
                                    <span className="font-medium text-gray-900">${shipping.toFixed(2)}</span>
                                )}
                            </div>

                            <div className="border-t border-gray-200 pt-4 mt-4 flex justify-between items-center">
                                <span className="font-bold text-gray-900 text-lg">Total</span>
                                <span className="font-extrabold text-2xl text-green-600">${total.toFixed(2)}</span>
                            </div>
                        </div>

                        <Link href="/checkout" className="block w-full bg-green-600 text-white pt-4 pb-4 rounded-xl text-center font-bold text-lg hover:bg-green-700 hover:shadow-lg transition">
                            Proceed to Checkout
                        </Link>

                        <div className="mt-6 flex flex-col items-center justify-center space-y-4">
                            <p className="text-xs text-gray-500 text-center uppercase tracking-widest font-bold">Secure checkout guaranteed</p>
                            <div className="flex space-x-3 opacity-60">
                                {/* Mock payment icons */}
                                <div className="w-10 h-6 bg-gray-300 rounded"></div>
                                <div className="w-10 h-6 bg-gray-300 rounded"></div>
                                <div className="w-10 h-6 bg-gray-300 rounded"></div>
                                <div className="w-10 h-6 bg-gray-300 rounded"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
