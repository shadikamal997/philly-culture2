export const StorySection = () => {
    return (
        <section className="bg-gray-900 text-white py-24 lg:py-32 relative overflow-hidden">
            {/* Abstract pattern */}
            <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[600px] h-[600px] bg-green-500/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <span className="text-green-400 font-bold tracking-widest uppercase text-sm mb-4 block">Our Heritage</span>
                        <h2 className="text-4xl lg:text-5xl font-extrabold mb-8 leading-tight">Rooted in Philadelphia. <br />Inspired by Culture.</h2>
                        <div className="space-y-6 text-gray-300 text-lg leading-relaxed">
                            <p>Philadelphia isn't just a place; it's an attitude. A rich tapestry of Italian markets, corner delis, and generations of families passing down recipes inscribed with love and resilience.</p>
                            <p>Our mission is to democratize the real flavor of the City of Brotherly Love. We aren't selling generic fast food. We are delivering the authentic culinary techniques and secret ingredients that make Philly's food culture world-renowned.</p>
                            <p className="font-semibold text-white pt-4 border-t border-gray-800">Learn to cook it. Buy the authentic tools. Live the culture.</p>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-0 bg-green-500 rounded-3xl translate-x-4 translate-y-4 opacity-50"></div>
                        <img
                            src="https://images.unsplash.com/photo-1595295333158-4742f28fbd85?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                            alt="Philly Chef cooking"
                            className="relative z-10 rounded-3xl w-full h-auto object-cover shadow-2xl grayscale hover:grayscale-0 transition duration-700"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};
