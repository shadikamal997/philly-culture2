/**
 * Recommendation Service
 * Provides product and course recommendations based on user behavior
 * 
 * NOTE: This service is OPTIONAL and can be implemented as a future enhancement.
 * The core application functions without it.
 * 
 * Potential implementations:
 * - Collaborative filtering (users who bought X also bought Y)
 * - Content-based filtering (similar products/courses)
 * - Machine learning recommendations (requires ML infrastructure)
 * 
 * For now, recommendations are handled with simple logic in frontend components.
 */

'use server';

import { adminDb as db } from '@/firebase/firebaseAdmin';

export interface Recommendation {
  itemId: string;
  type: 'course' | 'product';
  score: number;
  reason: string;
}

/**
 * Simple recommendation service
 * Returns popular items or related items based on basic logic
 */
export class RecommendationService {
  /**
   * Get recommended courses for a user
   * Currently returns popular courses
   */
  async getRecommendedCourses(userId: string, limit: number = 5): Promise<Recommendation[]> {
    try {
      // Future: Implement personalized recommendations
      // For now, return popular courses
      const coursesSnapshot = await db
        .collection('courses')
        .where('published', '==', true)
        .orderBy('enrollmentCount', 'desc')
        .limit(limit)
        .get();

      return coursesSnapshot.docs.map((doc, index) => ({
        itemId: doc.id,
        type: 'course' as const,
        score: 1 - (index * 0.1),
        reason: 'Popular course',
      }));
    } catch (error) {
      console.error('Error getting recommended courses:', error);
      return [];
    }
  }

  /**
   * Get recommended products for a user
   * Currently returns popular products
   */
  async getRecommendedProducts(userId: string, limit: number = 5): Promise<Recommendation[]> {
    try {
      // Future: Implement personalized recommendations
      // For now, return popular products
      const productsSnapshot = await db
        .collection('products')
        .where('status', '==', 'active')
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();

      return productsSnapshot.docs.map((doc, index) => ({
        itemId: doc.id,
        type: 'product' as const,
        score: 1 - (index * 0.1),
        reason: 'Featured product',
      }));
    } catch (error) {
      console.error('Error getting recommended products:', error);
      return [];
    }
  }

  /**
   * Get similar items (courses or products)
   * Future: Implement with tags, categories, or ML
   */
  async getSimilarItems(itemId: string, type: 'course' | 'product', limit: number = 4): Promise<Recommendation[]> {
    try {
      // Placeholder: Return random items from same category
      const collection = type === 'course' ? 'courses' : 'products';
      const snapshot = await db
        .collection(collection)
        .limit(limit)
        .get();

      return snapshot.docs
        .filter(doc => doc.id !== itemId)
        .map((doc, index) => ({
          itemId: doc.id,
          type,
          score: 1 - (index * 0.15),
          reason: 'Similar item',
        }));
    } catch (error) {
      console.error('Error getting similar items:', error);
      return [];
    }
  }
}

// Export singleton instance
export const recommendationService = new RecommendationService();
