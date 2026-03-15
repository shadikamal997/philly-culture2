"use client";

import { useState } from "react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Contact form:", { name, email, message });
    alert("Thank you for your message. We'll get back to you soon!");
    setName("");
    setEmail("");
    setMessage("");
  };

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-amber-50 to-orange-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900">
            Contact Us
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 max-w-3xl">
            We'd Love to Hear From You
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold mb-6 text-gray-900">Send Us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold mb-2 text-gray-900">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold mb-2 text-gray-900">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-semibold mb-2 text-gray-900">
                  Message *
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-amber-600 text-white px-6 py-4 rounded-lg hover:bg-amber-700 transition-colors font-semibold text-lg"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div>
            <h2 className="text-3xl font-bold mb-6 text-gray-900">Get in Touch</h2>
            <p className="text-gray-700 mb-8 leading-relaxed">
              Have questions about our programs, need support, or want to learn more about Philly Culture Academy? 
              We're here to help!
            </p>

            <div className="space-y-6">
              <div className="flex items-start">
                <div className="text-3xl mr-4">📧</div>
                <div>
                  <h3 className="font-semibold text-lg mb-1 text-gray-900">Email Us</h3>
                  <a href="mailto:info@phillyculture.com" className="text-amber-600 hover:text-amber-700">
                    info@phillyculture.com
                  </a>
                </div>
              </div>

              <div className="flex items-start">
                <div className="text-3xl mr-4">💬</div>
                <div>
                  <h3 className="font-semibold text-lg mb-1 text-gray-900">Support</h3>
                  <a href="mailto:support@phillyculture.com" className="text-amber-600 hover:text-amber-700">
                    support@phillyculture.com
                  </a>
                </div>
              </div>

              <div className="flex items-start">
                <div className="text-3xl mr-4">📍</div>
                <div>
                  <h3 className="font-semibold text-lg mb-1 text-gray-900">Location</h3>
                  <p className="text-gray-700">Philadelphia, PA<br />United States</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="text-3xl mr-4">⏰</div>
                <div>
                  <h3 className="font-semibold text-lg mb-1 text-gray-900">Response Time</h3>
                  <p className="text-gray-700">We typically respond within 24-48 hours</p>
                </div>
              </div>
            </div>

            <div className="mt-10 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6">
              <h3 className="font-semibold text-lg mb-3 text-gray-900">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <a href="/programs" className="text-amber-600 hover:text-amber-700 hover:underline">
                    Browse Programs →
                  </a>
                </li>
                <li>
                  <a href="/about" className="text-amber-600 hover:text-amber-700 hover:underline">
                    About Us →
                  </a>
                </li>
                <li>
                  <a href="/faq" className="text-amber-600 hover:text-amber-700 hover:underline">
                    FAQ →
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
