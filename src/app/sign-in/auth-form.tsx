"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { signIn, signUp } from "@/lib/auth-client";

type Mode = "sign-in" | "sign-up";

export function AuthForm({
  initialMode,
  redirectTo,
}: {
  initialMode: Mode;
  redirectTo: string;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        if (mode === "sign-up") {
          const { error } = await signUp.email({
            name: name.trim() || email.split("@")[0],
            email: email.trim(),
            password,
          });
          if (error) {
            setError(error.message ?? "Couldn't create account.");
            return;
          }
        } else {
          const { error } = await signIn.email({
            email: email.trim(),
            password,
          });
          if (error) {
            setError(error.message ?? "Wrong email or password.");
            return;
          }
        }
        router.replace(redirectTo);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong.");
      }
    });
  };

  const isSignUp = mode === "sign-up";

  return (
    <div className="min-h-[80dvh] flex items-center justify-center px-1">
      <div className="w-full max-w-sm space-y-6">
        <header className="text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 mb-4 shadow-lg shadow-rose-500/20">
            <span className="font-black text-xl text-white">G</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight">
            {isSignUp ? "Create account" : "Welcome back"}
          </h1>
          <p className="mt-1.5 text-sm text-white/50">
            {isSignUp
              ? "Start logging sets in 60 seconds."
              : "Sign in to keep the streak alive."}
          </p>
        </header>

        <form onSubmit={submit} className="space-y-3">
          {isSignUp && (
            <Field
              label="Name"
              type="text"
              value={name}
              onChange={setName}
              autoComplete="name"
              placeholder="What should we call you?"
            />
          )}
          <Field
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            autoComplete="email"
            placeholder="you@example.com"
            required
          />
          <Field
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            autoComplete={isSignUp ? "new-password" : "current-password"}
            placeholder={isSignUp ? "8+ characters" : "••••••••"}
            required
            minLength={isSignUp ? 8 : undefined}
          />

          {error && (
            <div className="text-sm text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full h-12 rounded-xl bg-white text-black font-bold text-sm active:scale-[0.99] transition disabled:opacity-50 inline-flex items-center justify-center gap-2"
          >
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSignUp ? "Create account" : "Sign in"}
          </button>
        </form>

        <div className="text-center text-sm text-white/50">
          {isSignUp ? "Already have an account?" : "New here?"}{" "}
          <button
            type="button"
            onClick={() => {
              setMode(isSignUp ? "sign-in" : "sign-up");
              setError(null);
            }}
            className="text-white font-semibold underline-offset-2 hover:underline"
          >
            {isSignUp ? "Sign in" : "Create one"}
          </button>
        </div>

        <div className="text-center text-[11px] text-white/30">
          <Link href="/guide" className="hover:text-white/50">
            Read the Cavill protocol
          </Link>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  autoComplete,
  placeholder,
  required,
  minLength,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
}) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        className="mt-1 w-full h-12 bg-black/60 border border-white/10 rounded-xl px-4 text-base focus:border-white/40 focus:outline-none placeholder-white/30"
      />
    </label>
  );
}
