import { z } from "zod";

export const journeySearchSchema = z.object({
  from: z.string().trim().min(1, "From is required").max(120),
  to: z.string().trim().min(1, "To is required").max(120),
  departure: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Departure date is required"),
  returnDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid return date")
    .optional(),
  passengers: z.coerce.number().int().min(1).max(20).default(1),
});

export type JourneySearchInput = z.infer<typeof journeySearchSchema>;

export type JourneyRow = {
  id: string;
  from_city: string;
  from_country: string;
  to_city: string;
  to_country: string;
  departure_at: string;
  arrival_at: string;
  duration_hours: number;
  price: number;
  seats_available: number;
  seats_total: number;
  rating: number | null;
  cover_image: string | null;
  operator_name: string;
  operator_rating: number;
  category_title: string | null;
  is_featured: boolean;
};

export const JOURNEY_SELECT = `
  j.id,
  fc.name AS from_city,
  fc.country AS from_country,
  tc.name AS to_city,
  tc.country AS to_country,
  j.departure_at::text,
  j.arrival_at::text,
  j.duration_hours::float8 AS duration_hours,
  j.price::float8 AS price,
  j.seats_available,
  j.seats_total,
  j.rating::float8 AS rating,
  j.cover_image,
  o.name AS operator_name,
  o.rating::float8 AS operator_rating,
  cat.title AS category_title,
  j.is_featured
`;
