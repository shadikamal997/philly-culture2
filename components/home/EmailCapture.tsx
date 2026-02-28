'use client';

export const EmailCapture = () => {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert('Subscribed! (Placeholder)');
    };

    return (
        <section className="py-20 bg-green-600 text-white relative overflow-hidden">
            {/* Background graphic */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-green-500 rounded-full blur-3xl opacity-50"></div>
            <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-green-700 rounded-full blur-3xl opacity-50"></div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                <h2 className="text-4xl md:text-5xl font-extrabold mb-4">Get 10% Off Your First Order</h2>
                <p className="text-green-100 text-lg mb-10 max-w-2xl mx-auto">
                    Subscribe to our newsletter for exclusive recipes, early access to new courses, and subscriber-only discounts.
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row max-w-xl mx-auto gap-3">
                    <input
                        type="email"
                        required
                        placeholder="Enter your email address"
                        className="flex-1 px-6 py-4 rounded-full text-gray-900 focus:outline-none focus:ring-4 focus:ring-green-300 shadow-xl"
                    />
                    <button
                        type="submit"
                        className="px-8 py-4 bg-gray-900 text-white font-bold rounded-full hover:bg-gray-800 transition shadow-xl whitespace-nowrap"
                    >
                        Claim 10% Off
                    </button>
                </form>
                <p className="text-xs text-green-200 mt-4 opacity-80">We never spam. Unsubscribe at any time.</p>
            </div>
        </section>
    );
};
