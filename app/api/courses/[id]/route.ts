import { NextRequest, NextResponse } from "next/server";
import { db, adminAuth } from "@/firebase/firebaseAdmin";
import { verifyUser, canManageResources, unauthorizedResponse, unauthenticatedResponse } from "@/lib/authHelpers";
import { createAuditLog } from "@/lib/auditLog";

// Helper to verify auth token
async function getUserFromToken(req: NextRequest): Promise<{ uid: string; role?: string } | null> {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return null;

    try {
        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await adminAuth.verifyIdToken(token);
        return { uid: decodedToken.uid };
    } catch {
        return null;
    }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify user authentication
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const doc = await db.collection("courses").doc(params.id).get();

    if (!doc.exists) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    const courseData = doc.data();

    // Check if user has access (enrolled or admin)
    const userDoc = await db.collection('users').doc(user.uid).get();
    const userData = userDoc.data();

    const isAdmin = userData?.role === 'admin' || userData?.role === 'owner';
    const purchasedCourses = userData?.purchasedCourses || [];
    const hasAccess = purchasedCourses.includes(params.id);

    if (!isAdmin && !hasAccess) {
      return NextResponse.json(
        { error: 'You do not have access to this course' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      id: doc.id,
      ...courseData,
      createdAt: courseData?.createdAt?.toDate?.()?.toISOString() || null,
      updatedAt: courseData?.updatedAt?.toDate?.()?.toISOString() || null,
    });
  } catch (error) {
    console.error("Error fetching course:", error);
    return NextResponse.json(
      { error: "Failed to fetch course" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verify user authentication and role
    const user = await verifyUser(req);

    if (!user) {
      return unauthenticatedResponse();
    }

    if (!canManageResources(user)) {
      return unauthorizedResponse("Only owners and assistants can update courses");
    }

    const body = await req.json();
    const { title, description, price, taxable, status } = body;

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = Number(price);
    if (taxable !== undefined) updateData.taxable = taxable;
    if (status !== undefined) {
      updateData.status = status;
      updateData.published = status === "published";
    }

    await db.collection("courses").doc(params.id).update(updateData);

    // Create audit log
    await createAuditLog({
      action: 'UPDATE_COURSE',
      performedBy: user.uid,
      performedByEmail: user.email,
      targetResourceId: params.id,
      targetResourceType: 'course',
      details: updateData,
    });

    return NextResponse.json({ 
      success: true,
      id: params.id 
    });
  } catch (error) {
    console.error("Error updating course:", error);
    return NextResponse.json(
      { error: "Failed to update course" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verify user authentication and role
    const user = await verifyUser(req);

    if (!user) {
      return unauthenticatedResponse();
    }

    if (!canManageResources(user)) {
      return unauthorizedResponse("Only owners and assistants can delete courses");
    }

    // Get course data before deleting for audit log
    const courseDoc = await db.collection("courses").doc(params.id).get();
    const courseData = courseDoc.data();

    await db.collection("courses").doc(params.id).delete();

    // Create audit log
    await createAuditLog({
      action: 'DELETE_COURSE',
      performedBy: user.uid,
      performedByEmail: user.email,
      targetResourceId: params.id,
      targetResourceType: 'course',
      details: {
        title: courseData?.title,
        price: courseData?.price,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting course:", error);
    return NextResponse.json(
      { error: "Failed to delete course" },
      { status: 500 }
    );
  }
}
