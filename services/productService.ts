'use server';

import { adminDb as db } from '@/firebase/firebaseAdmin';
import { Product } from '@/types/firestore/product';
import { Timestamp } from 'firebase-admin/firestore';

export interface UpdateInventoryInput {
  productId: string;
  quantity: number;
  operation: 'add' | 'subtract' | 'set';
  reason?: string;
}

export interface ProductQuery {
  category?: string;
  status?: 'active' | 'inactive' | 'draft';
  isDigital?: boolean;
  limit?: number;
}

export interface InventoryReservation {
  productId: string;
  quantity: number;
  userId: string;
  reservedAt: Date;
  expiresAt: Date;
  sessionId: string;
}

/**
 * Product Service
 * Handles product inventory, reservations, and product management
 */
export class ProductService {
  private readonly RESERVATION_TTL_MINUTES = 15; // Reservation expires after 15 minutes

  /**
   * Get product by ID
   */
  async getProductById(productId: string): Promise<Product | null> {
    try {
      const productDoc = await db.collection('products').doc(productId).get();
      
      if (!productDoc.exists) {
        return null;
      }

      return {
        productId: productDoc.id,
        ...productDoc.data(),
      } as Product;
    } catch (error) {
      console.error('Error getting product:', error);
      return null;
    }
  }

  /**
   * Query products with filters
   */
  async queryProducts(query: ProductQuery): Promise<Product[]> {
    try {
      let productsQuery = db.collection('products').orderBy('createdAt', 'desc');

      if (query.category) {
        productsQuery = productsQuery.where('category', '==', query.category) as any;
      }

      if (query.status) {
        productsQuery = productsQuery.where('status', '==', query.status) as any;
      }

      if (query.isDigital !== undefined) {
        productsQuery = productsQuery.where('isDigital', '==', query.isDigital) as any;
      }

      if (query.limit) {
        productsQuery = productsQuery.limit(query.limit) as any;
      }

      const snapshot = await productsQuery.get();
      
      return snapshot.docs.map(doc => ({
        productId: doc.id,
        ...doc.data(),
      })) as Product[];
    } catch (error) {
      console.error('Error querying products:', error);
      return [];
    }
  }

  /**
   * Update product inventory
   */
  async updateInventory(input: UpdateInventoryInput): Promise<number> {
    try {
      const { productId, quantity, operation } = input;

      const productRef = db.collection('products').doc(productId);
      const productDoc = await productRef.get();

      if (!productDoc.exists) {
        throw new Error('Product not found');
      }

      const productData = productDoc.data() as Product;
      const currentInventory = productData.stock || 0;

      let newInventory: number;

      switch (operation) {
        case 'add':
          newInventory = currentInventory + quantity;
          break;
        case 'subtract':
          newInventory = Math.max(0, currentInventory - quantity);
          break;
        case 'set':
          newInventory = quantity;
          break;
        default:
          throw new Error('Invalid operation');
      }

      await productRef.update({
        stock: newInventory,
        updatedAt: Timestamp.now(),
      });

      // Log inventory change
      await db.collection('auditLogs').add({
        type: 'inventory_change',
        productId,
        operation,
        previousInventory: currentInventory,
        newInventory,
        quantity,
        reason: input.reason,
        timestamp: Timestamp.now(),
      });

      return newInventory;
    } catch (error) {
      console.error('Error updating inventory:', error);
      throw new Error('Failed to update inventory');
    }
  }

  /**
   * Check if product has sufficient inventory
   */
  async checkInventory(productId: string, quantity: number): Promise<boolean> {
    try {
      const product = await this.getProductById(productId);
      
      if (!product) {
        return false;
      }

      // Digital products have unlimited inventory
      if (product.isDigital) {
        return true;
      }

      const currentInventory = product.stock || 0;
      return currentInventory >= quantity;
    } catch (error) {
      console.error('Error checking inventory:', error);
      return false;
    }
  }

