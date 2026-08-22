import { redirect } from "next/navigation";

/** Root redirects via middleware; keep a server fallback. */
export default function HomePage() {
  redirect("/login");
}
