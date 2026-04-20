import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";

/** Fetches the current session from the auth server. Redirects to /sign-in
 *  if there isn't one. Use in Server Components and Server Actions. */
export async function requireUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/sign-in");
  return session.user;
}

/** Same as requireUser but returns null instead of redirecting. */
export async function getOptionalUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
}
