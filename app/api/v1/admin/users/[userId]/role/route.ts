import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/firebase/firebaseAdmin';
import { updateUserRoleSchema } from '@/lib/validation';
import { requireAdmin } from '@/lib/roleGuard';

// PATCH /api/v1/admin/users/[userId]/role - Update user role
export async function PATCH(
    req: NextRequest,
    { params }: { params: { userId: string } }
) {
    return requireAdmin(req, async () => {
        try {
            const body = await req.json();
            
            // Validate input
            const validatedData = updateUserRoleSchema.parse({
                userId: params.userId,
                ...body
            });

            const userRef = adminDb.collection('users').doc(params.userId);
            const userDoc = await userRef.get();

            if (!userDoc.exists) {
                return NextResponse.json(
                    { error: 'User not found' },
                    { status: 404 }
                );
            }

            await userRef.update({
                role: validatedData.role,
                updatedAt: new Date(),
            });

            const updated = await userRef.get();

            return NextResponse.json({
                success: true,
                user: {
                    uid: updated.id,
                    ...updated.data()
                }
            });

        } catch (error: any) {
            if (error.name === 'ZodError') {
                return NextResponse.json(
                    { error: 'Validation failed', details: error.errors },
                    { status: 400 }
                );
            }

            console.error('Error updating user role:', error);
            return NextResponse.json(
                { error: 'Failed to update user role' },
                { status: 500 }
            );
        }
    });
}
