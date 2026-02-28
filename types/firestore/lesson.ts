export interface Lesson {
    lessonId: string;
    courseId: string; // Used to query: Get lessons where courseId == X
    title: string;
    videoURL: string;
    order: number; // Order ASC
    duration: number; // duration in minutes/seconds
    isPreview: boolean;
}
