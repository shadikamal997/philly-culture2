"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, getDoc, orderBy } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import LessonPlayer from "@/components/academy/LessonPlayer";

interface Lesson {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  videoDuration: number;
  orderIndex: number;
  contentType: string;
  transcript?: string;
  attachments?: string[];
}

interface Program {
  id: string;
  title: string;
  slug: string;
}

export default function LessonPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [program, setProgram] = useState<Program | null>(null);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push(`/login?redirect=/programs/${params.slug}/lessons/${params.lessonId}`);
      } else {
        loadLessonData();
      }
    }
  }, [user, authLoading, params.slug, params.lessonId, router]);

  const loadLessonData = async () => {
    try {
      // Get program by slug
      const programsQuery = query(
        collection(db, "programs"),
        where("slug", "==", params.slug)
      );
      const programsSnap = await getDocs(programsQuery);
      
      if (programsSnap.empty) {
        setError("Program not found");
        setLoading(false);
        return;
      }

      const programData = {
        id: programsSnap.docs[0].id,
        ...programsSnap.docs[0].data(),
      } as Program;
      setProgram(programData);

      // Check if user is enrolled
      const enrollmentsQuery = query(
        collection(db, "enrollments"),
        where("userEmail", "==", user?.email),
        where("programId", "==", programData.id),
        where("status", "==", "active")
      );
      const enrollmentsSnap = await getDocs(enrollmentsQuery);

      if (enrollmentsSnap.empty) {
        setError("You must be enrolled to access this lesson");
        setLoading(false);
        return;
      }

      setHasAccess(true);

      // Fetch lessons for this program
      const lessonsQuery = query(
        collection(db, "lessons"),
        where("programId", "==", programData.id),
        orderBy("orderIndex", "asc")
      );
      const lessonsSnap = await getDocs(lessonsQuery);
      const lessonsData = lessonsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Lesson[];
      setAllLessons(lessonsData);

      // Find current lesson
      const currentLesson = lessonsData.find((l) => l.id === params.lessonId);
      if (!currentLesson) {
        setError("Lesson not found");
        setLoading(false);
        return;
      }

      setLesson(currentLesson);
      setLoading(false);
    } catch (err) {
      console.error("Error loading lesson:", err);
      setError("Failed to load lesson");
      setLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!user || !lesson || !program) return;

    try {
      await fetch("/api/v1/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail: user.email,
          programId: program.id,
          lessonId: lesson.id,
          completed: true,
        }),
      });

      // Navigate to next lesson if available
      const currentIndex = allLessons.findIndex((l) => l.id === lesson.id);
      if (currentIndex < allLessons.length - 1) {
        const nextLesson = allLessons[currentIndex + 1];
        router.push(`/programs/${params.slug}/lessons/${nextLesson.id}`);
      } else {
        router.push("/dashboard?completed=true");
      }
    } catch (err) {
      console.error("Error marking lesson complete:", err);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (error || !hasAccess) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-red-800 mb-4">Access Denied</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <Link
            href="/programs"
            className="inline-block bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
          >
            Browse Programs
          </Link>
        </div>
      </div>
    );
  }

  if (!lesson || !program) return null;

  const currentIndex = allLessons.findIndex((l) => l.id === lesson.id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link
            href="/dashboard"
            className="text-red-600 hover:underline mb-2 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold">{program.title}</h1>
          <p className="text-gray-600">
            Lesson {currentIndex + 1} of {allLessons.length}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Video Player */}
            <LessonPlayer
              videoUrl={lesson.videoUrl}
              title={lesson.title}
              onComplete={handleMarkComplete}
            />

            {/* Lesson Info */}
            <div className="bg-white rounded-lg p-6 mt-6">
              <h2 className="text-2xl font-bold mb-4">{lesson.title}</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                {lesson.description}
              </p>

              {/* Navigation Buttons */}
              <div className="flex gap-4">
                {prevLesson && (
                  <Link
                    href={`/programs/${params.slug}/lessons/${prevLesson.id}`}
                    className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors text-center"
                  >
                    ← Previous Lesson
                  </Link>
                )}
                <button
                  onClick={handleMarkComplete}
                  className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
                >
                  {nextLesson ? "Mark Complete & Next →" : "Mark Complete & Finish"}
                </button>
              </div>
            </div>

            {/* Transcript */}
            {lesson.transcript && (
              <div className="bg-white rounded-lg p-6 mt-6">
                <h3 className="text-xl font-bold mb-4">Transcript</h3>
                <div className="prose max-w-none text-gray-700">
                  {lesson.transcript}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Lesson List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 sticky top-6">
              <h3 className="text-xl font-bold mb-4">Course Content</h3>
              <div className="space-y-2">
                {allLessons.map((l, index) => (
                  <Link
                    key={l.id}
                    href={`/programs/${params.slug}/lessons/${l.id}`}
                    className={`block p-3 rounded-lg transition-colors ${
                      l.id === lesson.id
                        ? "bg-red-50 border-2 border-red-600"
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{l.title}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {l.videoDuration} min
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
