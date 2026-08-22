"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const categoryConfig = {
  amount: { label: "Amount" },
  TRANSPORT: { label: "Transport", color: "var(--chart-1)" },
  STAY: { label: "Stay", color: "var(--chart-2)" },
  ACTIVITIES: { label: "Activities", color: "var(--chart-3)" },
  MEALS: { label: "Meals", color: "var(--chart-4)" },
  OTHER: { label: "Other", color: "var(--chart-5)" },
} satisfies ChartConfig;

const dayConfig = {
  amount: { label: "Daily spend", color: "var(--chart-1)" },
  total: { label: "Running total", color: "var(--chart-2)" },
} satisfies ChartConfig;

export function BudgetCharts({
  byCategory,
  byDay,
  runningTotal,
}: {
  byCategory: { category: string; amount: number }[];
  byDay: { day: string; amount: number }[];
  runningTotal: { day: string; total: number }[];
}) {
  const pieData = byCategory
    .filter((c) => c.amount > 0)
    .map((c) => ({
      name: c.category,
      amount: Number(c.amount.toFixed(2)),
      fill:
        categoryConfig[c.category as keyof typeof categoryConfig] &&
        "color" in categoryConfig[c.category as keyof typeof categoryConfig]
          ? (categoryConfig[c.category as keyof typeof categoryConfig] as {
              color: string;
            }).color
          : COLORS[0],
    }));

  const barData = byDay.map((d) => ({
    day: d.day.slice(5),
    amount: Number(d.amount.toFixed(2)),
  }));

  const lineData = runningTotal.map((d) => ({
    day: d.day.slice(5),
    total: Number(d.total.toFixed(2)),
  }));

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="border-border shadow-none lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Category breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {pieData.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No costs yet — add activities or manual cost lines.
            </p>
          ) : (
            <ChartContainer config={categoryConfig} className="mx-auto h-[260px] w-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                <Pie
                  data={pieData}
                  dataKey="amount"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={90}
                  strokeWidth={2}
                >
                  {pieData.map((entry, i) => (
                    <Cell key={entry.name} fill={entry.fill || COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <ChartLegend content={<ChartLegendContent nameKey="name" />} />
              </PieChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <Card className="border-border shadow-none">
        <CardHeader>
          <CardTitle className="text-base">Spend by day</CardTitle>
        </CardHeader>
        <CardContent>
          {barData.length === 0 ? (
            <p className="text-sm text-muted-foreground">No daily spend yet.</p>
          ) : (
            <ChartContainer config={dayConfig} className="h-[220px] w-full">
              <BarChart data={barData} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={40} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="amount" fill="var(--color-amount)" radius={4} />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <Card className="border-border shadow-none">
        <CardHeader>
          <CardTitle className="text-base">Running total</CardTitle>
        </CardHeader>
        <CardContent>
          {lineData.length === 0 ? (
            <p className="text-sm text-muted-foreground">No trend yet.</p>
          ) : (
            <ChartContainer config={dayConfig} className="h-[220px] w-full">
              <LineChart data={lineData} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={40} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="var(--color-total)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
