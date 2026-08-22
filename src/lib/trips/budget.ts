import { query } from "@/lib/db";
import { toDateString } from "@/lib/dates";
import {
  BUDGET_CATEGORIES,
  type BudgetCategory,
} from "@/lib/trips/budget-categories";

export { BUDGET_CATEGORIES, type BudgetCategory };
export type BudgetSnapshot = {
  total: number;
  activitiesTotal: number;
  manualTotal: number;
  avgPerDay: number;
  dayCount: number;
  budgetLimit: number | null;
  remaining: number | null;
  overBudget: boolean;
  byCategory: { category: string; amount: number }[];
  byDay: { day: string; amount: number; overDailyCap: boolean }[];
  runningTotal: { day: string; total: number }[];
  overBudgetDays: string[];
  dailyCap: number | null;
  costLines: {
    id: string;
    category: string;
    label: string | null;
    amount: number;
    day_date: string | null;
  }[];
};

export async function getTripBudgetSnapshot(
  tripId: string,
  trip: { start_date: unknown; end_date: unknown; budget_limit: unknown }
): Promise<BudgetSnapshot> {
  const start = toDateString(trip.start_date);
  const end = toDateString(trip.end_date);
  const startMs = Date.parse(`${start}T12:00:00Z`);
  const endMs = Date.parse(`${end}T12:00:00Z`);
  const dayCount = Math.max(
    1,
    Math.round((endMs - startMs) / 86400000) + 1
  );

  const activityRows = await query<{
    day_date: string;
    amount: string | number;
  }>(
    `SELECT
       to_char(ta.day_date, 'YYYY-MM-DD') AS day_date,
       COALESCE(ta.custom_cost, a.cost, 0)::float AS amount
     FROM trip_activities ta
     JOIN activities a ON a.id = ta.activity_id
     JOIN trip_stops s ON s.id = ta.stop_id
     WHERE s.trip_id = $1`,
    [tripId]
  );

  const lines = await query<{
    id: string;
    category: string;
    label: string | null;
    amount: string | number;
    day_date: string | null;
  }>(
    `SELECT
       id, category::text AS category, label, amount::float AS amount,
       CASE WHEN day_date IS NULL THEN NULL ELSE to_char(day_date, 'YYYY-MM-DD') END AS day_date
     FROM trip_costs
     WHERE trip_id = $1
     ORDER BY category ASC, id ASC`,
    [tripId]
  );

  let activitiesTotal = 0;
  const dayMap = new Map<string, number>();

  for (const row of activityRows.rows) {
    const amount = Number(row.amount) || 0;
    activitiesTotal += amount;
    const day = toDateString(row.day_date);
    dayMap.set(day, (dayMap.get(day) ?? 0) + amount);
  }

  const categoryMap = new Map<string, number>();
  categoryMap.set("ACTIVITIES", activitiesTotal);

  let manualTotal = 0;
  for (const row of lines.rows) {
    const amount = Number(row.amount) || 0;
    manualTotal += amount;
    const cat = String(row.category);
    categoryMap.set(cat, (categoryMap.get(cat) ?? 0) + amount);
    if (row.day_date) {
      const day = toDateString(row.day_date);
      dayMap.set(day, (dayMap.get(day) ?? 0) + amount);
    }
  }

  for (const cat of BUDGET_CATEGORIES) {
    if (!categoryMap.has(cat)) categoryMap.set(cat, 0);
  }

  const total = activitiesTotal + manualTotal;
  const budgetLimit =
    trip.budget_limit == null ? null : Number(trip.budget_limit);
  const dailyCap =
    budgetLimit != null && dayCount > 0 ? budgetLimit / dayCount : null;

  const byDay = [...dayMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, amount]) => ({
      day,
      amount,
      overDailyCap: dailyCap != null && amount > dailyCap,
    }));

  let running = 0;
  const runningTotal = byDay.map((d) => {
    running += d.amount;
    return { day: d.day, total: running };
  });

  const overBudgetDays = byDay.filter((d) => d.overDailyCap).map((d) => d.day);

  return {
    total,
    activitiesTotal,
    manualTotal,
    avgPerDay: total / dayCount,
    dayCount,
    budgetLimit,
    remaining: budgetLimit != null ? budgetLimit - total : null,
    overBudget: budgetLimit != null && total > budgetLimit,
    byCategory: BUDGET_CATEGORIES.map((category) => ({
      category,
      amount: categoryMap.get(category) ?? 0,
    })),
    byDay,
    runningTotal,
    overBudgetDays,
    dailyCap,
    costLines: lines.rows.map((r) => ({
      id: r.id,
      category: String(r.category),
      label: r.label,
      amount: Number(r.amount) || 0,
      day_date: r.day_date ? toDateString(r.day_date) : null,
    })),
  };
}
