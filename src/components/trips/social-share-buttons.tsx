"use client";

import { useState } from "react";
import {
  FacebookIcon,
  LinkIcon,
  MailIcon,
  Share2Icon,
  TwitterIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
        await navigator.share({ title, url, text: `Check out this trip: ${title}` });
        return;
      } catch {
        /* user cancelled */
      }
    }
    await copyLink();
  }

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <Button type="button" size="sm" variant="outline" onClick={() => void nativeShare()}>
        <Share2Icon data-icon="inline-start" />
        Share
      </Button>
      <Button type="button" size="sm" variant="outline" onClick={() => void copyLink()}>
        <LinkIcon data-icon="inline-start" />
        {copied ? "Copied" : "Copy link"}
      </Button>
      <Button type="button" size="sm" variant="outline" render={<a href={links.x} target="_blank" rel="noopener noreferrer" />}>
        <TwitterIcon data-icon="inline-start" />
        X
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        render={<a href={links.facebook} target="_blank" rel="noopener noreferrer" />}
      >
        <FacebookIcon data-icon="inline-start" />
        Facebook
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        render={<a href={links.whatsapp} target="_blank" rel="noopener noreferrer" />}
      >
        WhatsApp
      </Button>
      <Button type="button" size="sm" variant="outline" render={<a href={links.email} />}>
        <MailIcon data-icon="inline-start" />
        Email
      </Button>
    </div>
  );
}
