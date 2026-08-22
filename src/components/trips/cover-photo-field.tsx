"use client";

import { useRef, useState } from "react";
import { ImageIcon, Trash2Icon, UploadIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

type CoverPhotoFieldProps = {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
};

export function CoverPhotoField({
  value,
  onChange,
  disabled,
}: CoverPhotoFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUrl, setShowUrl] = useState(false);

  async function onFileChange(file: File | undefined) {
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/uploads/cover", {
        method: "POST",
        body,
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Upload failed");
        return;
      }
      onChange(data.url ?? "");
    } catch {
      setError("Upload failed. Try again.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-3 sm:col-span-2">
      <Label>Cover photo (optional)</Label>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {value ? (
        <div className="overflow-hidden rounded-lg border border-border">
          <div className="aspect-[16/9] bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Trip cover preview"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 p-3">
            <p className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
              {value}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled || uploading}
              onClick={() => inputRef.current?.click()}
            >
              Replace
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled || uploading}
              onClick={() => onChange("")}
            >
              <Trash2Icon data-icon="inline-start" />
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled || uploading}
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/20 px-4 py-8 text-center transition-colors hover:bg-muted/40 disabled:opacity-50"
        >
          {uploading ? (
            <Spinner />
          ) : (
            <span className="flex size-10 items-center justify-center rounded-full border border-border bg-background">
              <ImageIcon className="size-5 text-muted-foreground" />
            </span>
          )}
          <span className="text-sm font-medium">
            {uploading ? "Uploading…" : "Upload cover photo"}
          </span>
          <span className="text-xs text-muted-foreground">
            JPEG, PNG, WebP, or GIF · max 5MB
          </span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        disabled={disabled || uploading}
        onChange={(e) => onFileChange(e.target.files?.[0])}
      />

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled || uploading}
          onClick={() => setShowUrl((v) => !v)}
        >
          <UploadIcon data-icon="inline-start" />
          {showUrl ? "Hide URL option" : "Or paste image URL"}
        </Button>
      </div>

      {showUrl ? (
        <div className="space-y-2">
          <Label htmlFor="cover_url">Cover photo URL</Label>
          <Input
            id="cover_url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled || uploading}
            placeholder="https://… or /uploads/…"
          />
        </div>
      ) : null}
    </div>
  );
}
