import { NextResponse } from "next/server";
import { db } from "@/firebase/firebaseAdmin";
import { verifyUser, canManageResources, unauthorizedResponse, unauthenticatedResponse } from "@/lib/authHelpers";
import { createAuditLog } from "@/lib/auditLog";

export async function POST(req: Request) {
  try {
    // Verify user authentication and role
    const user = await verifyUser(req);

    if (!user) {
      return unauthenticatedResponse();
    }

    if (!canManageResources(user)) {
      return unauthorizedResponse("Only owners and assistants can create courses");
    }

    const body = await req.json();
    const { title, description, price, taxable } = body;

    // Validation
    if (!title || !description || price === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const courseRef = await db.collection("courses").add({
      title,
      description,
      price: Number(price),
      taxable: taxable !== false, // default to true
      taxCategory: "digital_education",
      status: "draft",
      published: false,
      createdBy: user.email,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create audit log
    await createAuditLog({
      action: 'CREATE_COURSE',
      performedBy: user.uid,
      performedByEmail: user.email,
      targetResourceId: courseRef.id,
      targetResourceType: 'course',
      details: {
        title,
        price: Number(price),
        taxable: taxable !== false,
      },
    });

    return NextResponse.json({ 
      id: courseRef.id,
      success: true 
    });
  } catch (error) {
    console.error("Error creating course:", error);
    return NextResponse.json(
      { error: "Failed to create course" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const snapshot = await db.collection("courses").orderBy("createdAt", "desc").get();

    const courses = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || null,
    }));

    return NextResponse.json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}
