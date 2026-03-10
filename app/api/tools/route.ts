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
      return unauthorizedResponse("Only owners and assistants can create tools");
    }

    const body = await req.json();
    const { title, description, price, taxable, inventory, sku, weight, shippingRequired } = body;

    // Validation
    if (!title || !description || price === undefined || inventory === undefined || !sku) {
      return NextResponse.json(
        { error: "Missing required fields (title, description, price, inventory, sku)" },
        { status: 400 }
      );
    }

    const toolRef = await db.collection("tools").add({
      title,
      description,
      price: Number(price),
      taxable: taxable !== false, // default to true
      taxCategory: "physical_goods",
      inventory: Number(inventory),
      sku: sku.toUpperCase(),
      weight: weight ? Number(weight) : 0,
      shippingRequired: shippingRequired !== false, // default to true
      status: "draft",
      published: false,
      createdBy: user.email,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create audit log
    await createAuditLog({
      action: 'CREATE_TOOL',
      performedBy: user.uid,
      performedByEmail: user.email,
      targetResourceId: toolRef.id,
      targetResourceType: 'tool',
      details: {
        title,
        price: Number(price),
        inventory: Number(inventory),
        sku: sku.toUpperCase(),
      },
    });

    return NextResponse.json({ 
      id: toolRef.id,
      success: true 
    });
  } catch (error) {
    console.error("Error creating tool:", error);
    return NextResponse.json(
      { error: "Failed to create tool" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const snapshot = await db.collection("tools").orderBy("createdAt", "desc").get();

    const tools = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || null,
    }));

    return NextResponse.json(tools);
  } catch (error) {
    console.error("Error fetching tools:", error);
    return NextResponse.json(
      { error: "Failed to fetch tools" },
      { status: 500 }
    );
  }
}
