import { z } from "zod";

const urlSchema = z.string().url("Website must be a valid URL");

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  phone: z.string().trim().optional(),
  image: z.string().trim().optional(),
  bio: z
    .string()
    .trim()
    .max(36, "Bio must be 36 characters or fewer")
    .optional(),
  website: z
    .string()
    .trim()
    .refine(
      (value) => value.length === 0 || urlSchema.safeParse(value).success,
      "Website must be a valid URL",
    )
    .optional(),
  location: z
    .string()
    .trim()
    .max(100, "Location must be 100 characters or fewer")
    .optional(),
  nationality: z
    .string()
    .trim()
    .max(100, "Nationality must be 100 characters or fewer")
    .optional(),
});

export type UpdateProfileSchemaInput = z.input<typeof updateProfileSchema>;
export type UpdateProfileSchemaOutput = z.output<typeof updateProfileSchema>;
