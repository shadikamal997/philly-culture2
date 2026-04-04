"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/firebase/firebaseClient";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import Link from "next/link";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";

interface Program {
  id: string;
  title: string;
  shortDescription: string;
  instructorName: string;
  thumbnail: string;
  basePrice: number;
  programType: string;
  category: string;
  difficultyLevel: string;
  published: boolean;
  featured: boolean;
  totalHours: number;
  createdAt: any;
  slug: string;
  averageRating?: number;
  reviewCount?: number;
}

export default function ProgramsPage() {
  const { user, userData, loading: authLoading } = useAuth();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");

  useEffect(() => {
    if (!authLoading && user && userData) {
      fetchPrograms();
    } else if (!authLoading && !user) {
      setLoading(false);
      toast.error("You must be logged in to access this page");
    }
  }, [authLoading, user, userData]);

  const fetchPrograms = async () => {
    try {
      // Fetch all programs (no orderBy to avoid index issues)
      const snapshot = await getDocs(collection(db, "programs"));
      
      const programsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Program[];
      
      // Sort by createdAt on client side (newest first)
      programsData.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
      
      setPrograms(programsData);
    } catch (error: any) {
      console.error("Error fetching programs:", error);
      toast.error(`Failed to load programs: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const togglePublished = async (programId: string, currentStatus: boolean) => {
    try {
      const programRef = doc(db, "programs", programId);
      await updateDoc(programRef, {
        published: !currentStatus,
      });
      
      toast.success(`Program ${!currentStatus ? 'published' : 'unpublished'} successfully`);
      fetchPrograms();
    } catch (error) {
      console.error("Error updating program:", error);
      toast.error("Failed to update program");
    }
  };

  const toggleFeatured = async (programId: string, currentStatus: boolean) => {
    try {
      const programRef = doc(db, "programs", programId);
      await updateDoc(programRef, {
        featured: !currentStatus,
      });
      
      toast.success(`Program ${!currentStatus ? 'featured' : 'unfeatured'} successfully`);
      fetchPrograms();
    } catch (error) {
      console.error("Error updating program:", error);
      toast.error("Failed to update program");
    }
  };

  const deleteProgram = async (programId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, "programs", programId));
      toast.success("Program deleted successfully");
      fetchPrograms();
    } catch (error) {
      console.error("Error deleting program:", error);
      toast.error("Failed to delete program");
    }
  };

  const filteredPrograms = programs.filter((program) => {
    if (filter === "published") return program.published;
    if (filter === "draft") return !program.published;
    return true;
  });

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            {authLoading ? "Authenticating..." : "Loading programs..."}
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">You must be logged in to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-center" />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Programs</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage all educational programs
            </p>
          </div>
          <Link
            href="/admin/programs/create"
            className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-colors font-semibold"
          >
            <span className="text-xl">➕</span>
            Create Program
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <span className="text-xl">📚</span>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Programs</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{programs.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <span className="text-xl">✅</span>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Published</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {programs.filter((p) => p.published).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <span className="text-xl">📝</span>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Drafts</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {programs.filter((p) => !p.published).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <span className="text-xl">⭐</span>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Featured</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {programs.filter((p) => p.featured).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 font-medium transition-colors ${
              filter === "all"
                ? "text-red-600 border-b-2 border-red-600"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            All Programs ({programs.length})
          </button>
          <button
            onClick={() => setFilter("published")}
            className={`px-4 py-2 font-medium transition-colors ${
              filter === "published"
                ? "text-red-600 border-b-2 border-red-600"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Published ({programs.filter((p) => p.published).length})
          </button>
          <button
            onClick={() => setFilter("draft")}
            className={`px-4 py-2 font-medium transition-colors ${
              filter === "draft"
                ? "text-red-600 border-b-2 border-red-600"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Drafts ({programs.filter((p) => !p.published).length})
          </button>
        </div>

        {/* Programs List */}
        {filteredPrograms.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-12 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {filter === "all" ? "No programs yet" : `No ${filter} programs`}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {filter === "all"
                ? "Create your first program to get started"
                : `There are no ${filter} programs at the moment`}
            </p>
            {filter === "all" && (
              <Link
                href="/admin/programs/create"
                className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-colors font-semibold"
              >
                <span className="text-xl">➕</span>
                Create First Program
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredPrograms.map((program) => (
              <div
                key={program.id}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 hover:border-gray-300 dark:hover:border-gray-700 transition-all"
              >
                <div className="flex gap-6">
                  {/* Thumbnail */}
                  <div className="relative w-48 h-32 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800">
                    <Image
                      src={program.thumbnail || "/placeholder-program.jpg"}
                      alt={program.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            {program.title}
                          </h3>
                          {program.featured && (
                            <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-semibold rounded-full">
                              ⭐ Featured
                            </span>
                          )}
                          {!program.published && (
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-semibold rounded-full">
                              📝 Draft
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                          {program.shortDescription}
                        </p>
                        <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <span>👨‍🍳</span> {program.instructorName}
                          </span>
                          <span className="flex items-center gap-1">
                            <span>💰</span> ${program.basePrice}
                          </span>
                          <span className="flex items-center gap-1">
                            <span>⏱️</span> {program.totalHours}h
                          </span>
                          <span className="flex items-center gap-1">
                            <span>📁</span> {program.category}
                          </span>
                          <span className="flex items-center gap-1">
                            <span>📊</span> {program.difficultyLevel}
                          </span>
                          {typeof program.reviewCount === "number" && program.reviewCount > 0 && (
                            <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400 font-medium">
                              <span>⭐</span>{" "}
                              {program.averageRating?.toFixed(1)} ({program.reviewCount} review{program.reviewCount !== 1 ? "s" : ""})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => togglePublished(program.id, program.published)}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                        program.published
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                    >
                      {program.published ? "✅ Published" : "📝 Publish"}
                    </button>

                    <button
                      onClick={() => toggleFeatured(program.id, program.featured)}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                        program.featured
                          ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/50"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                    >
                      {program.featured ? "⭐ Featured" : "☆ Feature"}
                    </button>

                    <Link
                      href={`/programs/${program.slug}`}
                      target="_blank"
                      className="px-4 py-2 rounded-lg font-medium text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors text-center"
                    >
                      👁️ View
                    </Link>

                    <Link
                      href={`/admin/programs/${program.id}/edit`}
                      className="px-4 py-2 rounded-lg font-medium text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors text-center"
                    >
                      ✏️ Edit
                    </Link>

                    <button
                      onClick={() => deleteProgram(program.id, program.title)}
                      className="px-4 py-2 rounded-lg font-medium text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
// Cache bust Sat Apr  4 16:22:55 +03 2026
