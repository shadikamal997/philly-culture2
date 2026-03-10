export default function ProgramsLoading() {
  return (
    <main className="max-w-6xl mx-auto px-6 py-16">
      <div className="mb-12">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-4"></div>
        <div className="h-6 w-96 bg-gray-200 rounded animate-pulse"></div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="border rounded-lg p-6">
            <div className="h-6 w-20 bg-gray-200 rounded-full mb-4 animate-pulse"></div>
            <div className="h-6 w-full bg-gray-200 rounded mb-2 animate-pulse"></div>
            <div className="h-4 w-full bg-gray-200 rounded mb-4 animate-pulse"></div>
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
