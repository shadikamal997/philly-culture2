import { Timestamp } from 'firebase/firestore';

export type ReviewItemType = 'course' | 'product';

export interface Review {
    reviewId: string;
    userId: string;
    itemId: string; // Used in index: itemId + createdAt DESC
    itemType: ReviewItemType;
    rating: number; // 1-5
    comment: string;
    createdAt: Timestamp;
}
