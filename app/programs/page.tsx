import { adminDb, adminAuth } from "@/firebase/firebaseAdmin";
import { cookies } from "next/headers";
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

async function checkIsAdmin() {
  try {
    const cookieStore = cookies();
    const sessionToken = cookieStore.get('__session')?.value;

    if (!sessionToken) return false;

    const decodedToken = await adminAuth.verifyIdToken(sessionToken);
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    
    if (!userDoc.exists) return false;

    const userData = userDoc.data();
    return userData?.role === 'admin' || userData?.role === 'superadmin' || userData?.role === 'owner';
  } catch (error) {
    return false;
  }
}

export default async function ProgramsPage() {
  const programs = await getAllPrograms();
  const isAdmin = await checkIsAdmin();

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-amber-50 to-orange-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900">
            Our Programs
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 max-w-3xl">
            Transform Your Culinary Skills with Expert-Led Programs
          </p>
        </div>
      </section>

      {/* Programs Grid Section */}
      <section className="max-w-6xl mx-auto px-6 py-16">

        {programs.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-8">
          {programs.map((program: any) => (
            <Link
              key={program.id}
              href={`/programs/${program.slug}`}
              className="bg-white border border-gray-200 rounded-xl hover:shadow-2xl transition-all overflow-hidden group"
            >
              {program.thumbnail && (
                <div className="h-56 bg-gray-200 overflow-hidden">
                  <img
                    src={program.thumbnail}
                    alt={program.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="p-6">
                <div className="mb-3">
                  <span className="inline-block bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1 rounded-full uppercase">
                    {program.programType || "Course"}
                  </span>
                </div>
                <h2 className="font-bold text-2xl mb-3 text-gray-900 group-hover:text-amber-600 transition-colors">{program.title}</h2>
                <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                  {program.shortDescription || "Learn professional cooking techniques"}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <span className="text-3xl font-bold text-amber-600">
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
          <div className="text-center py-20 border-2 border-dashed rounded-xl bg-gray-50">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-xl text-gray-600 mb-6">No programs available yet.</p>
            {isAdmin && (
              <Link
                href="/admin/programs/create"
                className="inline-block bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors font-semibold"
              >
                Create Your First Program (Admin)
              </Link>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
