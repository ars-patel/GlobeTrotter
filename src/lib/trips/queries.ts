import { query } from "@/lib/db";

export type OwnedTrip = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  cover_photo: string | null;
  start_date: string;
  end_date: string;
  start_point: string | null;
  end_point: string | null;
  is_public: boolean;
  share_slug: string | null;
  budget_limit: string | number | null;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
};

export async function getOwnedTrip(
  tripId: string,
  userId: string
): Promise<OwnedTrip | null> {
  const { rows } = await query<OwnedTrip>(
    `SELECT
       id, user_id, name, description, cover_photo,
       to_char(start_date, 'YYYY-MM-DD') AS start_date,
       to_char(end_date, 'YYYY-MM-DD') AS end_date,
       start_point, end_point, is_public, share_slug,
       budget_limit, is_featured, created_at, updated_at
     FROM trips
     WHERE id = $1 AND user_id = $2`,
    [tripId, userId]
  );
  return rows[0] ?? null;
}

export async function getTripItinerary(tripId: string) {
  const stops = await query(
    `SELECT
       s.id, s.trip_id, s.city_id,
       to_char(s.start_date, 'YYYY-MM-DD') AS start_date,
       to_char(s.end_date, 'YYYY-MM-DD') AS end_date,
       s.stop_order, s.notes,
       c.name AS city_name, c.country, c.latitude, c.longitude
     FROM trip_stops s
     JOIN cities c ON c.id = s.city_id
     WHERE s.trip_id = $1
     ORDER BY s.stop_order ASC`,
    [tripId]
  );

  const activities = await query(
    `SELECT
       ta.id, ta.stop_id, ta.activity_id,
       to_char(ta.day_date, 'YYYY-MM-DD') AS day_date,
       ta.start_time, ta.end_time,
       ta.act_order, ta.notes, ta.custom_cost, ta.is_done,
       a.name AS activity_name, a.description, a.type, a.cost, a.duration_hrs, a.image_url
     FROM trip_activities ta
     JOIN activities a ON a.id = ta.activity_id
     JOIN trip_stops s ON s.id = ta.stop_id
     WHERE s.trip_id = $1
     ORDER BY ta.day_date ASC, ta.act_order ASC, ta.start_time ASC NULLS LAST`,
    [tripId]
  );

  return { stops: stops.rows, activities: activities.rows };
}
