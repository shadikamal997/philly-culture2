"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

interface CertificateData {
  certificateId: string;
  userName: string;
  userEmail: string;
  programTitle: string;
  completionPercent: number;
  issuedAt: Date;
  verified: boolean;
}

export default function VerifyCertificatePage() {
  const params = useParams();
  const certificateId = params.id as string;
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (certificateId) {
      verifyCertificate();
    }
  }, [certificateId]);

  const verifyCertificate = async () => {
    try {
      const q = query(
        collection(db, "enrollments"),
        where("certificateId", "==", certificateId),
        where("certificateIssued", "==", true)
      );

      const snap = await getDocs(q);

      if (snap.empty) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const data = snap.docs[0].data();
      setCertificate({
        certificateId,
        userName: data.userName || "Unknown",
        userEmail: data.userEmail,
        programTitle: data.programTitle,
        completionPercent: data.completionPercent || 100,
        issuedAt: data.certificateIssuedAt?.toDate() || new Date(),
        verified: true
      });
      setLoading(false);
    } catch (error) {
      console.error("Error verifying certificate:", error);
      setNotFound(true);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          <p className="mt-4 text-gray-600">Verifying certificate...</p>
        </div>
      </main>
    );
  }

  if (notFound || !certificate) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
        <div className="max-w-md w-full bg-white border-2 border-red-300 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-red-600 mb-2">Certificate Not Found</h1>
          <p className="text-gray-600 mb-6">
            The certificate ID <span className="font-mono font-semibold">{certificateId}</span> could not be verified.
          </p>
          <p className="text-sm text-gray-500">
            This certificate may not exist or has been revoked. Please contact Philly Culture Academy
            if you believe this is an error.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-6 py-12">
      <div className="max-w-2xl w-full">
        {/* Verification Badge */}
        <div className="bg-white border-2 border-green-300 rounded-lg p-8 text-center mb-6">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-3xl font-bold text-green-600 mb-2">Certificate Verified</h1>
          <p className="text-gray-600">This is a valid Philly Culture Academy certificate</p>
        </div>

        {/* Certificate Details */}
        <div className="bg-white border rounded-lg p-8 shadow-lg">
          <div className="border-4 border-red-600 p-8">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-red-600 mb-2">Philly Culture Academy</h2>
              <p className="text-xl text-gray-600">Certificate of Completion</p>
            </div>

            <div className="space-y-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">This certifies that</p>
                <p className="text-3xl font-bold text-gray-900">{certificate.userName}</p>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">has successfully completed</p>
                <p className="text-2xl font-bold text-red-600">{certificate.programTitle}</p>
              </div>

              <div className="text-center">
                <p className="text-gray-600">
                  With a completion rate of <span className="font-bold text-green-600">{certificate.completionPercent}%</span>
                </p>
              </div>

              <div className="text-center pt-6 border-t">
                <p className="text-sm text-gray-600">Issued on</p>
                <p className="font-semibold text-gray-900">
                  {certificate.issuedAt.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>

              <div className="text-center pt-6 border-t">
                <p className="text-xs text-gray-500 font-mono">Certificate ID</p>
                <p className="text-sm font-mono font-semibold text-gray-700">{certificate.certificateId}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-bold text-blue-900 mb-2">📋 Verification Details</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• This certificate was verified on {new Date().toLocaleDateString()}</li>
            <li>• Certificate is authentic and issued by Philly Culture Academy</li>
            <li>• Verification performed against official records</li>
            <li>• For inquiries, contact: info@phillyculture.com</li>
          </ul>
        </div>

        <div className="text-center mt-6">
          <a
            href="/"
            className="inline-block px-6 py-3 bg-red-600 text-white font-semibold rounded hover:bg-red-700"
          >
            Return to Homepage
          </a>
        </div>
      </div>
    </main>
  );
}
