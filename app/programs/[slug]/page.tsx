import { adminDb } from "@/firebase/firebaseAdmin";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import EnrollButton from "@/components/programs/EnrollButton";
import ProgramReviews from "@/components/programs/ProgramReviews";
import { generateCourseSchema } from "@/lib/metadata";

export const revalidate = 3600; // Cache for 1 hour

async function getProgram(slug: string) {
  try {
    const snapshot = await adminDb
      .collection("programs")
      .where("slug", "==", slug)
      .limit(1)
      .get();

    if (snapshot.empty) return null;

    return {
      id: snapshot.docs[0].id,
      ...snapshot.docs[0].data(),
    } as any;
  } catch (error) {
    console.error("Error fetching program:", error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const program = await getProgram(params.slug);
  
  if (!program) {
    return {
      title: 'Program Not Found',
    };
  }

  return {
    title: `${program.title} | Philly Culture Academy`,
    description: program.shortDescription || 'Learn professional cooking techniques',
  };
}

export default async function ProgramDetail({
  params,
}: {
  params: { slug: string };
}) {
  const program = await getProgram(params.slug);

  if (!program) {
    return notFound();
  }

  // Generate structured data for SEO
  const structuredData = generateCourseSchema(program);

  return (
    <>
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <main className="max-w-4xl mx-auto px-6 py-16">
      {/* Header Section */}
      <div className="mb-8">
        <Link
          href="/programs"
          className="text-red-600 hover:underline mb-4 inline-block"
        >
          ← Back to Programs
        </Link>
        <div className="flex items-center gap-3 mb-4">
          <span className="inline-block bg-red-100 text-red-600 text-sm font-semibold px-4 py-1 rounded-full uppercase">
            {program.programType || "Course"}
          </span>
          {program.totalHours && (
            <span className="text-gray-600 text-sm">
              {program.totalHours} hours total
            </span>
          )}
        </div>
        <h1 className="text-4xl font-bold mb-4">{program.title}</h1>
        {program.instructorName && (
          <p className="text-lg text-gray-600">
            Instructor: <span className="font-semibold">{program.instructorName}</span>
          </p>
        )}
      </div>

      {/* Thumbnail */}
      {program.thumbnail && (
        <div className="mb-8 rounded-xl overflow-hidden relative h-96">
          <Image
            src={program.thumbnail}
            alt={`${program.title} program thumbnail`}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      <EnrollButton programId={program.id} programPrice={program.basePrice} />

      {/* Description */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">About This Program</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          {program.shortDescription || "Learn professional cooking techniques from expert chefs."}
        </p>
        {program.fullDescription && program.fullDescription !== program.shortDescription && (
          <p className="text-gray-700 leading-relaxed">
            {program.fullDescription}
          </p>
        )}
      </div>

      {/* What You'll Learn */}
      <div className="bg-white border rounded-lg p-8 mb-8">
        <h2 className="text-2xl font-bold mb-4">What You'll Learn</h2>
        <ul className="space-y-3 text-gray-700">
          <li className="flex items-start">
            <svg className="w-6 h-6 text-red-600 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Professional cooking techniques and methods
          </li>
          <li className="flex items-start">
            <svg className="w-6 h-6 text-red-600 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Ingredient selection and preparation
          </li>
          <li className="flex items-start">
            <svg className="w-6 h-6 text-red-600 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Kitchen safety and best practices
          </li>
          <li className="flex items-start">
            <svg className="w-6 h-6 text-red-600 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Recipe development and customization
          </li>
        </ul>
      </div>

      {/* Program Info */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="border rounded-lg p-6">
          <h3 className="font-semibold mb-2">Program Type</h3>
          <p className="text-gray-600 capitalize">{program.programType || "Intensive"}</p>
        </div>
        <div className="border rounded-lg p-6">
          <h3 className="font-semibold mb-2">Total Duration</h3>
          <p className="text-gray-600">{program.totalHours || 0} hours</p>
        </div>
      </div>

      {/* Reviews */}
      <ProgramReviews programId={program.id} programTitle={program.title} />

    </main>
    </>
  );
}
