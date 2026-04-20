import { AuthForm } from "../sign-in/auth-form";

export const metadata = { title: "Sign up · Gym Tracker" };

export default function SignUpPage() {
  return <AuthForm initialMode="sign-up" redirectTo="/" />;
}
