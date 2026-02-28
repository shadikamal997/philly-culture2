'use client';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Analytics</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
        <p className="mb-4">Revenue charts and in-depth metrics will be rendered here.</p>
        <p className="text-sm">You can integrate Chart.js, Recharts, or purely read from Firestore aggregate queries to visualize Monthly Recurring Revenue (MRR) and category breakdowns.</p>
        <div className="mt-8 flex justify-center">
          {/* Fake chart placeholder */}
          <div className="w-full max-w-2xl h-64 bg-gray-50 border border-gray-200 rounded flex items-end px-4 space-x-2 pb-4">
            {[40, 70, 45, 90, 60, 110, 85].map((h, i) => (
              <div key={i} className="flex-1 bg-green-500 opacity-80 rounded-t" style={{ height: `${h}%` }}></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}