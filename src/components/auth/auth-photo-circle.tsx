"use client";

import { useEffect, useRef, useState } from "react";
import { CameraIcon, UserIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

/**
 * Circular photo control for Design 1 (display) / Design 2 (upload).
 * Matches Excalidraw mockup “Photo” circle above auth forms.
 */
export function AuthPhotoCircle({
  mode,
  value,
  onChange,
  disabled,
  className,
}: {
  mode: "display" | "upload";
  value?: string | null;
  onChange?: (file: File | null, previewUrl: string | null) => void;
  disabled?: boolean;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(value ?? null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPreview(value ?? null);
  }, [value]);

  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function pickFile(file: File | undefined) {
    if (!file || !onChange) return;
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Choose an image file (JPEG, PNG, WebP, or GIF)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Photo must be 5MB or smaller");
      return;
    }
    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    const url = URL.createObjectURL(file);
    setPreview(url);
    onChange(file, url);
  }

  const inner = (
    <Avatar className="size-24 border-2 border-border shadow-sm">
      {preview ? <AvatarImage src={preview} alt="" /> : null}
      <AvatarFallback className="bg-muted text-muted-foreground">
        {mode === "upload" ? (
          <CameraIcon className="size-8" aria-hidden />
        ) : (
          <UserIcon className="size-8" aria-hidden />
        )}
      </AvatarFallback>
    </Avatar>
  );

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      {mode === "upload" ? (
        <>
          <button
            type="button"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
            className="rounded-full outline-offset-4 transition hover:opacity-90 focus-visible:outline-2"
            aria-label="Add profile photo"
          >
            {inner}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            disabled={disabled}
            onChange={(e) => {
              void pickFile(e.target.files?.[0]);
              if (inputRef.current) inputRef.current.value = "";
            }}
          />
          <p className="text-xs text-muted-foreground">
            {preview ? "Tap photo to change" : "Add profile photo"}
          </p>
          {preview ? (
            <button
              type="button"
              className="text-xs text-muted-foreground underline-offset-4 hover:underline"
              disabled={disabled}
              onClick={() => {
                if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
                setPreview(null);
                onChange?.(null, null);
              }}
            >
              Remove photo
            </button>
          ) : null}
        </>
      ) : (
        inner
      )}
      {error ? (
        <Alert variant="destructive" className="max-w-xs">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
