import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/firebase/firebaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userEmail, programId, lessonId, completed } = body;

    if (!userEmail || !programId || !lessonId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find the enrollment
    const enrollmentsQuery = await adminDb
      .collection("enrollments")
      .where("userEmail", "==", userEmail)
      .where("programId", "==", programId)
      .where("status", "==", "active")
      .limit(1)
      .get();

    if (enrollmentsQuery.empty) {
      return NextResponse.json(
        { error: "Enrollment not found" },
        { status: 404 }
      );
    }

    const enrollmentId = enrollmentsQuery.docs[0].id;

    // Get or create progress document
    const progressRef = adminDb
      .collection("enrollments")
      .doc(enrollmentId)
      .collection("progress")
      .doc(lessonId);

    const progressData = {
      lessonId,
      completed: completed ?? true,
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await progressRef.set(progressData, { merge: true });

    // Update enrollment completion percentage
    const totalLessons = await adminDb
      .collection("lessons")
      .where("programId", "==", programId)
      .get();

    const completedLessons = await adminDb
      .collection("enrollments")
      .doc(enrollmentId)
      .collection("progress")
      .where("completed", "==", true)
      .get();

    const completionPercent = totalLessons.size > 0
      ? Math.round((completedLessons.size / totalLessons.size) * 100)
      : 0;

    // Check if course is complete and certificate eligible
    const certificateEligible = completionPercent >= 100;

    await adminDb.collection("enrollments").doc(enrollmentId).update({
      completionPercent,
      certificateEligible,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      completionPercent,
      certificateEligible,
    });
  } catch (error) {
    console.error("Error tracking progress:", error);
    return NextResponse.json(
      { error: "Failed to track progress" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userEmail = searchParams.get("userEmail");
    const programId = searchParams.get("programId");

    if (!userEmail || !programId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Find the enrollment
    const enrollmentsQuery = await adminDb
      .collection("enrollments")
      .where("userEmail", "==", userEmail)
      .where("programId", "==", programId)
      .where("status", "==", "active")
      .limit(1)
      .get();

    if (enrollmentsQuery.empty) {
      return NextResponse.json(
        { error: "Enrollment not found" },
        { status: 404 }
      );
    }

    const enrollmentId = enrollmentsQuery.docs[0].id;

    // Get all progress documents
    const progressSnap = await adminDb
      .collection("enrollments")
      .doc(enrollmentId)
      .collection("progress")
      .get();

    const progress = progressSnap.docs.map((doc) => ({
      lessonId: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      progress,
      completionPercent: enrollmentsQuery.docs[0].data().completionPercent || 0,
    });
  } catch (error) {
    console.error("Error fetching progress:", error);
    return NextResponse.json(
      { error: "Failed to fetch progress" },
      { status: 500 }
    );
  }
}
