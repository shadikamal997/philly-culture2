"use client";

import { useEffect, useState } from "react";
import { db } from "@/firebase/firebaseClient";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";

interface Student {
  userId: string;
  email: string;
  name: string;
  enrollmentCount: number;
  totalSpent: number;
  avgCompletion: number;
  enrollments: any[];
  createdAt: Date;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const enrollmentsSnap = await getDocs(collection(db, "enrollments"));
      const enrollments = enrollmentsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Group by user
      const studentMap: Record<string, Student> = {};

      enrollments.forEach((enrollment: any) => {
        const userId = enrollment.userId;
        if (!studentMap[userId]) {
          studentMap[userId] = {
            userId,
            email: enrollment.userEmail || "N/A",
            name: enrollment.userName || "Unknown",
            enrollmentCount: 0,
            totalSpent: 0,
            avgCompletion: 0,
            enrollments: [],
            createdAt: enrollment.createdAt?.toDate() || new Date()
          };
        }

        studentMap[userId].enrollmentCount += 1;
        studentMap[userId].totalSpent += enrollment.totalAmount || 0;
        studentMap[userId].enrollments.push(enrollment);
      });

      // Calculate average completion
      Object.values(studentMap).forEach(student => {
        const totalCompletion = student.enrollments.reduce(
          (sum, e) => sum + (e.completionPercent || 0),
          0
        );
        student.avgCompletion = student.enrollmentCount > 0
          ? totalCompletion / student.enrollmentCount
          : 0;
      });

      const studentsArray = Object.values(studentMap);
      studentsArray.sort((a, b) => b.totalSpent - a.totalSpent);

