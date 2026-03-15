export const metadata = {
  title: 'About Us | Philly Culture Academy',
  description: 'Learn about our mission to provide world-class culinary education and preserve authentic Philadelphia food culture',
};

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-amber-50 to-orange-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900">
            About Philly Culture Academy
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 max-w-3xl">
            Where Philadelphia's Rich Culinary Heritage Meets Modern Education
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-6 text-gray-900">Our Mission</h2>
            <p className="text-lg text-gray-700 mb-4 leading-relaxed">
              We're dedicated to preserving and teaching authentic Philadelphia food culture through 
              comprehensive, accessible online programs that empower aspiring chefs and food enthusiasts.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Our goal is to make professional culinary education available to everyone, anywhere, 
              while maintaining the highest standards of quality and authenticity.
            </p>
          </div>
          <div className="bg-amber-100 rounded-2xl p-8">
            <h3 className="text-2xl font-bold mb-6 text-gray-900">Why Choose Us?</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <span className="text-amber-600 font-bold text-xl mr-3">✓</span>
                <span className="text-gray-700">Expert instructors with decades of experience</span>
              </li>
              <li className="flex items-start">
                <span className="text-amber-600 font-bold text-xl mr-3">✓</span>
                <span className="text-gray-700">Authentic Philadelphia culinary techniques</span>
              </li>
              <li className="flex items-start">
                <span className="text-amber-600 font-bold text-xl mr-3">✓</span>
                <span className="text-gray-700">Flexible online learning at your own pace</span>
              </li>
              <li className="flex items-start">
                <span className="text-amber-600 font-bold text-xl mr-3">✓</span>
                <span className="text-gray-700">Industry-recognized certifications</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold text-amber-400 mb-2">1000+</div>
              <div className="text-gray-300">Students Enrolled</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-amber-400 mb-2">50+</div>
              <div className="text-gray-300">Expert Instructors</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-amber-400 mb-2">100+</div>
              <div className="text-gray-300">Courses Offered</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-amber-400 mb-2">95%</div>
              <div className="text-gray-300">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="py-16 max-w-6xl mx-auto px-6">
        <h2 className="text-4xl font-bold mb-12 text-center text-gray-900">What We Offer</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">🎓</div>
            <h3 className="text-2xl font-bold mb-4 text-gray-900">Certification Programs</h3>
            <p className="text-gray-700">
              Intensive programs designed to take you from beginner to professional chef with 
              industry-recognized certifications.
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">👨‍🍳</div>
            <h3 className="text-2xl font-bold mb-4 text-gray-900">Masterclasses</h3>
            <p className="text-gray-700">
              Weekly sessions with renowned chefs sharing their secrets, techniques, and 
              decades of culinary expertise.
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-2xl font-bold mb-4 text-gray-900">Recipe Library</h3>
            <p className="text-gray-700">
              Access to hundreds of authentic Philadelphia recipes, from classic cheesesteaks 
              to modern fusion cuisine.
            </p>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="bg-gradient-to-r from-orange-50 to-amber-50 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold mb-12 text-center text-gray-900">Our Core Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg p-6 text-center">
              <div className="text-3xl mb-3">🌟</div>
              <h3 className="font-bold text-lg mb-2 text-gray-900">Excellence</h3>
              <p className="text-gray-600 text-sm">
                We maintain the highest standards in every course and interaction.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 text-center">
              <div className="text-3xl mb-3">🤝</div>
              <h3 className="font-bold text-lg mb-2 text-gray-900">Community</h3>
              <p className="text-gray-600 text-sm">
                Building a supportive network of food enthusiasts and professionals.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 text-center">
              <div className="text-3xl mb-3">💡</div>
              <h3 className="font-bold text-lg mb-2 text-gray-900">Innovation</h3>
              <p className="text-gray-600 text-sm">
                Blending traditional techniques with modern culinary trends.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 text-center">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="font-bold text-lg mb-2 text-gray-900">Authenticity</h3>
              <p className="text-gray-600 text-sm">
                Preserving true Philadelphia food culture and heritage.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold mb-6 text-gray-900">
          Ready to Start Your Culinary Journey?
        </h2>
        <p className="text-xl text-gray-700 mb-8">
          Join thousands of students who have transformed their passion for food into a profession.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/programs"
            className="bg-amber-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-amber-700 transition-colors text-lg"
          >
            Browse Programs
          </a>
          <a
            href="/contact"
            className="bg-gray-100 text-gray-900 px-8 py-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-lg border-2 border-gray-300"
          >
            Contact Us
          </a>
        </div>
      </section>
    </main>
  );
}
