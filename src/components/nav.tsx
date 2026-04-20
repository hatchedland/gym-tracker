"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Home, LineChart, LogOut, Target } from "lucide-react";
import { signOut, useSession } from "@/lib/auth-client";

const TABS = [
  { href: "/", label: "Today", Icon: Home },
  { href: "/history", label: "History", Icon: LineChart },
  { href: "/guide", label: "Protocol", Icon: Target },
];

export function Nav() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  // Hide nav on auth pages
  if (pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up")) {
    return null;
  }

  return (
    <>
      <header className="hidden sm:flex sticky top-0 z-30 border-b border-white/5 bg-black/70 backdrop-blur-xl">
        <div className="mx-auto max-w-3xl w-full px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-white to-white/60 flex items-center justify-center">
              <span className="text-black font-black text-sm leading-none">
                G
              </span>
            </div>
            <span className="font-black tracking-tight text-lg">
              Gym<span className="text-rose-500">.</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <nav className="flex items-center gap-1">
              {TABS.map(({ href, label, Icon }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`group inline-flex items-center gap-2 px-4 h-10 rounded-full text-sm transition-all ${
                      active
                        ? "bg-white text-black font-semibold"
                        : "text-white/60 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                );
              })}
            </nav>
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Mobile bottom tab bar */}
      <nav
        className="sm:hidden fixed bottom-0 inset-x-0 z-30 bg-black/85 backdrop-blur-2xl border-t border-white/10"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="grid grid-cols-3">
          {TABS.map(({ href, label, Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center justify-center gap-1 pt-2.5 pb-3 text-[11px] font-medium relative ${
                  active ? "text-white" : "text-white/45"
                }`}
              >
                {active && (
                  <span className="absolute top-0 h-[2px] w-10 rounded-full bg-white" />
                )}
                <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

function UserMenu() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  if (isPending || !session?.user) return null;
  const initial = (session.user.name || session.user.email)
    .charAt(0)
    .toUpperCase();

  const doSignOut = async () => {
    setSigningOut(true);
    await signOut();
    router.replace("/sign-in");
    router.refresh();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="h-9 w-9 rounded-full bg-white/10 hover:bg-white/15 flex items-center justify-center font-bold text-sm"
        aria-label="Account menu"
      >
        {initial}
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-white/10 bg-zinc-950 backdrop-blur-xl z-50 overflow-hidden shadow-2xl">
            <div className="px-3 py-3 border-b border-white/5">
              <div className="text-sm font-semibold truncate">
                {session.user.name}
              </div>
              <div className="text-xs text-white/50 truncate">
                {session.user.email}
              </div>
            </div>
            <button
              onClick={doSignOut}
              disabled={signingOut}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-white/80 hover:bg-white/5 disabled:opacity-50"
            >
              <LogOut className="h-4 w-4" />
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
