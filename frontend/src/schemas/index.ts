import { z } from 'zod';
import { config } from '../config';

const { validation } = config;

export const loginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(validation.minNameLength, `Name must be at least ${validation.minNameLength} characters`),
  email: z.string().trim().email('Please enter a valid email'),
  password: z
    .string()
    .min(
      validation.minPasswordLength,
      `Password must be at least ${validation.minPasswordLength} characters`
    ),
});
export type RegisterFormValues = z.infer<typeof registerSchema>;

export const postSchema = z.object({
  title: z
    .string()
    .trim()
    .min(
      validation.minTitleLength,
      `Title must be at least ${validation.minTitleLength} characters`
    )
    .max(validation.maxTitleLength, `Title must be at most ${validation.maxTitleLength} characters`),
  content: z.string().trim().min(1, 'Content is required'),
  tags: z.string().optional().default(''),
  status: z.enum(['draft', 'published']),
});
export type PostFormValues = z.infer<typeof postSchema>;

export const commentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, 'Write something first')
    .max(
      validation.maxCommentLength,
      `Max ${validation.maxCommentLength} characters`
    ),
});
export type CommentFormValues = z.infer<typeof commentSchema>;
