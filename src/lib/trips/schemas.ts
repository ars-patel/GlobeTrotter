import { z } from "zod";

export const createTripSchema = z
  .object({
    name: z.string().trim().min(1, "Trip name is required").max(200),
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid start date"),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid end date"),
    start_point: z.string().trim().min(1, "Start point is required").max(200),
    end_point: z.string().trim().min(1, "End point is required").max(200),
    description: z.string().trim().max(5000).optional(),
    cover_photo: z.string().trim().max(2000).optional(),
    budget_limit: z.number().nonnegative().optional().nullable(),
    packing_items: z
      .array(
        z.object({
          label: z.string().trim().min(1).max(120),
          checked: z.boolean().optional(),
        })
      )
      .max(12)
      .optional(),
  })
  .refine((d) => d.end_date >= d.start_date, {
    message: "End date must be on or after start date",
    path: ["end_date"],
  });

export type CreateTripInput = z.infer<typeof createTripSchema>;
