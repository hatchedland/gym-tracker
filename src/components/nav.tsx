"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LineChart, Target } from "lucide-react";

const TABS = [
  { href: "/", label: "Today", Icon: Home },
  { href: "/history", label: "History", Icon: LineChart },
  { href: "/guide", label: "Protocol", Icon: Target },
];

export function Nav() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

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
