import { redirect } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProfileForm } from "@/components/profile/profile-form";
import { ProfileTripRow } from "@/components/profile/profile-trip-row";
import { SavedDestinationsList } from "@/components/profile/saved-destinations-list";
import { DeleteAccountDialog } from "@/components/profile/delete-account-dialog";
import { Separator } from "@/components/ui/separator";
import { getCurrentUser } from "@/lib/auth/session";
import { query } from "@/lib/db";
import { toDateString } from "@/lib/dates";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { rows } = await query<{
    id: string;
    name: string;
    start_date: string;
    end_date: string;
  }>(
    `SELECT
       id, name,
       to_char(start_date, 'YYYY-MM-DD') AS start_date,
       to_char(end_date, 'YYYY-MM-DD') AS end_date
     FROM trips WHERE user_id = $1 ORDER BY start_date ASC`,
    [user.id]
  );

  const saved = await query<{
    id: string;
    city_id: string;
    city_name: string;
    country: string;
    region: string | null;
    image_url: string | null;
  }>(
    `SELECT
       sd.id,
       sd.city_id,
       c.name AS city_name,
       c.country,
       c.region,
       c.image_url
     FROM saved_destinations sd
     JOIN cities c ON c.id = sd.city_id
     WHERE sd.user_id = $1
     ORDER BY c.name ASC`,
    [user.id]
  );

  const today = new Date().toISOString().slice(0, 10);
  const planned = rows
    .filter((t) => toDateString(t.end_date) >= today)
    .map((t) => ({
      id: t.id,
      name: t.name,
      start_date: toDateString(t.start_date),
      end_date: toDateString(t.end_date),
    }));
  const previous = rows
    .filter((t) => toDateString(t.end_date) < today)
    .map((t) => ({
      id: t.id,
      name: t.name,
      start_date: toDateString(t.start_date),
      end_date: toDateString(t.end_date),
    }));

  const initials =
    `${user.first_name.slice(0, 1)}${user.last_name.slice(0, 1)}`.toUpperCase();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <AppHeader user={user} />
      <main className="mx-auto w-full max-w-4xl flex-1 space-y-10 px-6 py-8">
        <section className="flex flex-wrap items-center gap-4">
          <Avatar className="size-20">
            {user.photo_url ? (
              <AvatarImage src={user.photo_url} alt="" />
            ) : null}
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {user.first_name} {user.last_name}
            </h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <p className="text-sm text-muted-foreground">
              {[user.home_city, user.home_country].filter(Boolean).join(", ") ||
                "No home city set"}
              {" · "}
              Language: {user.language.toUpperCase()}
            </p>
          </div>
        </section>

        <ProfileForm user={user} />

        <Separator />

        <ProfileTripRow title="Planned Trip" trips={planned} />
        <ProfileTripRow title="Previous Trip" trips={previous} />

        <SavedDestinationsList
          initial={saved.rows.map((r) => ({
            id: r.id,
            city_id: r.city_id,
            city_name: r.city_name,
            country: r.country,
            region: r.region,
            image_url: r.image_url,
          }))}
        />

        <DeleteAccountDialog />
      </main>
    </div>
  );
}
