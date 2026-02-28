import { Star } from 'lucide-react';

export const Testimonials = () => {
    const reviews = [
        { text: "The Cheesesteak Masterclass changed my weekend cookouts forever. Finding out how to properly slice the ribeye was a game changer.", author: "Mike T.", role: "Home Cook from Texas" },
        { text: "My family moved from Philly 10 years ago. Getting the signature sauce shipped here literally brought tears to our eyes. So authentic.", author: "Sarah Jenkins", role: "Verified Buyer" },
        { text: "I bought the kit and took the course. The video quality is amazing, and the chef breaks it down so easily. 10/10 recommend.", author: "David L.", role: "Academy Student" }
    ];

    return (
        <section className="py-24 bg-gray-50 border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center text-center mb-16">
                    <div className="flex text-yellow-500 mb-4">
                        {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-6 h-6 fill-current" />)}
                    </div>
                    <h2 className="text-4xl font-extrabold text-gray-900">Join 5,000+ Food Lovers</h2>
                    <p className="mt-4 text-gray-600 text-lg">Don't just take our word for it.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {reviews.map((rev, idx) => (
                        <div key={idx} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 italic text-gray-700 relative">
                            <span className="text-6xl text-green-200 absolute top-4 left-4 font-serif opacity-30">"</span>
                            <p className="mb-6 relative z-10 leading-relaxed font-medium">"{rev.text}"</p>
                            <div className="flex flex-col border-t border-gray-100 pt-4 mt-auto">
                                <span className="font-bold text-gray-900">{rev.author}</span>
                                <span className="text-sm text-gray-500">{rev.role}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
