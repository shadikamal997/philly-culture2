import { Timestamp } from 'firebase/firestore';

export type ProductCategory = 'sauces' | 'kits' | 'tools' | 'merchandise';

export interface Product {
    productId: string;
    name: string;
    slug: string;
    description: string;
    shortDescription: string;
    price: number;
    currency: 'USD';
    stock: number;
    category: ProductCategory;
    images: string[];
    weight?: number; // useful for shipping calculations
    isDigital: boolean;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}
