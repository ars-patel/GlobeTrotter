"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PublicUser } from "@/lib/auth/session";
import {
  PROFILE_LANGUAGES,
  profileLanguageValues,
} from "@/lib/auth/profile-schema";
import { ProfilePhotoField } from "@/components/profile/profile-photo-field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";

export function ProfileForm({ user }: { user: PublicUser }) {
  const router = useRouter();
  const [firstName, setFirstName] = useState(user.first_name);
  const [lastName, setLastName] = useState(user.last_name);
  const [email, setEmail] = useState(user.email);
  const [username, setUsername] = useState(user.username ?? "");
  const [phone, setPhone] = useState(user.phone ?? "");
  const [homeCity, setHomeCity] = useState(user.home_city ?? "");
  const [homeCountry, setHomeCountry] = useState(user.home_country ?? "");
  const [additionalInfo, setAdditionalInfo] = useState(
    user.additional_info ?? ""
  );
  const [photoUrl, setPhotoUrl] = useState<string | null>(user.photo_url);
  const [language, setLanguage] = useState(
    profileLanguageValues.includes(user.language) ? user.language : "en"
  );
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const initials = `${firstName.slice(0, 1)}${lastName.slice(0, 1)}`.toUpperCase();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
          username: username || null,
          phone: phone || null,
          home_city: homeCity || null,
          home_country: homeCountry || null,
          additional_info: additionalInfo || null,
          photo_url: photoUrl,
          language,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save");
      setMessage("Profile updated");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 rounded-xl border border-border p-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Profile details</h2>
        <p className="text-sm text-muted-foreground">
          Update your name, photo, email, and language preference
        </p>
      </div>

      <ProfilePhotoField
        value={photoUrl}
        initials={initials || "?"}
        onChange={setPhotoUrl}
        disabled={loading}
      />

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {message ? (
        <Alert>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="first_name">First name</Label>
          <Input
            id="first_name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            maxLength={80}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_name">Last name</Label>
          <Input
            id="last_name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            maxLength={80}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            maxLength={255}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            maxLength={60}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="language">Language</Label>
          <NativeSelect
            id="language"
            className="w-full"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            {PROFILE_LANGUAGES.map((l) => (
              <NativeSelectOption key={l.value} value={l.value}>
                {l.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            maxLength={30}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="home_city">Home city</Label>
          <Input
            id="home_city"
            value={homeCity}
            onChange={(e) => setHomeCity(e.target.value)}
            maxLength={120}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="home_country">Home country</Label>
          <Input
            id="home_country"
            value={homeCountry}
            onChange={(e) => setHomeCountry(e.target.value)}
            maxLength={120}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="bio">Additional info</Label>
          <Textarea
            id="bio"
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
            rows={3}
            maxLength={2000}
          />
        </div>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? (
          <>
            <Spinner data-icon="inline-start" />
            Saving…
          </>
        ) : (
          "Save profile"
        )}
      </Button>
    </form>
  );
}
