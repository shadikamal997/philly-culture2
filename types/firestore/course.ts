import { Timestamp } from 'firebase/firestore';

export interface Course {
    courseId: string;
    title: string;
    slug: string;
    description: string;
    shortDescription: string;
    price: number;
    currency: 'USD';
    thumbnailURL: string;
    previewVideoURL: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    duration: number; // in hours or minutes depending on your display setup
    totalLessons: number;
    published: boolean;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface Lesson {
    lessonId: string;
    courseId: string;
    title: string;
    description: string;
    videoURL: string;
    durationInSeconds: number;
    order: number;
    isPublished: boolean;
}