  /**
   * Reserve inventory for checkout (prevents race conditions)
   */
  async reserveInventory(
    productId: string,
    quantity: number,
    userId: string,
    sessionId: string
  ): Promise<string> {
    try {
      // Check if product exists and has sufficient inventory
      const hasInventory = await this.checkInventory(productId, quantity);
      if (!hasInventory) {
        throw new Error('Insufficient inventory');
      }

      const expiresAt = new Date();
      expiresAt.setMinutes(
        expiresAt.getMinutes() + this.RESERVATION_TTL_MINUTES
      );

      const reservation: InventoryReservation = {
        productId,
        quantity,
        userId,
        sessionId,
        reservedAt: new Date(),
        expiresAt,
      };

      const reservationRef = await db
        .collection('inventoryReservations')
        .add(reservation);

      // Note: In production, implement a Cloud Function to clean up expired reservations
      return reservationRef.id;
    } catch (error) {
      console.error('Error reserving inventory:', error);
      throw new Error('Failed to reserve inventory');
    }
  }

  /**
   * Release inventory reservation
   */
  async releaseReservation(reservationId: string): Promise<void> {
    try {
      await db.collection('inventoryReservations').doc(reservationId).delete();
    } catch (error) {
      console.error('Error releasing reservation:', error);
      throw new Error('Failed to release reservation');
    }
  }

  /**
   * Get low stock products (inventory below threshold)
   */
  async getLowStockProducts(threshold: number = 10): Promise<Product[]> {
    try {
      const snapshot = await db
        .collection('products')
        .where('isDigital', '==', false)
        .where('inventory', '<=', threshold)
        .where('status', '==', 'active')
        .get();

      return snapshot.docs.map(doc => ({
        productId: doc.id,
        ...doc.data(),
      })) as Product[];
    } catch (error) {
      console.error('Error getting low stock products:', error);
      return [];
    }
  }

  /**
   * Get product sales statistics
   */
  async getProductStats(productId: string): Promise<{
    totalSold: number;
    revenue: number;
  }> {
    try {
      const ordersSnapshot = await db
        .collection('orders')
        .where('status', '==', 'completed')
        .get();

      let totalSold = 0;
      let revenue = 0;

      ordersSnapshot.forEach(doc => {
        const order = doc.data();
        const items = order.items || [];
        
        items.forEach((item: any) => {
          if (item.type === 'product' && item.itemId === productId) {
            totalSold += item.quantity || 0;
            revenue += (item.price || 0) * (item.quantity || 0);
          }
        });
      });

      return {
        totalSold,
        revenue: Number(revenue.toFixed(2)),
      };
    } catch (error) {
      console.error('Error getting product stats:', error);
      return { totalSold: 0, revenue: 0 };
    }
  }

  /**
   * Deduct inventory for completed order
   */
  async deductInventoryForOrder(orderItems: any[]): Promise<void> {
    try {
      const updates = orderItems
        .filter(item => item.type === 'product')
        .map(item => ({
          productId: item.itemId,
          quantity: item.quantity,
        }));

      for (const update of updates) {
        await this.updateInventory({
          productId: update.productId,
          quantity: update.quantity,
          operation: 'subtract',
          reason: 'Order completed',
        });
      }
    } catch (error) {
      console.error('Error deducting inventory:', error);
      throw error;
    }
  }

  /**
   * Restore inventory for cancelled order
   */
  async restoreInventoryForOrder(orderItems: any[]): Promise<void> {
    try {
      const updates = orderItems
        .filter(item => item.type === 'product')
        .map(item => ({
          productId: item.itemId,
          quantity: item.quantity,
        }));

      for (const update of updates) {
        await this.updateInventory({
          productId: update.productId,
          quantity: update.quantity,
          operation: 'add',
          reason: 'Order cancelled',
        });
      }
    } catch (error) {
      console.error('Error restoring inventory:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const productService = new ProductService();
