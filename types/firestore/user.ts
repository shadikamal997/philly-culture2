import { Timestamp } from 'firebase/firestore';

export type Role = 'customer' | 'owner' | 'assistant';

export interface User {
    uid: string;
    fullName: string;
    email: string;
    role: Role;
    phone?: string;
    photoURL?: string;

    purchasedCourses: string[]; // array of course IDs
    enrolledCourses?: string[]; // Alias for purchasedCourses (compatibility)
    createdAt: Timestamp;
    updatedAt: Timestamp;

    defaultAddressId?: string;
    stripeCustomerId?: string;
}

// Subcollection: users/{userId}/addresses
export interface UserAddress {
    addressId: string;
    userId: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
}

// Subcollection: users/{userId}/certificates
export interface UserCertificate {
    certificateId: string;
    userId: string;
    courseId: string;
    issuedAt: Timestamp;
    certificateURL: string;
}
