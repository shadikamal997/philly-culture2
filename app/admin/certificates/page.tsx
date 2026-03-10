"use client";

import { useEffect, useState } from "react";
import { db } from "@/firebase/firebaseClient";
import { collection, getDocs, query, where } from "firebase/firestore";

interface Certificate {
  id: string;
  certificateId: string;
  userId: string;
  userName: string;
  userEmail: string;
  programId: string;
  programTitle: string;
  completionPercent: number;
  issuedAt: Date;
  manualCertificate?: boolean;
}

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "auto" | "manual">("all");

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const q = query(
        collection(db, "enrollments"),
        where("certificateIssued", "==", true)
      );
      
      const snap = await getDocs(q);
      const certs: Certificate[] = snap.docs.map(doc => ({
        id: doc.id,
        certificateId: doc.data().certificateId,
        userId: doc.data().userId,
        userName: doc.data().userName || "Unknown",
        userEmail: doc.data().userEmail,
        programId: doc.data().programId,
        programTitle: doc.data().programTitle,
        completionPercent: doc.data().completionPercent || 100,
        issuedAt: doc.data().certificateIssuedAt?.toDate() || new Date(),
        manualCertificate: doc.data().manualCertificate || false
      }));

      certs.sort((a, b) => b.issuedAt.getTime() - a.issuedAt.getTime());
      setCertificates(certs);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching certificates:", error);
      setLoading(false);
    }
  };

  const filteredCertificates = certificates.filter(cert => {
    if (filter === "auto") return !cert.manualCertificate;
    if (filter === "manual") return cert.manualCertificate;
    return true;
  });

  const downloadCertificate = (cert: Certificate) => {
    // Generate simple certificate HTML
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: 'Georgia', serif;
            max-width: 900px;
            margin: 50px auto;
            padding: 40px;
            border: 10px solid #C41E3A;
            background: #fff;
          }
          .header { text-align: center; margin-bottom: 40px; }
          .header h1 { font-size: 48px; color: #C41E3A; margin: 0; }
          .header p { font-size: 18px; color: #666; margin: 10px 0 0 0; }
          .certificate-body { text-align: center; padding: 40px 0; }
          .certificate-body h2 { font-size: 24px; color: #333; margin-bottom: 20px; }
          .student-name { font-size: 36px; color: #000; font-weight: bold; margin: 30px 0; }
          .program-title { font-size: 28px; color: #C41E3A; margin: 30px 0; }
          .completion { font-size: 18px; color: #666; margin: 20px 0; }
          .footer { margin-top: 60px; display: flex; justify-between; align-items: flex-end; }
          .signature { text-align: center; }
          .signature-line { border-top: 2px solid #000; width: 250px; margin: 50px auto 10px; }
          .cert-id { text-align: center; font-size: 12px; color: #999; margin-top: 40px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Philly Culture Academy</h1>
          <p>Certificate of Completion</p>
        </div>
        <div class="certificate-body">
          <h2>This certifies that</h2>
          <div class="student-name">${cert.userName}</div>
          <h2>has successfully completed</h2>
          <div class="program-title">${cert.programTitle}</div>
          <div class="completion">With a completion rate of ${cert.completionPercent}%</div>
          <div class="completion">Issued on ${cert.issuedAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
        <div class="footer">
          <div class="signature">
            <div class="signature-line"></div>
            <p>Authorized Signature</p>
          </div>
        </div>
        <div class="cert-id">
          Certificate ID: ${cert.certificateId}<br>
          Verify at: phillyculture.com/verify/${cert.certificateId}
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `certificate-${cert.certificateId}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <p className="mt-4 text-gray-600">Loading certificates...</p>
        </div>
      </main>
    );
  }

  const totalCertificates = certificates.length;
  const autoCertificates = certificates.filter(c => !c.manualCertificate).length;
  const manualCertificates = certificates.filter(c => c.manualCertificate).length;
  const thisMonth = certificates.filter(c => {
    const now = new Date();
    return c.issuedAt.getMonth() === now.getMonth() && 
           c.issuedAt.getFullYear() === now.getFullYear();
  }).length;

  return (
    <main className="max-w-7xl mx-auto px-6 py-16">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Certificate Management</h1>
        <p className="text-gray-600">Issued certificates and verification</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Issued</h3>
          <p className="text-3xl font-bold text-blue-600">{totalCertificates}</p>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">This Month</h3>
          <p className="text-3xl font-bold text-green-600">{thisMonth}</p>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Auto-Issued</h3>
          <p className="text-3xl font-bold text-purple-600">{autoCertificates}</p>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Manual</h3>
          <p className="text-3xl font-bold text-orange-600">{manualCertificates}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white border rounded-lg p-4 mb-6">
        <div className="flex gap-3">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded font-semibold ${
              filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All ({certificates.length})
          </button>
          <button
            onClick={() => setFilter("auto")}
            className={`px-4 py-2 rounded font-semibold ${
              filter === "auto"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Auto-Issued ({autoCertificates})
          </button>
          <button
            onClick={() => setFilter("manual")}
            className={`px-4 py-2 rounded font-semibold ${
              filter === "manual"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Manual ({manualCertificates})
          </button>
        </div>
      </div>

      {/* Certificates Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Certificate ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Program</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Completion</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Type</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Issued</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredCertificates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No certificates issued yet
                  </td>
                </tr>
              ) : (
                filteredCertificates.map((cert) => (
                  <tr key={cert.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono text-sm">{cert.certificateId}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold">{cert.userName}</p>
                        <p className="text-sm text-gray-600">{cert.userEmail}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">{cert.programTitle}</td>
                    <td className="px-6 py-4 text-right font-semibold text-green-600">
                      {cert.completionPercent}%
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        cert.manualCertificate
                          ? "bg-orange-100 text-orange-800"
                          : "bg-green-100 text-green-800"
                      }`}>
                        {cert.manualCertificate ? "MANUAL" : "AUTO"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">
                      {cert.issuedAt.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => downloadCertificate(cert)}
                        className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
                      >
                        Download
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Note */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-2">📜 Certificate System</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Auto-issued: Generated when student reaches 100% completion</li>
          <li>• Manual: Issued by admin in Student Management page</li>
          <li>• Each certificate has unique ID for verification</li>
          <li>• Students can verify certificates at /verify/[certificate-id]</li>
          <li>• Downloaded certificates include verification link</li>
        </ul>
      </div>
    </main>
  );
}
