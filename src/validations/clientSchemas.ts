import { z } from 'zod';

export const contactFormSchema = z.object({
  fullName: z.string().min(2, 'Please enter your full name (min 2 characters)'),
  email: z.string().email('Please enter a valid email address'),
  service: z.string().min(1, 'Please select a service'),
  subject: z.string().min(3, 'Please enter a clear subject'),
  message: z
    .string()
    .min(10, 'Please share a few details about your project (min 10 characters)'),
  honeypot: z.string().max(0).optional(),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;

export const quickContactSchema = z.object({
  fullName: z.string().min(2, 'Your name is required'),
  email: z.string().email('Valid email is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export type QuickContactValues = z.infer<typeof quickContactSchema>;

export const adminLoginSchema = z.object({
  email: z.string().email('Enter a valid administrator email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type AdminLoginValues = z.infer<typeof adminLoginSchema>;

export const passwordChangeFormSchema = z
  .object({
    currentPassword: z.string().min(6, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Minimum 8 characters')
      .regex(/[A-Z]/, 'Include at least 1 uppercase letter')
      .regex(/[0-9]/, 'Include at least 1 number'),
    confirmPassword: z.string().min(8, 'Confirm your new password'),
  })
  .refine((vals) => vals.newPassword === vals.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

export type PasswordChangeFormValues = z.infer<typeof passwordChangeFormSchema>;
