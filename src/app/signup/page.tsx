import { redirect } from "next/navigation";

type Props = {
  searchParams: Promise<{ next?: string }>;
};

export default async function SignupPage({ searchParams }: Props) {
  const sp = await searchParams;
  const params = new URLSearchParams({ auth: "signup" });
  if (sp.next) params.set("next", sp.next);
  redirect(`/?${params.toString()}`);
}
