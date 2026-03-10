import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/firebase/firebaseAdmin';
import { courseSchema } from '@/lib/validation';
import { requireAdmin } from '@/lib/roleGuard';

// GET /api/v1/admin/courses - List all courses
export async function GET(req: NextRequest) {
    return requireAdmin(req, async () => {
        try {
            const snapshot = await adminDb.collection('courses')
                .orderBy('createdAt', 'desc'
)
                .get();

            const courses = snapshot.docs.map(doc => ({
                courseId: doc.id,
                ...doc.data()
            }));

            return NextResponse.json({ courses });
        } catch (error) {
            console.error('Error fetching courses:', error);
            return NextResponse.json(
                { error: 'Failed to fetch courses' },
                { status: 500 }
            );
        }
    });
}

// POST /api/v1/admin/courses - Create new course
export async function POST(req: NextRequest) {
    return requireAdmin(req, async () => {
        try {
            const body = await req.json();
            
            // Validate input
            const validatedData = courseSchema.parse(body);

            // Check if slug already exists
            const existingSlug = await adminDb.collection('courses')
                .where('slug', '==', validatedData.slug)
                .limit(1)
                .get();

            if (!existingSlug.empty) {
                return NextResponse.json(
                    { error: 'A course with this slug already exists' },
                    { status: 400 }
                );
            }

            // Create course
            const courseRef = adminDb.collection('courses').doc();
            const courseData = {
                ...validatedData,
                courseId: courseRef.id,
                currency: 'USD',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            await courseRef.set(courseData);

            return NextResponse.json({
                success: true,
                course: courseData
            }, { status: 201 });

        } catch (error: any) {
            if (error.name === 'ZodError') {
                return NextResponse.json(
                    { error: 'Validation failed', details: error.errors },
                    { status: 400 }
                );
            }

            console.error('Error creating course:', error);
            return NextResponse.json(
                { error: 'Failed to create course' },
                { status: 500 }
            );
        }
    });
}
