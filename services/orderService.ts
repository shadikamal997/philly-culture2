'use server';

import { adminDb as db } from '@/firebase/firebaseAdmin';
import { Order, OrderStatus, OrderItem } from '@/types/firestore/order';
import { Timestamp } from 'firebase-admin/firestore';

export interface CreateOrderInput {
  userId: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  stripeSessionId?: string;
  shippingAddress?: {
    fullName: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

export interface UpdateOrderInput {
  status?: OrderStatus;
  trackingNumber?: string;
  carrier?: string;
  stripePaymentIntentId?: string;
  shippingAddress?: any;
  metadata?: Record<string, any>;
}

export interface OrderQuery {
  userId?: string;
  status?: OrderStatus;
  limit?: number;
  startAfter?: string; // For pagination
}

/**
 * Order Service
 * Handles all order-related operations
 */
export class OrderService {
  /**
   * Create a new order
   */
  async createOrder(input: CreateOrderInput): Promise<string> {
    try {
      const orderRef = db.collection('orders').doc();
      
      const orderData: any = {
        orderId: orderRef.id,
        userId: input.userId,
        items: input.items,
        subtotal: input.subtotal,
        tax: input.tax,
        shipping: input.shipping,
        total: input.total,
        status: 'pending' as OrderStatus,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      if (input.stripeSessionId) {
        orderData.stripeSessionId = input.stripeSessionId;
      }

      if (input.shippingAddress) {
        orderData.shippingAddress = input.shippingAddress;
      }

      await orderRef.set(orderData);
      return orderRef.id;
    } catch (error) {
      console.error('Error creating order:', error);
      throw new Error('Failed to create order');
    }
  }

  /**
   * Get order by ID
   */
  async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const orderDoc = await db.collection('orders').doc(orderId).get();
      
      if (!orderDoc.exists) {
        return null;
      }

      return {
        orderId: orderDoc.id,
        ...orderDoc.data(),
      } as Order;
    } catch (error) {
      console.error('Error getting order:', error);
      throw new Error('Failed to get order');
    }
  }

  /**
   * Get order by Stripe session ID
   */
  async getOrderBySessionId(sessionId: string): Promise<Order | null> {
    try {
      const querySnapshot = await db
        .collection('orders')
        .where('stripeSessionId', '==', sessionId)
        .limit(1)
        .get();

      if (querySnapshot.empty) {
        return null;
      }

      const orderDoc = querySnapshot.docs[0];
      return {
        orderId: orderDoc.id,
        ...orderDoc.data(),
      } as Order;
    } catch (error) {
      console.error('Error getting order by session ID:', error);
      throw new Error('Failed to get order');
    }
  }

  /**
   * Query orders with filters
   */
  async queryOrders(query: OrderQuery): Promise<Order[]> {
    try {
      let ordersQuery = db.collection('orders').orderBy('createdAt', 'desc');

      if (query.userId) {
        ordersQuery = ordersQuery.where('userId', '==', query.userId) as any;
      }

      if (query.status) {
        ordersQuery = ordersQuery. where('status', '==', query.status) as any;
      }

      if (query.limit) {
        ordersQuery = ordersQuery.limit(query.limit) as any;
      }

      if (query.startAfter) {
        const startDoc = await db.collection('orders').doc(query.startAfter).get();
        if (startDoc.exists) {
          ordersQuery = ordersQuery.startAfter(startDoc) as any;
        }
      }

      const snapshot = await ordersQuery.get();
      
      return snapshot.docs.map(doc => ({
        orderId: doc.id,
        ...doc.data(),
      })) as Order[];
    } catch (error) {
      console.error('Error querying orders:', error);
      throw new Error('Failed to query orders');
    }
  }

  /**
   * Update order
   */
  async updateOrder(orderId: string, updates: UpdateOrderInput): Promise<void> {
    try {
      const updateData: any = {
        ...updates,
        updatedAt: Timestamp.now(),
      };

      await db.collection('orders').doc(orderId).update(updateData);
    } catch (error) {
      console.error('Error updating order:', error);
      throw new Error('Failed to update order');
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    try {
      await this.updateOrder(orderId, { status });

      // Log status change in audit log
      await db.collection('auditLogs').add({
        type: 'order_status_change',
        orderId,
        newStatus: status,
        timestamp: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      throw new Error('Failed to update order status');
    }
  }

  /**
   * Mark order as paid
   */
  async markOrderAsPaid(orderId: string, paymentIntentId: string): Promise<void> {
    try {
      await this.updateOrder(orderId, {
        status: 'paid',
        stripePaymentIntentId: paymentIntentId,
      });
    } catch (error) {
      console.error('Error marking order as paid:', error);
      throw new Error('Failed to mark order as paid');
    }
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderId: string, reason?: string): Promise<void> {
    try {
      await this.updateOrder(orderId, {
        status: 'cancelled',
        metadata: { cancellationReason: reason },
      });
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw new Error('Failed to cancel order');
    }
  }

  /**
   * Get user order history
   */
  async getUserOrders(userId: string, limit: number = 20): Promise<Order[]> {
    try {
      return await this.queryOrders({ userId, limit });
    } catch (error) {
      console.error('Error getting user orders:', error);
      throw new Error('Failed to get user orders');
    }
  }

  /**
   * Get order count by status
   */
  async getOrderCountByStatus(status: OrderStatus): Promise<number> {
    try {
      const snapshot = await db
        .collection('orders')
        .where('status', '==', status)
        .count()
        .get();

      return snapshot.data().count;
    } catch (error) {
      console.error('Error getting order count:', error);
      return 0;
    }
  }

  /**
   * Calculate total revenue
   */
  async getTotalRevenue(): Promise<number> {
    try {
      const orders = await this.queryOrders({ status: 'paid' });
      return orders.reduce((sum, order) => sum + (order.total || 0), 0);
    } catch (error) {
      console.error('Error calculating revenue:', error);
      return 0;
    }
  }
}

// Export singleton instance
export const orderService = new OrderService();
