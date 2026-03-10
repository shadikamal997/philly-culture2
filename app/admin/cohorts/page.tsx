"use client";

import { useEffect, useState } from "react";
import { db } from "@/firebase/firebaseClient";
import { collection, getDocs, doc, updateDoc, query, where } from "firebase/firestore";

interface CohortProgram {
  id: string;
  title: string;
  programType: string;
  cohortStartDate: Date;
  cohortEndDate?: Date;
  enrollmentDeadline?: Date;
  maxStudents?: number;
  currentEnrollments: number;
  enrolledStudents: any[];
  status: "upcoming" | "active" | "completed";
}

export default function CohortsPage() {
  const [cohorts, setCohorts] = useState<CohortProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCohort, setSelectedCohort] = useState<CohortProgram | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchCohorts();
  }, []);

  const fetchCohorts = async () => {
    try {
      // Get all programs with cohort unlock type
      const programsSnap = await getDocs(collection(db, "programs"));
      const cohortPrograms = programsSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter((p: any) => p.unlockType === "scheduled");

      // Get all enrollments
      const enrollmentsSnap = await getDocs(collection(db, "enrollments"));
      const enrollments = enrollmentsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const cohortsData: CohortProgram[] = cohortPrograms.map((program: any) => {
        const programEnrollments = enrollments.filter((e: any) => e.programId === program.id);
        const startDate = program.cohortStartDate?.toDate() || new Date();
        const now = new Date();

        let status: "upcoming" | "active" | "completed" = "upcoming";
        if (program.cohortEndDate) {
          const endDate = program.cohortEndDate.toDate();
          if (now > endDate) {
            status = "completed";
          } else if (now >= startDate && now <= endDate) {
            status = "active";
          }
        } else if (now >= startDate) {
          status = "active";
        }

        return {
          id: program.id,
          title: program.title,
          programType: program.programType || "intensive",
          cohortStartDate: startDate,
          cohortEndDate: program.cohortEndDate?.toDate(),
          enrollmentDeadline: program.enrollmentDeadline?.toDate(),
          maxStudents: program.maxStudents,
          currentEnrollments: programEnrollments.length,
          enrolledStudents: programEnrollments,
          status
        };
      });

      cohortsData.sort((a, b) => a.cohortStartDate.getTime() - b.cohortStartDate.getTime());
      setCohorts(cohortsData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching cohorts:", error);
      setLoading(false);
    }
  };

  const handleCloseEnrollment = async (cohortId: string) => {
    if (!confirm("Close enrollment for this cohort? No more students can enroll.")) return;

    setActionLoading(true);
    try {
      await updateDoc(doc(db, "programs", cohortId), {
        enrollmentClosed: true,
        enrollmentClosedAt: new Date()
      });
      alert("Enrollment closed successfully");
      fetchCohorts();
      setSelectedCohort(null);
    } catch (error) {
      console.error("Error closing enrollment:", error);
      alert("Failed to close enrollment");
    } finally {
      setActionLoading(false);
    }
  };

  const handleExtendStartDate = async (cohortId: string) => {
    const days = prompt("Extend start date by how many days?");
    if (!days || isNaN(Number(days))) return;

    setActionLoading(true);
    try {
      const cohort = cohorts.find(c => c.id === cohortId);
      if (!cohort) return;

      const newStartDate = new Date(
        cohort.cohortStartDate.getTime() + Number(days) * 24 * 60 * 60 * 1000
      );

      await updateDoc(doc(db, "programs", cohortId), {
        cohortStartDate: newStartDate,
        startDateExtended: true,
        extensionDays: Number(days)
      });

      alert(`Start date extended by ${days} days`);
      fetchCohorts();
      setSelectedCohort(null);
    } catch (error) {
      console.error("Error extending start date:", error);
      alert("Failed to extend start date");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <p className="mt-4 text-gray-600">Loading cohorts...</p>
        </div>
      </main>
    );
  }

  const upcomingCohorts = cohorts.filter(c => c.status === "upcoming");
  const activeCohorts = cohorts.filter(c => c.status === "active");
  const completedCohorts = cohorts.filter(c => c.status === "completed");
  const totalStudents = cohorts.reduce((sum, c) => sum + c.currentEnrollments, 0);

  return (
    <main className="max-w-7xl mx-auto px-6 py-16">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Cohort Management</h1>
        <p className="text-gray-600">Manage scheduled programs and cohort timing</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Cohorts</h3>
          <p className="text-3xl font-bold text-blue-600">{cohorts.length}</p>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Active</h3>
          <p className="text-3xl font-bold text-green-600">{activeCohorts.length}</p>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Upcoming</h3>
          <p className="text-3xl font-bold text-purple-600">{upcomingCohorts.length}</p>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Students</h3>
          <p className="text-3xl font-bold text-orange-600">{totalStudents}</p>
        </div>
      </div>

      {/* Cohorts Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Program</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Start Date</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Enrollment Deadline</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Students</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Capacity</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {cohorts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No cohort programs yet
                  </td>
                </tr>
              ) : (
                cohorts.map((cohort) => {
                  const capacity = cohort.maxStudents || Infinity;
                  const capacityPercent = capacity === Infinity ? 0 : (cohort.currentEnrollments / capacity) * 100;
                  const seatsRemaining = capacity === Infinity ? "Unlimited" : capacity - cohort.currentEnrollments;

                  return (
                    <tr key={cohort.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold">{cohort.title}</p>
                          <p className="text-sm text-gray-600 capitalize">{cohort.programType}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded text-xs font-semibold ${
                          cohort.status === "active" ? "bg-green-100 text-green-800" :
                          cohort.status === "upcoming" ? "bg-blue-100 text-blue-800" :
                          "bg-gray-100 text-gray-800"
                        }`}>
                          {cohort.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-sm">
                        {cohort.cohortStartDate.toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-center text-sm">
                        {cohort.enrollmentDeadline
                          ? cohort.enrollmentDeadline.toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold">
                        {cohort.currentEnrollments}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className={`font-semibold ${
                            typeof seatsRemaining === "number" && seatsRemaining <= 5 && seatsRemaining > 0
                              ? "text-orange-600"
                              : seatsRemaining === 0
                              ? "text-red-600"
                              : "text-green-600"
                          }`}>
                            {seatsRemaining}
                          </span>
                          {capacity !== Infinity && (
                            <span className="text-sm text-gray-600">/ {capacity}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => setSelectedCohort(cohort)}
                          className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cohort Details Modal */}
      {selectedCohort && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold">{selectedCohort.title}</h2>
                  <p className="text-gray-600 capitalize">{selectedCohort.programType} Program</p>
                </div>
                <button
                  onClick={() => setSelectedCohort(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Cohort Info */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Start Date</h3>
                  <p className="font-semibold">{selectedCohort.cohortStartDate.toLocaleDateString()}</p>
                </div>
                {selectedCohort.cohortEndDate && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-1">End Date</h3>
                    <p className="font-semibold">{selectedCohort.cohortEndDate.toLocaleDateString()}</p>
                  </div>
                )}
                {selectedCohort.enrollmentDeadline && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-1">Enrollment Deadline</h3>
                    <p className="font-semibold">{selectedCohort.enrollmentDeadline.toLocaleDateString()}</p>
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Current Enrollment</h3>
                  <p className="font-semibold">
                    {selectedCohort.currentEnrollments}
                    {selectedCohort.maxStudents && ` / ${selectedCohort.maxStudents}`}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mb-6">
                <button
                  onClick={() => handleExtendStartDate(selectedCohort.id)}
                  disabled={actionLoading || selectedCohort.status === "completed"}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300"
                >
                  Extend Start Date
                </button>
                <button
                  onClick={() => handleCloseEnrollment(selectedCohort.id)}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-300"
                >
                  Close Enrollment
                </button>
              </div>

              {/* Enrolled Students */}
              <div>
                <h3 className="text-lg font-bold mb-4">Enrolled Students</h3>
                {selectedCohort.enrolledStudents.length === 0 ? (
                  <p className="text-gray-500 text-center py-6">No students enrolled yet</p>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {selectedCohort.enrolledStudents.map((student: any) => (
                      <div key={student.id} className="border rounded-lg p-4 flex justify-between items-center">
                        <div>
                          <p className="font-semibold">{student.userName || "Unknown"}</p>
                          <p className="text-sm text-gray-600">{student.userEmail}</p>
                          <p className="text-sm text-gray-500">
                            Enrolled: {student.createdAt?.toDate().toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Completion</p>
                          <p className="font-semibold text-green-600">
                            {student.completionPercent || 0}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
