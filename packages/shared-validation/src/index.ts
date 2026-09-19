import { z } from 'zod';

export const nameSchema = z.string().min(20, 'Name must be at least 20 characters').max(60, 'Name must be at most 60 characters');

export const emailSchema = z.string().email('Invalid email address');

export const addressSchema = z.string().max(400, 'Address must be at most 400 characters');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(16, 'Password must be at most 16 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character');

export const signupSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  address: addressSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Confirm password is required'),
  role: z.enum(['NORMAL_USER', 'STORE_OWNER']).optional()
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required')
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmNewPassword: z.string().min(1, 'Confirm password is required')
}).refine(data => data.newPassword === data.confirmNewPassword, {
  message: 'Passwords do not match',
  path: ['confirmNewPassword']
});

export type UpdatePasswordInput = {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};

export type SignupInput = {
  name: string;
  email: string;
  address: string;
  password: string;
  confirmPassword: string;
  role?: 'NORMAL_USER' | 'STORE_OWNER';
};

export const createUserSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  address: addressSchema,
  password: passwordSchema,
  role: z.enum(['SYSTEM_ADMIN', 'NORMAL_USER', 'STORE_OWNER'])
});

export const updateUserSchema = z.object({
  name: nameSchema.optional(),
  email: emailSchema.optional(),
  address: addressSchema.optional(),
  role: z.enum(['SYSTEM_ADMIN', 'NORMAL_USER', 'STORE_OWNER']).optional()
});

export const createStoreSchema = z.object({
  name: z.string().min(1, 'Store name is required').max(255),
  email: emailSchema,
  address: addressSchema,
  ownerId: z.string().min(1, 'Owner ID is required')
});

export const updateStoreSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  email: emailSchema.optional(),
  address: addressSchema.optional()
});

export const ratingSchema = z.object({
  value: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5')
});

export const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  name: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
  role: z.enum(['SYSTEM_ADMIN', 'NORMAL_USER', 'STORE_OWNER']).optional()
});

export type LoginInput = z.infer<typeof loginSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateStoreInput = z.infer<typeof createStoreSchema>;
export type UpdateStoreInput = z.infer<typeof updateStoreSchema>;
export type RatingInput = z.infer<typeof ratingSchema>;
export type QueryInput = z.infer<typeof querySchema>;