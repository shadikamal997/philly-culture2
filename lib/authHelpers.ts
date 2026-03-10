import { NextResponse } from "next/server";
import { adminAuth, db } from "@/firebase/firebaseAdmin";

export interface AuthUser {
  uid: string;
  email: string;
  role: string;
}

/**
 * Verify Firebase ID token and get user data
 * Returns user data if valid, null if invalid
 */
export async function verifyUser(req: Request): Promise<AuthUser | null> {
  try {
    const authHeader = req.headers.get("Authorization");
    
    if (!authHeader?.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.split("Bearer ")[1];

    if (!token) {
      return null;
    }

    // Verify the Firebase ID token
    const decoded = await adminAuth.verifyIdToken(token);

    // Get user data from Firestore
    const userDoc = await db.collection("users").doc(decoded.uid).get();

    if (!userDoc.exists) {
      return null;
    }

    const userData = userDoc.data();

    return {
      uid: decoded.uid,
      email: decoded.email || userData?.email || "",
      role: userData?.role || "customer",
    };
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
}

/**
 * Check if user can manage resources (owner or assistant)
 */
export function canManageResources(user: AuthUser | null): boolean {
  if (!user) return false;
  return user.role === "owner" || user.role === "assistant";
}

/**
 * Create unauthorized response
 */
export function unauthorizedResponse(message = "Unauthorized") {
  return NextResponse.json({ error: message }, { status: 403 });
}

/**
 * Create unauthenticated response
 */
export function unauthenticatedResponse(message = "Authentication required") {
  return NextResponse.json({ error: message }, { status: 401 });
}
