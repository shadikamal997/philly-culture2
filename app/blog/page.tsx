import Link from "next/link";

export const metadata = {
  title: 'Blog | Philly Culture Academy',
  description: 'Cooking tips, recipes, and culinary insights from Philly Culture',
};

export default function BlogPage() {
  return (
    <main className="max-w-6xl mx-auto px-6 py-16">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Blog Coming Soon</h1>
        <p className="text-gray-600 mb-8">
          Stay tuned for cooking tips, recipes, and culinary insights.
        </p>
        <Link
          href="/programs"
          className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold"
        >
          Explore Our Programs
        </Link>
      </div>
    </main>
  );
}