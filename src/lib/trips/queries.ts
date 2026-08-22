import { query } from "@/lib/db";

export async function getOwnedTrip(tripId: string, userId: string) {
  const { rows } = await query(
    `SELECT * FROM trips WHERE id = $1 AND user_id = $2`,
    [tripId, userId]
  );
  return rows[0] ?? null;
}

export async function getTripItinerary(tripId: string) {
  const stops = await query(
    `SELECT
       s.id, s.trip_id, s.city_id, s.start_date, s.end_date, s.stop_order, s.notes,
       c.name AS city_name, c.country, c.latitude, c.longitude
     FROM trip_stops s
     JOIN cities c ON c.id = s.city_id
     WHERE s.trip_id = $1
     ORDER BY s.stop_order ASC`,
    [tripId]
  );

  const activities = await query(
    `SELECT
       ta.id, ta.stop_id, ta.activity_id, ta.day_date, ta.start_time, ta.end_time,
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
