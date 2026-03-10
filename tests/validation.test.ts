import { courseSchema, productSchema } from '@/lib/validation';

describe('Validation Schemas', () => {
  describe('courseSchema', () => {
    it('should validate a valid course', () => {
      const validCourse = {
        title: 'Test Course',
        slug: 'test-course',
        description: 'This is a test course description',
        shortDescription: 'Short description',
        price: 99.99,
        difficulty: 'beginner' as const,
        duration: 10,
        totalLessons: 5,
      };

      expect(() => courseSchema.parse(validCourse)).not.toThrow();
    });

    it('should reject course with invalid title', () => {
      const invalidCourse = {
        title: 'AB', // Too short
        slug: 'test-course',
        description: 'This is a test course description',
        shortDescription: 'Short description',
        price: 99.99,
        difficulty: 'beginner' as const,
        duration: 10,
        totalLessons: 5,
      };

      expect(() => courseSchema.parse(invalidCourse)).toThrow();
    });

    it('should reject course with negative price', () => {
      const invalidCourse = {
        title: 'Test Course',
        slug: 'test-course',
        description: 'This is a test course description',
        shortDescription: 'Short description',
        price: -10, // Negative price
        difficulty: 'beginner' as const,
        duration: 10,
        totalLessons: 5,
      };

      expect(() => courseSchema.parse(invalidCourse)).toThrow();
    });
  });

  describe('productSchema', () => {
    it('should validate a valid product', () => {
      const validProduct = {
        name: 'Test Product',
        slug: 'test-product',
        description: 'This is a test product description',
        shortDescription: 'Short description',
        price: 29.99,
        stock: 100,
        category: 'sauces' as const,
      };

      expect(() => productSchema.parse(validProduct)).not.toThrow();
    });

    it('should reject product with invalid slug', () => {
      const invalidProduct = {
        name: 'Test Product',
        slug: 'Test Product', // Contains spaces and uppercase
        description: 'This is a test product description',
        shortDescription: 'Short description',
        price: 29.99,
        stock: 100,
        category: 'sauces' as const,
      };

      expect(() => productSchema.parse(invalidProduct)).toThrow();
    });
  });
});