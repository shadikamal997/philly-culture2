import { Timestamp } from 'firebase/firestore';

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled';
export type OrderItemType = 'course' | 'product';

export interface OrderItem {
    type: OrderItemType;
    itemId: string;
    quantity: number;
    price: number;
}

export interface Order {
    orderId: string;
    userId: string;
    stripeSessionId: string;
    stripePaymentIntentId?: string;

    items: OrderItem[];

    subtotal: number;
    tax: number;
    shipping: number;
    total: number;

    status: OrderStatus;

    shippingAddress?: {
        street: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    };
    trackingNumber?: string;

    createdAt: Timestamp; // For index: userId + createdAt DESC
    updatedAt: Timestamp;
}
