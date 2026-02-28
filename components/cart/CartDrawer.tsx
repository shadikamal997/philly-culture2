'use client';
import { useCartContext } from '@/context/CartContext';
import Link from 'next/link';

export const CartDrawer = () => {
    const { isDrawerOpen, closeDrawer, items, subtotal, removeItem, updateQuantity } = useCartContext();

    if (!isDrawerOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden text-gray-800">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 transition-opacity"
                onClick={closeDrawer}
            />

            {/* Drawer */}
            <div className="absolute inset-y-0 right-0 max-w-sm w-full bg-white shadow-2xl flex flex-col transform transition-transform">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold">Your Cart</h2>
                    <button onClick={closeDrawer} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {items.length === 0 ? (
                        <p className="text-gray-500 text-center mt-10">Your cart is empty.</p>
                    ) : (
                        items.map((item) => (
                            <div key={item.itemId} className="flex space-x-4">
                                <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                                    {item.image ? (
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-xs text-gray-400 font-medium">No Img</div>
                                    )}
                                </div>
                                <div className="flex-1 flex flex-col">
                                    <div className="flex justify-between">
                                        <h3 className="font-semibold text-sm line-clamp-2 pr-4">{item.name}</h3>
                                        <button onClick={() => removeItem(item.itemId)} className="text-gray-400 hover:text-red-500 text-sm">
                                            Remove
                                        </button>
                                    </div>
                                    <p className="text-green-600 font-bold mt-1">${(item.price * item.quantity).toFixed(2)}</p>

                                    {/* Quantity Actions */}
                                    <div className="mt-auto flex items-center space-x-2">
                                        <button
                                            className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-sm font-bold hover:bg-gray-200"
                                            onClick={() => updateQuantity(item.itemId, item.quantity - 1)}
                                        >-</button>
                                        <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                                        <button
                                            className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-sm font-bold hover:bg-gray-200"
                                            onClick={() => updateQuantity(item.itemId, item.quantity + 1)}
                                        >+</button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="p-6 border-t border-gray-100 bg-gray-50">
                        <div className="flex justify-between font-bold text-lg mb-4">
                            <span>Subtotal</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <p className="text-xs text-gray-500 mb-6">Taxes and shipping calculated at checkout.</p>
                        <div className="space-y-3">
                            <Link
                                href="/cart"
                                onClick={closeDrawer}
                                className="block w-full text-center border border-gray-300 bg-white py-3 rounded-md font-semibold text-gray-700 hover:bg-gray-50 transition"
                            >
                                View Cart
                            </Link>
                            <Link
                                href="/checkout"
                                onClick={closeDrawer}
                                className="block w-full text-center bg-green-600 text-white py-3 rounded-md font-semibold shadow-sm hover:bg-green-700 transition"
                            >
                                Checkout Securely
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
