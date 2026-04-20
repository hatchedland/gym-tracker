import { AuthForm } from "./auth-form";

export const metadata = { title: "Sign in · Gym Tracker" };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const sp = await searchParams;
  return <AuthForm initialMode="sign-in" redirectTo={sp.from ?? "/"} />;
}
