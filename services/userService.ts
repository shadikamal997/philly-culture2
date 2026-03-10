'use server';

import { adminDb as db, adminAuth } from '@/firebase/firebaseAdmin';
import { Timestamp } from 'firebase-admin/firestore';

export interface CreateUserInput {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role?: 'customer' | 'owner' | 'assistant';
}

export interface UpdateUserInput {
  displayName?: string;
  photoURL?: string;
  phoneNumber?: string;
  preferences?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: 'customer' | 'owner' | 'assistant';
  purchasedCourses: string[];
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

/**
 * User Service
 * Handles user profile management, role management, and user operations
 */
export class UserService {
  /**
   * Create or update user profile in Firestore
   */
  async createOrUpdateUser(input: CreateUserInput): Promise<void> {
    try {
      const userRef = db.collection('users').doc(input.uid);
      const userDoc = await userRef.get();

      const userData = {
        email: input.email,
        displayName: input.displayName || '',
        photoURL: input.photoURL || '',
        role: input.role || 'customer',
        updatedAt: Timestamp.now(),
      };

      if (userDoc.exists) {
        // Update existing user
        await userRef.update(userData);
      } else {
        // Create new user
        await userRef.set({
          ...userData,
          uid: input.uid,
          purchasedCourses: [],
          createdAt: Timestamp.now(),
        });
      }
    } catch (error) {
      console.error('Error creating/updating user:', error);
      throw new Error('Failed to create or update user');
    }
  }

  /**
   * Get user profile by UID
   */
  async getUserById(uid: string): Promise<UserProfile | null> {
    try {
      const userDoc = await db.collection('users').doc(uid).get();
      
      if (!userDoc.exists) {
        return null;
      }

      return userDoc.data() as UserProfile;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<UserProfile | null> {
    try {
      const snapshot = await db
        .collection('users')
        .where('email', '==', email)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      return snapshot.docs[0].data() as UserProfile;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  async updateUser(uid: string, updates: UpdateUserInput): Promise<void> {
    try {
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now(),
      };

      await db.collection('users').doc(uid).update(updateData);
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error('Failed to update user');
    }
  }

  /**
   * Update user role (admin only)
   */
  async updateUserRole(
    uid: string,
    newRole: 'customer' | 'owner' | 'assistant'
  ): Promise<void> {
    try {
      await db.collection('users').doc(uid).update({
        role: newRole,
        updatedAt: Timestamp.now(),
      });

      // Set custom claims in Firebase Auth
      await adminAuth.setCustomUserClaims(uid, { role: newRole });

      // Log role change
      await db.collection('auditLogs').add({
        type: 'role_change',
        userId: uid,
        newRole,
        timestamp: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      throw new Error('Failed to update user role');
    }
  }

  /**
   * Delete user (soft delete - mark as inactive)
   */
  async deleteUser(uid: string): Promise<void> {
    try {
      await db.collection('users').doc(uid).update({
        status: 'inactive',
        deletedAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      // Optionally disable Firebase Auth account
      await adminAuth.updateUser(uid, { disabled: true });

      // Log deletion
      await db.collection('auditLogs').add({
        type: 'user_deletion',
        userId: uid,
        timestamp: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error('Failed to delete user');
    }
  }

  /**
   * Get all users with pagination
   */
  async getAllUsers(limit: number = 50, startAfter?: string): Promise<UserProfile[]> {
    try {
      let query = db.collection('users').orderBy('createdAt', 'desc').limit(limit);

      if (startAfter) {
        const startDoc = await db.collection('users').doc(startAfter).get();
        if (startDoc.exists) {
          query = query.startAfter(startDoc) as any;
        }
      }

      const snapshot = await query.get();
      
      return snapshot.docs.map(doc => doc.data() as UserProfile);
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }

  /**
   * Get users by role
   */
  async getUsersByRole(role: 'customer' | 'owner' | 'assistant'): Promise<UserProfile[]> {
    try {
      const snapshot = await db
        .collection('users')
        .where('role', '==', role)
        .orderBy('createdAt', 'desc')
        .get();

      return snapshot.docs.map(doc => doc.data() as UserProfile);
    } catch (error) {
      console.error('Error getting users by role:', error);
      return [];
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(uid: string): Promise<{
    totalCourses: number;
    totalSpent: number;
    totalOrders: number;
  }> {
    try {
      // Get user's courses
      const userDoc = await db.collection('users').doc(uid).get();
      const userData = userDoc.data();
      const totalCourses = (userData?.purchasedCourses || []).length;

      // Get user's orders
      const ordersSnapshot = await db
        .collection('orders')
        .where('userId', '==', uid)
        .where('status', '==', 'completed')
        .get();

      const totalOrders = ordersSnapshot.size;
      let totalSpent = 0;

      ordersSnapshot.forEach(doc => {
        const order = doc.data();
        totalSpent += order.total || 0;
      });

      return {
        totalCourses,
        totalSpent: Number(totalSpent.toFixed(2)),
        totalOrders,
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return {
        totalCourses: 0,
        totalSpent: 0,
        totalOrders: 0,
      };
    }
  }

  /**
   * Add address to user profile
   */
  async addAddress(uid: string, address: any): Promise<string> {
    try {
      const addressRef = await db
        .collection('users')
        .doc(uid)
        .collection('addresses')
        .add({
          ...address,
          createdAt: Timestamp.now(),
        });

      return addressRef.id;
    } catch (error) {
      console.error('Error adding address:', error);
      throw new Error('Failed to add address');
    }
  }

  /**
   * Get user addresses
   */
  async getAddresses(uid: string): Promise<any[]> {
    try {
      const snapshot = await db
        .collection('users')
        .doc(uid)
        .collection('addresses')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error getting addresses:', error);
      return [];
    }
  }

  /**
   * Update user preferences
   */
  async updatePreferences(uid: string, preferences: Record<string, any>): Promise<void> {
    try {
      await db.collection('users').doc(uid).update({
        preferences,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw new Error('Failed to update preferences');
    }
  }

  /**
   * Get total user count
   */
  async getTotalUserCount(): Promise<number> {
    try {
      const snapshot = await db.collection('users').count().get();
      return snapshot.data().count;
    } catch (error) {
      console.error('Error getting user count:', error);
      return 0;
    }
  }
}

// Export singleton instance
export const userService = new UserService();
