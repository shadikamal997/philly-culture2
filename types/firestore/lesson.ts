export interface Lesson {
    lessonId: string;
    courseId: string; // Used to query: Get lessons where courseId == X
    title: string;
    description?: string; // Lesson description
    videoURL: string;
    order: number; // Order ASC
    duration: number; // duration in minutes/seconds
    durationInSeconds: number; // Duration in seconds for display
    isPreview: boolean;
    isPublished?: boolean; // Publishing status
}
