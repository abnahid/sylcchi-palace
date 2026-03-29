import { z } from "zod";

const roomImageSchema = z
  .union([z.string(), z.object({ imageUrl: z.string() }).passthrough()])
  .transform((value) => (typeof value === "string" ? value : value.imageUrl));

export const roomSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    slug: z.string().optional(),
    description: z.string().nullable().optional(),
    pricePerNight: z.coerce.number().optional(),
    price: z.coerce.number().optional(),
    capacity: z.coerce.number().int().positive(),
    bedType: z.string().optional(),
    roomTypeId: z.string().optional(),
    roomType: z
      .object({
        id: z.string().optional(),
        name: z.string().optional(),
      })
      .optional(),
    images: z.array(roomImageSchema).optional().default([]),
    facilities: z.array(z.string()).optional().default([]),
    rules: z.array(z.string()).optional().default([]),
    isAvailable: z.boolean().optional().default(true),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
  })
  .passthrough()
  .transform((room) => ({
    ...room,
    slug: room.slug ?? room.id,
    description: room.description ?? "",
    pricePerNight: room.pricePerNight ?? room.price ?? 0,
    images: room.images,
  }));

const paginationMetaSchema = z.object({
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

// Handles the paginated response: { success, message, data: { meta, data: Room[] } }
export const paginatedRoomsResponseSchema = z
  .object({
    success: z.boolean().optional(),
    message: z.string().optional(),
    data: z.object({
      meta: paginationMetaSchema,
      data: z.array(roomSchema),
    }),
  })
  .transform((value) => value.data);

// Legacy: handles flat array responses for backward compatibility
export const roomsResponseSchema = z
  .union([
    z.array(roomSchema),
    z.object({ data: z.array(roomSchema) }),
    z.object({ rooms: z.array(roomSchema) }),
    z.object({
      success: z.boolean(),
      message: z.string().optional(),
      data: z.union([
        z.array(roomSchema),
        z.object({
          meta: paginationMetaSchema,
          data: z.array(roomSchema),
        }),
      ]),
    }),
  ])
  .transform((value) => {
    if (Array.isArray(value)) {
      return value;
    }

    if ("data" in value) {
      const inner = value.data;
      if (Array.isArray(inner)) {
        return inner;
      }
      if ("data" in inner) {
        return inner.data;
      }
    }

    if ("rooms" in value) {
      return value.rooms;
    }

    return [];
  });

export type Room = z.infer<typeof roomSchema>;
export type RoomsResponse = z.infer<typeof roomsResponseSchema>;
export type PaginatedRoomsResult = z.infer<
  typeof paginatedRoomsResponseSchema
>;
