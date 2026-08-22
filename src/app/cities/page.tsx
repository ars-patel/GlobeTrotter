import { Input } from "@/components/ui/input";

export default function CitiesPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">City Search</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Find destinations by name, country, or region.
      </p>
      <div className="mt-6 max-w-md">
        <Input placeholder="Search cities…" />
      </div>
    </div>
  );
}
