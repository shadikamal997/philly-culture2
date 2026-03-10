import { adminDb } from '@/firebase/firebaseAdmin';
import { Course } from '@/types/firestore/course';
import { Lesson } from '@/types/firestore/lesson';

export async function getPublishedCourses(): Promise<Course[]> {
    const snapshot = await adminDb.collection('courses')
        .where('isPublished', '==', true)
        .get();

    return snapshot.docs.map(doc => ({
        courseId: doc.id,
        ...doc.data()
    } as Course));
}

export async function getCourseById(courseId: string): Promise<Course | null> {
    const doc = await adminDb.collection('courses').doc(courseId).get();
    if (!doc.exists) return null;
    return {
        courseId: doc.id,
        ...doc.data()
    } as Course;
}

export async function getCourseBySlug(slug: string): Promise<Course | null> {
    const snapshot = await adminDb.collection('courses')
        .where('slug', '==', slug)
        .limit(1)
        .get();

    if (snapshot.empty) return null;
    const docData = snapshot.docs[0].data();
    return {
        courseId: snapshot.docs[0].id,
        ...docData
    } as Course;
}

export async function getCourseLessons(courseId: string): Promise<Lesson[]> {
    const snapshot = await adminDb.collection('courses')
        .doc(courseId)
        .collection('lessons')
        .where('isPublished', '==', true)
        .orderBy('order', 'asc')
        .get();

    return snapshot.docs.map(doc => ({
        lessonId: doc.id,
        ...doc.data()
    } as Lesson));
}
