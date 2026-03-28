import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .min(1, "Email address is required")
  .email("Enter a valid email address");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password needs at least one uppercase letter")
  .regex(/[0-9]/, "Password needs at least one number")
  .regex(/[^A-Za-z0-9]/, "Password needs at least one special character");

export const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z
  .object({
    firstName: z.string().trim().min(1, "First name is required"),
    lastName: z.string().trim().min(1, "Last name is required"),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
    agree: z
      .boolean()
      .refine((value) => value, "You must agree to the terms to continue"),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const otpSchema = z.object({
  code: z.string().regex(/^\d{6}$/, "Enter the 6-digit verification code"),
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirm: z.string().min(1, "Please confirm your new password"),
  })
  .refine((value) => value.password === value.confirm, {
    path: ["confirm"],
    message: "Passwords do not match",
  });

export function getPasswordStrength(password: string) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];

  const score = checks.filter(Boolean).length;
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "#ef4444", "#f97316", "#eab308", "#22c55e"];

  return { checks, score, labels, colors };
}
