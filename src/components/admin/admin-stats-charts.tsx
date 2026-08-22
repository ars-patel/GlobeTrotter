"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AdminStats } from "@/lib/admin/stats";

const tripsConfig = {
  count: { label: "Trips", color: "var(--chart-1)" },
} satisfies ChartConfig;

const cityConfig = {
  stop_count: { label: "Stops", color: "var(--chart-2)" },
} satisfies ChartConfig;

const activityConfig = {
  use_count: { label: "Uses", color: "var(--chart-3)" },
} satisfies ChartConfig;

export function AdminStatsCharts({ stats }: { stats: AdminStats }) {
  const cityData = stats.topCities.map((c) => ({
    label: c.name.length > 12 ? `${c.name.slice(0, 12)}…` : c.name,
    stop_count: c.stop_count,
  }));
  const activityData = stats.topActivities.map((a) => ({
    label: a.name.length > 12 ? `${a.name.slice(0, 12)}…` : a.name,
    use_count: a.use_count,
  }));

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="border-border shadow-none lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Trips created (12 months)</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={tripsConfig} className="h-[240px] w-full">
            <LineChart data={stats.tripsByMonth} accessibilityLayer>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={32} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="count"
                stroke="var(--color-count)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="border-border shadow-none">
        <CardHeader>
          <CardTitle className="text-base">Top cities (by stops)</CardTitle>
        </CardHeader>
        <CardContent>
          {cityData.length === 0 ? (
            <p className="text-sm text-muted-foreground">No stop data yet.</p>
          ) : (
            <ChartContainer config={cityConfig} className="h-[240px] w-full">
              <BarChart data={cityData} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={32} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="stop_count" fill="var(--color-stop_count)" radius={4} />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <Card className="border-border shadow-none">
        <CardHeader>
          <CardTitle className="text-base">Top activities</CardTitle>
        </CardHeader>
        <CardContent>
          {activityData.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity usage yet.</p>
          ) : (
            <ChartContainer config={activityConfig} className="h-[240px] w-full">
              <BarChart data={activityData} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={32} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="use_count" fill="var(--color-use_count)" radius={4} />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
