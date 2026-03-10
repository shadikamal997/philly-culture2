import { Timestamp } from 'firebase/firestore';

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'refunded' | 'cancelled';
export type OrderItemType = 'course' | 'tool';

export interface OrderItem {
    id: string;
    title: string;
    price: number;
    quantity: number;
    type: OrderItemType;
    taxable: boolean;
}

export interface Order {
    orderId: string;
    userId: string;
    userEmail: string;
    
    // Items
    items: OrderItem[];

    // Pricing
    subtotal: number;
    taxAmount: number;
    shippingCost?: number;
    total: number;
    
    // Tax info
    state: string;
    taxRate: number;

    // Payment
    stripeSessionId?: string;
    stripePaymentIntentId: string;
    status: OrderStatus;

    // Shipping
    shippingAddress?: {
        street: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    };
    trackingNumber?: string;

    // Metadata
    createdAt: Timestamp;
    updatedAt: Timestamp;
}
