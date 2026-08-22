/** Allow only same-origin relative paths for post-auth redirects. */
export function safeNextPath(
  next: string | null | undefined,
  fallback = "/discover"
) {
  if (!next) return fallback;
  if (!next.startsWith("/")) return fallback;
  if (next.startsWith("//")) return fallback;
  if (next.startsWith("/login") || next.startsWith("/signup")) return fallback;
  if (next.startsWith("/forgot-password") || next.startsWith("/reset-password")) {
    return fallback;
  }
  return next;
}
