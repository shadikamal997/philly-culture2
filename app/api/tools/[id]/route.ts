import { NextResponse } from "next/server";
import { db } from "@/firebase/firebaseAdmin";
import { verifyUser, canManageResources, unauthorizedResponse, unauthenticatedResponse } from "@/lib/authHelpers";
import { createAuditLog } from "@/lib/auditLog";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const doc = await db.collection("tools").doc(params.id).get();

    if (!doc.exists) {
      return NextResponse.json(
        { error: "Tool not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data()?.createdAt?.toDate?.()?.toISOString() || null,
      updatedAt: doc.data()?.updatedAt?.toDate?.()?.toISOString() || null,
    });
  } catch (error) {
    console.error("Error fetching tool:", error);
    return NextResponse.json(
      { error: "Failed to fetch tool" },
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
      return unauthorizedResponse("Only owners and assistants can update tools");
    }

    const body = await req.json();
    const { title, description, price, taxable, inventory, sku, weight, shippingRequired, status } = body;

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = Number(price);
    if (taxable !== undefined) updateData.taxable = taxable;
    if (inventory !== undefined) updateData.inventory = Number(inventory);
    if (sku !== undefined) updateData.sku = sku.toUpperCase();
    if (weight !== undefined) updateData.weight = Number(weight);
    if (shippingRequired !== undefined) updateData.shippingRequired = shippingRequired;
    if (status !== undefined) {
      updateData.status = status;
      updateData.published = status === "published";
    }

    await db.collection("tools").doc(params.id).update(updateData);

    // Create audit log
    await createAuditLog({
      action: 'UPDATE_TOOL',
      performedBy: user.uid,
      performedByEmail: user.email,
      targetResourceId: params.id,
      targetResourceType: 'tool',
      details: updateData,
    });

    return NextResponse.json({ 
      success: true,
      id: params.id 
    });
  } catch (error) {
    console.error("Error updating tool:", error);
    return NextResponse.json(
      { error: "Failed to update tool" },
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
      return unauthorizedResponse("Only owners and assistants can delete tools");
    }

    // Get tool data before deleting for audit log
    const toolDoc = await db.collection("tools").doc(params.id).get();
    const toolData = toolDoc.data();

    await db.collection("tools").doc(params.id).delete();

    // Create audit log
    await createAuditLog({
      action: 'DELETE_TOOL',
      performedBy: user.uid,
      performedByEmail: user.email,
      targetResourceId: params.id,
      targetResourceType: 'tool',
      details: {
        title: toolData?.title,
        price: toolData?.price,
        sku: toolData?.sku,
        inventory: toolData?.inventory,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting tool:", error);
    return NextResponse.json(
      { error: "Failed to delete tool" },
      { status: 500 }
    );
  }
}
