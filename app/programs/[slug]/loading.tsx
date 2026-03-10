export default function ProgramLoading() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-16">
      <div className="mb-8">
        <div className="h-4 w-32 bg-gray-200 rounded mb-4 animate-pulse"></div>
        <div className="flex items-center gap-3 mb-4">
          <div className="h-6 w-24 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-10 w-3/4 bg-gray-200 rounded mb-4 animate-pulse"></div>
        <div className="h-6 w-1/2 bg-gray-200 rounded animate-pulse"></div>
      </div>

      <div className="mb-8 rounded-xl overflow-hidden">
        <div className="w-full h-96 bg-gray-200 animate-pulse"></div>
      </div>

      <div className="bg-gray-50 border rounded-lg p-8 mb-8">
        <div className="h-8 w-32 bg-gray-200 rounded mb-4 animate-pulse"></div>
        <div className="h-6 w-full bg-gray-200 rounded mb-2 animate-pulse"></div>
        <div className="h-6 w-5/6 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </main>
  );
}
