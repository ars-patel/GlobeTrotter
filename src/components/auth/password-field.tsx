"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PasswordFieldProps = {
  id: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  disabled?: boolean;
  className?: string;
  "aria-invalid"?: boolean;
};

export function PasswordField({
  id,
  name = "password",
  value,
  onChange,
  placeholder = "••••••••",
  autoComplete = "current-password",
  disabled,
  className,
  "aria-invalid": ariaInvalid,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={cn("relative", className)}>
      <Input
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        aria-invalid={ariaInvalid}
        className="pr-10"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="absolute top-1/2 right-1 -translate-y-1/2"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        disabled={disabled}
      >
        {visible ? <EyeOff /> : <Eye />}
      </Button>
    </div>
  );
}
