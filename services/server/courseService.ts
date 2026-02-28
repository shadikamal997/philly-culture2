import { adminDb } from '@/firebase/firebaseAdmin';
import { Course, Lesson } from '@/types/firestore/course';

export async function getPublishedCourses(): Promise<Course[]> {
    const snapshot = await adminDb.collection('courses')
        .where('isPublished', '==', true)
        .get();

    return snapshot.docs.map(doc => ({ courseId: doc.id, ...doc.data() } as Course));
}

export async function getCourseBySlug(slug: string): Promise<Course | null> {
    const snapshot = await adminDb.collection('courses')
        .where('slug', '==', slug)
        .limit(1)
        .get();

    if (snapshot.empty) return null;
    return { courseId: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Course;
}

export async function getCourseLessons(courseId: string): Promise<Lesson[]> {
    const snapshot = await adminDb.collection('courses')
        .doc(courseId)
        .collection('lessons')
        .where('isPublished', '==', true)
        .orderBy('order', 'asc')
        .get();

    return snapshot.docs.map(doc => ({ lessonId: doc.id, ...doc.data() } as Lesson));
}
