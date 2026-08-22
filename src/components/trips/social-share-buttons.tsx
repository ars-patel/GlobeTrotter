"use client";

import { useState } from "react";
import { LinkIcon, MailIcon, Share2Icon } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function buildLinks(url: string, title: string) {
  const encodedUrl = encodeURIComponent(url);
  const text = encodeURIComponent(`Check out this trip: ${title}`);
  return {
    x: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${text}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${text}%20${encodedUrl}`,
    email: `mailto:?subject=${encodeURIComponent(title)}&body=${text}%0A%0A${encodedUrl}`,
  };
}

export function SocialShareButtons({
  url,
  title,
  className,
}: {
  url: string;
  title: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const links = buildLinks(url, title);
  const linkClass = cn(buttonVariants({ variant: "outline", size: "sm" }));

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  async function nativeShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          url,
          text: `Check out this trip: ${title}`,
        });
        return;
      } catch {
        /* cancelled */
      }
    }
    await copyLink();
  }

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => void nativeShare()}
      >
        <Share2Icon data-icon="inline-start" />
        Share
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => void copyLink()}
      >
        <LinkIcon data-icon="inline-start" />
        {copied ? "Copied" : "Copy link"}
      </Button>
      <a
        href={links.x}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
      >
        X / Twitter
      </a>
      <a
        href={links.facebook}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
      >
        Facebook
      </a>
      <a
        href={links.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
      >
        WhatsApp
      </a>
      <a href={links.email} className={linkClass}>
        <MailIcon data-icon="inline-start" className="size-3.5" />
        Email
      </a>
    </div>
  );
}