      setStudents(studentsArray);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching students:", error);
      setLoading(false);
    }
  };

  const handleRevokeAccess = async (enrollmentId: string) => {
    if (!confirm("Revoke access to this program? Student will lose access immediately.")) return;

    setActionLoading(true);
    try {
      const enrollmentRef = doc(db, "enrollments", enrollmentId);
      await updateDoc(enrollmentRef, {
        status: "revoked",
        revokedAt: new Date()
      });
      alert("Access revoked successfully");
      fetchStudents();
    } catch (error) {
      console.error("Error revoking access:", error);
      alert("Failed to revoke access");
    } finally {
      setActionLoading(false);
    }
  };

  const handleExtendAccess = async (enrollmentId: string) => {
    const days = prompt("Extend access by how many days?");
    if (!days || isNaN(Number(days))) return;

    setActionLoading(true);
    try {
      const enrollmentRef = doc(db, "enrollments", enrollmentId);
      const enrollment = selectedStudent?.enrollments.find(e => e.id === enrollmentId);
      
      if (!enrollment) return;

      const currentExpiration = enrollment.expiresAt?.toDate() || new Date();
      const newExpiration = new Date(currentExpiration.getTime() + Number(days) * 24 * 60 * 60 * 1000);

      await updateDoc(enrollmentRef, {
        expiresAt: newExpiration,
        accessExtended: true,
        extensionDays: Number(days)
      });

      alert(`Access extended by ${days} days`);
      fetchStudents();
      setSelectedStudent(null);
    } catch (error) {
      console.error("Error extending access:", error);
      alert("Failed to extend access");
    } finally {
      setActionLoading(false);
    }
  };

  const handleIssueCertificate = async (enrollmentId: string) => {
    if (!confirm("Manually issue certificate for this student?")) return;

    setActionLoading(true);
    try {
      const enrollment = selectedStudent?.enrollments.find(e => e.id === enrollmentId);
      if (!enrollment) return;

      // Create certificate
      const certificateId = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      await updateDoc(doc(db, "enrollments", enrollmentId), {
        certificateIssued: true,
        certificateId,
        certificateIssuedAt: new Date(),
        manualCertificate: true
      });

      alert(`Certificate ${certificateId} issued successfully`);
      fetchStudents();
      setSelectedStudent(null);
    } catch (error) {
      console.error("Error issuing certificate:", error);
      alert("Failed to issue certificate");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <p className="mt-4 text-gray-600">Loading students...</p>
        </div>
      </main>
    );
  }

  const totalStudents = students.length;
  const totalRevenue = students.reduce((sum, s) => sum + s.totalSpent, 0);
  const avgLifetimeValue = totalStudents > 0 ? totalRevenue / totalStudents : 0;
  const avgEnrollments = totalStudents > 0
    ? students.reduce((sum, s) => sum + s.enrollmentCount, 0) / totalStudents
    : 0;

  return (
    <main className="max-w-7xl mx-auto px-6 py-16">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Student Management</h1>
        <p className="text-gray-600">Manage student enrollments and access</p>
      </div>

      {/* Summary Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Students</h3>
          <p className="text-3xl font-bold text-blue-600">{totalStudents}</p>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold text-green-600">${totalRevenue.toFixed(2)}</p>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Avg Lifetime Value</h3>
          <p className="text-3xl font-bold text-purple-600">${avgLifetimeValue.toFixed(2)}</p>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Avg Enrollments</h3>
          <p className="text-3xl font-bold text-orange-600">{avgEnrollments.toFixed(1)}</p>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Student</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Enrollments</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Total Spent</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Avg Completion</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Joined</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No students yet
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.userId} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold">{student.name}</p>
                        <p className="text-sm text-gray-600">{student.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold">{student.enrollmentCount}</td>
                    <td className="px-6 py-4 text-right font-semibold text-green-600">
                      ${student.totalSpent.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`font-semibold ${
                        student.avgCompletion >= 80 ? 'text-green-600' :
                        student.avgCompletion >= 50 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {student.avgCompletion.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">
                      {student.createdAt.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setSelectedStudent(student)}
                        className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold">{selectedStudent.name}</h2>
                  <p className="text-gray-600">{selectedStudent.email}</p>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-lg font-bold mb-4">Enrollments</h3>
              <div className="space-y-4">
                {selectedStudent.enrollments.map((enrollment: any) => (
                  <div key={enrollment.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold">{enrollment.programTitle}</p>
                        <p className="text-sm text-gray-600">
                          Enrolled: {enrollment.createdAt?.toDate().toLocaleDateString()}
                        </p>
                        {enrollment.expiresAt && (
                          <p className="text-sm text-gray-600">
                            Expires: {enrollment.expiresAt.toDate().toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded text-sm font-semibold ${
                        enrollment.status === "active" ? "bg-green-100 text-green-800" :
                        enrollment.status === "expired" ? "bg-gray-100 text-gray-800" :
                        enrollment.status === "revoked" ? "bg-red-100 text-red-800" :
                        "bg-blue-100 text-blue-800"
                      }`}>
                        {enrollment.status?.toUpperCase() || "ACTIVE"}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Completion</p>
                        <p className="font-semibold">{enrollment.completionPercent || 0}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Amount Paid</p>
                        <p className="font-semibold">${enrollment.totalAmount?.toFixed(2) || "0.00"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Certificate</p>
                        <p className="font-semibold">
                          {enrollment.certificateIssued ? "✅ Issued" : "❌ Not Issued"}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleExtendAccess(enrollment.id)}
                        disabled={actionLoading || enrollment.status === "revoked"}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 text-sm"
                      >
                        Extend Access
                      </button>
                      
                      <button
                        onClick={() => handleRevokeAccess(enrollment.id)}
                        disabled={actionLoading || enrollment.status === "revoked"}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-300 text-sm"
                      >
                        Revoke Access
                      </button>

                      <button
                        onClick={() => handleIssueCertificate(enrollment.id)}
                        disabled={actionLoading || enrollment.certificateIssued}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-300 text-sm"
                      >
                        {enrollment.certificateIssued ? "Certificate Issued" : "Issue Certificate"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
