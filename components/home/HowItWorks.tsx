import { MousePointerClick, PackageOpen, ChefHat } from 'lucide-react';

export const HowItWorks = () => {
    const steps = [
        {
            icon: <MousePointerClick className="w-8 h-8 text-green-600" />,
            title: "Choose a Course or Product",
            description: "Browse our authentic masterclasses or buy our signature kits and spices directly."
        },
        {
            icon: <PackageOpen className="w-8 h-8 text-green-600" />,
            title: "Learn or Receive at Home",
            description: "Unlock HD streaming videos instantly, or track your physical ingredients shipping to your door."
        },
        {
            icon: <ChefHat className="w-8 h-8 text-green-600" />,
            title: "Cook Like a Philly Pro",
            description: "Combine our sauces with your new knowledge to recreate iconic dishes anywhere in the world."
        }
    ];

    return (
        <section className="py-24 bg-white relative">
            {/* Decorative dashed line connecting steps */}
            <div className="hidden md:block absolute top-[160px] left-0 right-0 h-0.5 border-t-2 border-dashed border-gray-200 z-0 opacity-60 w-3/4 mx-auto"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-extrabold text-gray-900">How It Works</h2>
                    <p className="mt-4 text-gray-500 text-lg">Your journey to authentic flavor in three simple steps.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-12 text-center">
                    {steps.map((step, idx) => (
                        <div key={idx} className="flex flex-col items-center">
                            <div className="w-20 h-20 bg-green-50 rounded-2xl flex items-center justify-center mb-6 shadow-sm transform -rotate-3 hover:rotate-0 transition duration-300">
                                {step.icon}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{idx + 1}. {step.title}</h3>
                            <p className="text-gray-600 leading-relaxed max-w-sm">{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
