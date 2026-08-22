export const BUDGET_CATEGORIES = [
  "TRANSPORT",
  "STAY",
  "ACTIVITIES",
  "MEALS",
  "OTHER",
] as const;

export type BudgetCategory = (typeof BUDGET_CATEGORIES)[number];

export const MANUAL_BUDGET_CATEGORIES = [
  "TRANSPORT",
  "STAY",
  "MEALS",
  "OTHER",
] as const;

export type ManualBudgetCategory = (typeof MANUAL_BUDGET_CATEGORIES)[number];
