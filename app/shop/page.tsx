import Link from "next/link";

export const metadata = {
  title: 'Shop | Philly Culture Academy',
  description: 'Browse our premium cooking products, sauces, and merchandise',
};

export default function ShopPage() {
  return (
    <main className="max-w-6xl mx-auto px-6 py-16">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Shop Coming Soon</h1>
        <p className="text-gray-600 mb-8">
          We're working on bringing you the best cooking products and merchandise.
        </p>
        <Link
          href="/programs"
          className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold"
        >
          Check Out Our Programs Instead
        </Link>
      </div>
    </main>
  );
}