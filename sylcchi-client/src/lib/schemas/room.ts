import { z } from "zod";

export const roomSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    slug: z.string().optional(),
    description: z.string().nullable().optional(),
    pricePerNight: z.coerce.number(),
    capacity: z.coerce.number().int().positive(),
    images: z.array(z.string()).optional().default([]),
    facilities: z.array(z.string()).optional().default([]),
    rules: z.array(z.string()).optional().default([]),
    isAvailable: z.boolean().optional().default(true),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
  })
  .passthrough();

export const roomsResponseSchema = z
  .union([
    z.array(roomSchema),
    z.object({ data: z.array(roomSchema) }),
    z.object({ rooms: z.array(roomSchema) }),
  ])
  .transform((value) => {
    if (Array.isArray(value)) {
      return value;
    }

    if ("data" in value) {
      return value.data;
    }

    return value.rooms;
  });

export type Room = z.infer<typeof roomSchema>;
export type RoomsResponse = z.infer<typeof roomsResponseSchema>;
