import { adminDb } from "@/firebase/firebaseAdmin";
import Link from "next/link";

export const metadata = {
  title: 'All Programs | Philly Culture Academy',
  description: 'Browse our complete collection of culinary programs',
};

export const revalidate = 3600; // Cache for 1 hour

async function getAllPrograms() {
  try {
    const snapshot = await adminDb
      .collection("programs")
      .where("published", "==", true)
      .get();

    // Sort in memory instead of in query (works without index)
    const programs = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .sort((a: any, b: any) => {
        const aTime = a.createdAt?.toDate?.() || new Date(0);
        const bTime = b.createdAt?.toDate?.() || new Date(0);
        return bTime.getTime() - aTime.getTime();
      });

    return programs;
  } catch (error) {
    console.error("Error fetching programs:", error);
    return [];
  }
}

export default async function ProgramsPage() {
  const programs = await getAllPrograms();

  return (
    <main className="max-w-6xl mx-auto px-6 py-16">
      <div className="mb-12">
        <h1 className="text-3xl font-bold mb-4">All Programs</h1>
        <p className="text-gray-600">
          Browse our complete collection of culinary programs
        </p>
      </div>

      {programs.length > 0 ? (
        <div className="grid md:grid-cols-3 gap-6">
          {programs.map((program: any) => (
            <Link
              key={program.id}
              href={`/programs/${program.slug}`}
              className="border rounded-lg hover:shadow-lg transition-all overflow-hidden"
            >
              {program.thumbnail && (
                <div className="h-48 bg-gray-200 overflow-hidden">
                  <img
                    src={program.thumbnail}
                    alt={program.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-6">
                <div className="mb-3">
                  <span className="inline-block bg-red-100 text-red-600 text-xs font-semibold px-3 py-1 rounded-full uppercase">
                    {program.programType || "Course"}
                  </span>
                </div>
                <h2 className="font-bold text-xl mb-2">{program.title}</h2>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {program.shortDescription || "Learn professional cooking techniques"}
                </p>
                <div className="flex items-center justify-between pt-4 border-t">
                  <span className="text-2xl font-bold text-red-600">
                    ${program.basePrice}
                  </span>
                  {program.totalHours && (
                    <span className="text-sm text-gray-500">
                      {program.totalHours} hours
                    </span>
                  )}
                </div>
                {program.instructorName && (
                  <p className="text-sm text-gray-500 mt-2">
                    Instructor: {program.instructorName}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg bg-gray-50">
          <p className="text-gray-600 mb-4">No programs available yet.</p>
          <Link
            href="/admin/programs/create"
            className="text-red-600 hover:underline font-semibold"
          >
            Create your first program (Admin)
          </Link>
        </div>
      )}
    </main>
  );
}
