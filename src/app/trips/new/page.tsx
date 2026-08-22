import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function CreateTripPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-10">
      <Card className="border-border shadow-none">
        <CardHeader>
          <CardTitle className="text-xl">Create Trip</CardTitle>
          <CardDescription>Name your trip and set travel dates.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Trip name</Label>
            <Input id="name" placeholder="Summer Europe 2026" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="start">Start date</Label>
              <Input id="start" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end">End date</Label>
              <Input id="end" type="date" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" placeholder="Optional notes about this trip" />
          </div>
          <Button>Save trip</Button>
        </CardContent>
      </Card>
    </div>
  );
}
