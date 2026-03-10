import { Timestamp } from 'firebase/firestore';

export interface Tool {
    toolId: string;
    title: string;
    description: string;
    price: number;
    
    // Tax-related
    taxable: boolean;
    taxCategory: string;
    
    // Inventory & Shipping
    inventory: number;
    sku: string;
    weight?: number; // in pounds
    shippingRequired: boolean;
    
    // Status
    status: 'draft' | 'published';
    published: boolean;
    
    // Metadata
    createdBy?: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}
