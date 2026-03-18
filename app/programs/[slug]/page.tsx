import { adminDb } from "@/firebase/firebaseAdmin";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import EnrollButton from "@/components/programs/EnrollButton";
import ProgramReviews from "@/components/programs/ProgramReviews";
import { generateCourseSchema } from "@/lib/metadata";

export const revalidate = 3600;

async function getProgram(slug: string) {
  try {
    const snapshot = await adminDb
      .collection("programs")
      .where("slug", "==", slug)
      .limit(1)
      .get();
    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as any;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const program = await getProgram(params.slug);
  if (!program) return { title: "Program Not Found" };
  return {
    title: `${program.title} | Philly Culture Academy`,
    description: program.shortDescription || "Learn professional cooking techniques",
  };
}

export default async function ProgramDetail({ params }: { params: { slug: string } }) {
  const program = await getProgram(params.slug);
  if (!program) return notFound();

  const structuredData = generateCourseSchema(program);

  const learningObjectives: string[] = Array.isArray(program.learningObjectives)
    ? program.learningObjectives
    : [
        "Professional cooking techniques and methods",
        "Ingredient selection and preparation",
        "Kitchen safety and best practices",
        "Recipe development and customization",
      ];

  const prerequisites: string[] = Array.isArray(program.prerequisites)
    ? program.prerequisites
    : [];

  const tags: string[] = Array.isArray(program.tags) ? program.tags : [];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative bg-black text-white overflow-hidden">
        {/* Background image */}
        {program.thumbnail && (
          <div className="absolute inset-0">
            <Image
              src={program.thumbnail}
              alt={program.title}
              fill
              className="object-cover opacity-40"
              priority
            />
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/80" />

        <div className="relative max-w-6xl mx-auto px-6 pt-10 pb-20">
          {/* Back link */}
          <Link
            href="/programs"
            className="inline-flex items-center gap-1.5 text-white/60 hover:text-white text-sm transition-colors mb-10"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            All Programs
          </Link>

          <div className="max-w-3xl">
            {/* Pill badges */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              {program.programType && (
                <span className="bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs font-medium px-3 py-1 rounded-full uppercase tracking-wide">
                  {program.programType}
                </span>
              )}
              {program.difficultyLevel && (
                <span className="bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs font-medium px-3 py-1 rounded-full capitalize">
                  {program.difficultyLevel}
                </span>
              )}
              {program.certificateEnabled && (
                <span className="bg-red-600/80 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full">
                  Certificate
                </span>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-6">
              {program.title}
            </h1>

            <p className="text-lg md:text-xl text-white/75 leading-relaxed mb-8 max-w-2xl">
              {program.shortDescription || "Learn professional culinary techniques from expert chefs."}
            </p>

            {/* Instructor */}
            {program.instructorName && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-sm font-bold">
                  {program.instructorName.charAt(0)}
                </div>
                <div>
                  <p className="text-xs text-white/50 uppercase tracking-wide">Instructor</p>
                  <p className="text-white font-medium text-sm">{program.instructorName}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats bar */}
        <div className="relative border-t border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-6 py-4 flex flex-wrap gap-6 md:gap-10">
            {program.totalHours && (
              <div className="flex items-center gap-2 text-white/80">
                <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm">{program.totalHours}h total</span>
              </div>
            )}
            {program.language && (
              <div className="flex items-center gap-2 text-white/80">
                <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                <span className="text-sm capitalize">{program.language === "en" ? "English" : program.language}</span>
              </div>
            )}
            {program.maxStudents && (
              <div className="flex items-center gap-2 text-white/80">
                <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm">{program.maxStudents} seats</span>
              </div>
            )}
            {program.averageRating > 0 && (
              <div className="flex items-center gap-2 text-white/80">
                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-sm">{program.averageRating.toFixed(1)} ({program.reviewCount} reviews)</span>
              </div>
            )}
            <div className="ml-auto flex items-center">
              <span className="text-2xl font-bold text-white">${program.basePrice}</span>
              <span className="text-white/50 text-sm ml-1.5">+ tax</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ─────────────────────────────────────── */}
      <main className="bg-[#f5f5f7] min-h-screen">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid lg:grid-cols-3 gap-10">

            {/* LEFT: Content */}
            <div className="lg:col-span-2 space-y-10">

              {/* About */}
              <section className="bg-white rounded-2xl p-8 shadow-sm">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 tracking-tight">About This Program</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-600 leading-relaxed text-[17px]">
                    {program.shortDescription}
                  </p>
                  {program.fullDescription && program.fullDescription !== program.shortDescription && (
                    <p className="text-gray-600 leading-relaxed text-[17px] mt-4">
                      {program.fullDescription}
                    </p>
                  )}
                </div>
              </section>

              {/* What You'll Learn */}
              <section className="bg-white rounded-2xl p-8 shadow-sm">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6 tracking-tight">What You'll Learn</h2>
                <ul className="grid sm:grid-cols-2 gap-4">
                  {learningObjectives.map((item: string, i: number) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-red-50 flex items-center justify-center">
                        <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                      <span className="text-gray-700 text-[15px] leading-snug">{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Prerequisites */}
              {prerequisites.length > 0 && (
                <section className="bg-white rounded-2xl p-8 shadow-sm">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6 tracking-tight">Prerequisites</h2>
                  <ul className="space-y-3">
                    {prerequisites.map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 text-gray-600 text-[15px]">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Program Details */}
              <section className="bg-white rounded-2xl p-8 shadow-sm">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6 tracking-tight">Program Details</h2>
                <dl className="divide-y divide-gray-100">
                  {[
                    { label: "Program Type", value: program.programType },
                    { label: "Duration", value: program.totalHours ? `${program.totalHours} hours` : null },
                    { label: "Difficulty", value: program.difficultyLevel },
                    { label: "Language", value: program.language === "en" ? "English" : program.language },
                    { label: "Certificate", value: program.certificateEnabled ? "Included upon completion" : null },
                    { label: "Access", value: program.accessDuration === 0 ? "Lifetime access" : program.accessDuration ? `${program.accessDuration} days` : null },
                    { label: "Category", value: program.category },
                  ]
                    .filter((r) => r.value)
                    .map((row) => (
                      <div key={row.label} className="flex justify-between py-3.5">
                        <dt className="text-sm text-gray-500">{row.label}</dt>
                        <dd className="text-sm font-medium text-gray-900 capitalize">{row.value}</dd>
                      </div>
                    ))}
                </dl>
              </section>

              {/* Tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag: string) => (
                    <span key={tag} className="bg-white border border-gray-200 text-gray-600 text-xs px-3 py-1.5 rounded-full shadow-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Reviews */}
              <section className="bg-white rounded-2xl p-8 shadow-sm">
                <ProgramReviews programId={program.id} programTitle={program.title} />
              </section>
            </div>

            {/* RIGHT: Sticky Pricing Card */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                {/* Image preview */}
                {program.thumbnail && (
                  <div className="relative h-44 w-full">
                    <Image
                      src={program.thumbnail}
                      alt={program.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-3xl font-bold text-gray-900">${program.basePrice}</span>
                    <span className="text-sm text-gray-400">+ applicable tax</span>
                  </div>

                  {program.averageRating > 0 && (
                    <div className="flex items-center gap-1.5 mb-5">
                      {[1,2,3,4,5].map((s) => (
                        <svg key={s} className={`w-3.5 h-3.5 ${s <= Math.round(program.averageRating) ? "text-yellow-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="text-xs text-gray-500 ml-1">{program.averageRating.toFixed(1)} ({program.reviewCount})</span>
                    </div>
                  )}

                  <EnrollButton programId={program.id} programPrice={program.basePrice} />

                  {/* Includes list */}
                  <ul className="mt-6 space-y-3 border-t border-gray-100 pt-6">
                    {[
                      program.totalHours ? `${program.totalHours} hours of content` : null,
                      program.accessDuration === 0 ? "Lifetime access" : program.accessDuration ? `${program.accessDuration}-day access` : "Full access",
                      program.certificateEnabled ? "Certificate of completion" : null,
                      "Secure checkout via Stripe",
                      "No account required",
                    ]
                      .filter(Boolean)
                      .map((item) => (
                        <li key={item} className="flex items-center gap-2.5 text-sm text-gray-600">
                          <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          {item}
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </>
  );
}
