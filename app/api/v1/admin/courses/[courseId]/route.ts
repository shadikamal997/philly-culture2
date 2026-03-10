import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/firebase/firebaseAdmin';
import { courseSchema } from '@/lib/validation';
import { requireAdmin } from '@/lib/roleGuard';

// GET /api/v1/admin/courses/[courseId] - Get single course
export async function GET(
    req: NextRequest,
    { params }: { params: { courseId: string } }
) {
    return requireAdmin(req, async () => {
        try {
            const courseDoc = await adminDb.collection('courses').doc(params.courseId).get();

            if (!courseDoc.exists) {
                return NextResponse.json(
                    { error: 'Course not found' },
                    { status: 404 }
                );
            }

            return NextResponse.json({
                courseId: courseDoc.id,
                ...courseDoc.data()
            });
        } catch (error) {
            console.error('Error fetching course:', error);
            return NextResponse.json(
                { error: 'Failed to fetch course' },
                { status: 500 }
            );
        }
    });
}

// PUT /api/v1/admin/courses/[courseId] - Update course
export async function PUT(
    req: NextRequest,
    { params }: { params: { courseId: string } }
) {
    return requireAdmin(req, async () => {
        try {
            const body = await req.json();
            
            // Validate input (partial update allowed)
            const validatedData = courseSchema.partial().parse(body);

            // If slug is being updated, check uniqueness
            if (validatedData.slug) {
                const existingSlug = await adminDb.collection('courses')
                    .where('slug', '==', validatedData.slug)
                    .limit(2)
                    .get();

                const otherCourseWithSlug = existingSlug.docs.find(
                    doc => doc.id !== params.courseId
                );

                if (otherCourseWithSlug) {
                    return NextResponse.json(
                        { error: 'Another course with this slug already exists' },
                        { status: 400 }
                    );
                }
            }

            // Update course
            const courseRef = adminDb.collection('courses').doc(params.courseId);
            const courseDoc = await courseRef.get();

            if (!courseDoc.exists) {
                return NextResponse.json(
                    { error: 'Course not found' },
                    { status: 404 }
                );
            }

            const updateData = {
                ...validatedData,
                updatedAt: new Date(),
            };

            await courseRef.update(updateData);

            const updated = await courseRef.get();

            return NextResponse.json({
                success: true,
                course: {
                    courseId: updated.id,
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

            console.error('Error updating course:', error);
            return NextResponse.json(
                { error: 'Failed to update course' },
                { status: 500 }
            );
        }
    });
}

// DELETE /api/v1/admin/courses/[courseId] - Delete course
export async function DELETE(
    req: NextRequest,
    { params }: { params: { courseId: string } }
) {
    return requireAdmin(req, async () => {
        try {
            const courseRef = adminDb.collection('courses').doc(params.courseId);
            const courseDoc = await courseRef.get();

            if (!courseDoc.exists) {
                return NextResponse.json(
                    { error: 'Course not found' },
                    { status: 404 }
                );
            }

            // Delete all lessons subcollection
            const lessonsSnapshot = await courseRef.collection('lessons').get();
            const batch = adminDb.batch();
            lessonsSnapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
            await batch.commit();

            // Delete the course
            await courseRef.delete();

            return NextResponse.json({
                success: true,
                message: 'Course and all lessons deleted successfully'
            });

        } catch (error) {
            console.error('Error deleting course:', error);
            return NextResponse.json(
                { error: 'Failed to delete course' },
                { status: 500 }
            );
        }
    });
}
