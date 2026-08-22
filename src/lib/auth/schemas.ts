import { z } from "zod";

export const signupSchema = z.object({
  first_name: z.string().trim().min(1, "First name is required").max(80),
  last_name: z.string().trim().min(1, "Last name is required").max(80),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().max(30).optional(),
  home_city: z.string().trim().max(120).optional(),
  home_country: z.string().trim().max(120).optional(),
  additional_info: z.string().trim().max(2000).optional(),
  username: z.string().trim().max(60).optional(),
  photo_url: z
    .string()
    .trim()
    .max(500)
    .refine((v) => !v || v.startsWith("/uploads/"), "Invalid photo URL")
    .optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128),
});

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, "Username is required").max(255),
  password: z.string().min(1, "Password is required").max(128),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
});

export const resetPasswordSchema = z.object({
  token: z.string().trim().min(1, "Reset token is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
