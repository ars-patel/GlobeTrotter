"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function DateField({
  id,
  label,
  value,
  onChange,
  minDate,
  placeholder = "Pick a date",
}: {
  id: string;
  label: string;
  value?: Date;
  onChange: (date: Date | undefined) => void;
  minDate?: Date;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              id={id}
              type="button"
              variant="outline"
              className={cn(
                "h-10 w-full justify-start font-normal",
                !value && "text-muted-foreground"
              )}
            />
          }
        >
          <CalendarIcon className="mr-2 size-4 opacity-70" />
          {value ? format(value, "MMM d, yyyy") : placeholder}
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={(d) => {
              onChange(d);
              setOpen(false);
            }}
            disabled={minDate ? { before: minDate } : undefined}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
