import { z } from "zod";

export const testimonialSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    rating: z.coerce.number().min(1).max(5),
    title: z.string(),
    review: z.string(),
    dateOfStay: z.string(),
  })
  .passthrough();

export const testimonialsResponseSchema = z
  .union([
    z.array(testimonialSchema),
    z.object({ data: z.array(testimonialSchema) }),
    z.object({ testimonials: z.array(testimonialSchema) }),
  ])
  .transform((value) => {
    if (Array.isArray(value)) {
      return value;
    }

    if ("data" in value) {
      return value.data;
    }

    return value.testimonials;
  });

export type Testimonial = z.infer<typeof testimonialSchema>;
export type TestimonialsResponse = z.infer<typeof testimonialsResponseSchema>;
