import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6">
      <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
      <p className="text-gray-500 mb-6">Page not found</p>
      <Link
        href="/"
        className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition"
      >
        Return home
      </Link>
    </div>
  );
}
