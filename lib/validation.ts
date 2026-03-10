import { z } from 'zod';

// ============================================
// COURSE VALIDATION SCHEMAS
// ============================================

export const courseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  slug: z.string().min(3).max(200).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  shortDescription: z.string().min(10).max(300),
  price: z.number().min(0, 'Price must be positive'),
  thumbnailURL: z.string().url().optional().or(z.literal('')),
  previewVideoURL: z.string().url().optional().or(z.literal('')),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  duration: z.number().min(0),
  totalLessons: z.number().int().min(0),
  published: z.boolean().optional().default(false),
  isPublished: z.boolean().optional().default(false),
});

export type CourseInput = z.infer<typeof courseSchema>;

export const lessonSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  videoURL: z.string().url('Must be a valid URL'),
  durationInSeconds: z.number().int().min(0),
  order: z.number().int().min(0),
  isPublished: z.boolean().default(false),
});

export type LessonInput = z.infer<typeof lessonSchema>;

// ============================================
// PRODUCT VALIDATION SCHEMAS
// ============================================

export const productSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(200),
  slug: z.string().min(3).max(200).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  shortDescription: z.string().min(10).max(300),
  price: z.number().min(0, 'Price must be positive'),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
  category: z.enum(['sauces', 'kits', 'tools', 'merchandise']),
  images: z.array(z.string().url()).optional().default([]),
  weight: z.number().min(0).optional(),
  isDigital: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export type ProductInput = z.infer<typeof productSchema>;

// ============================================
// ORDER VALIDATION SCHEMAS
// ============================================

export const orderStatusSchema = z.enum(['pending', 'paid', 'shipped', 'completed', 'cancelled']);

export const updateOrderStatusSchema = z.object({
  orderId: z.string().min(1),
  status: orderStatusSchema,
  trackingNumber: z.string().optional(),
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;

// ============================================
// USER VALIDATION SCHEMAS
// ============================================

export const userRoleSchema = z.enum(['user', 'admin']);

export const updateUserRoleSchema = z.object({
  userId: z.string().min(1),
  role: userRoleSchema,
});

export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;

export const userProfileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  phone: z.string().regex(/^\+?[\d\s-()]+$/, 'Invalid phone number').optional().or(z.literal('')),
  photoURL: z.string().url().optional().or(z.literal('')),
});

export type UserProfileInput = z.infer<typeof userProfileSchema>;

export const addressSchema = z.object({
  street: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City is required'),
  state: z.string().length(2, 'State must be 2 letters (e.g., PA)').regex(/^[A-Z]{2}$/),
  postalCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),
  country: z.string().default('US'),
  isDefault: z.boolean().default(false),
});

export type AddressInput = z.infer<typeof addressSchema>;

// ============================================
// CONTACT FORM VALIDATION
// ============================================

export const contactFormSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(20, 'Message must be at least 20 characters'),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;
