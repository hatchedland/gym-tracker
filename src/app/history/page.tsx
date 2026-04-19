import Link from "next/link";
import { Flame, Dumbbell } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { DAY_LABEL } from "@/lib/schedule";
import type { Trainable } from "@/lib/types";
import { WeekStrip } from "@/components/week-strip";
import { getStreak, getWeekSummary } from "@/lib/week-data";

export const dynamic = "force-dynamic";

type HistoryRow = {
  id: string;
  day: Trainable;
  started_at: string;
  completed_at: string | null;
  set_count: number;
  top_weight: number | null;
  volume: number;
};

const DAY_ACCENT: Record<Trainable, string> = {
  push: "from-rose-500 to-orange-500",
  pull: "from-sky-500 to-indigo-500",
  legs: "from-emerald-500 to-lime-500",
};

async function getHistory(): Promise<HistoryRow[]> {
  const sessions = await prisma.workoutSession.findMany({
    orderBy: { startedAt: "desc" },
    take: 50,
    include: { sets: { select: { weightKg: true, reps: true } } },
  });

  return sessions.map((s) => {
    let top: number | null = null;
    let vol = 0;
    for (const st of s.sets) {
      const w = st.weightKg ? Number(st.weightKg) : null;
      if (w != null && (top == null || w > top)) top = w;
      if (w != null && st.reps != null) vol += w * st.reps;
    }
    return {
      id: s.id,
      day: s.day as Trainable,
      started_at: s.startedAt.toISOString(),
      completed_at: s.completedAt?.toISOString() ?? null,
      set_count: s.sets.length,
      top_weight: top,
      volume: vol,
    };
  });
}

function fmt(date: string) {
  return new Date(date).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function duration(a: string, b: string | null) {
  if (!b) return "in progress";
  const min = Math.round(
    (new Date(b).getTime() - new Date(a).getTime()) / 60000,
  );
  return `${min} min`;
}

export default async function HistoryPage() {
  const [rows, streak, weekDots] = await Promise.all([
    getHistory(),
    getStreak(),
    getWeekSummary(),
  ]);

  const weekTrained = weekDots.filter((d) => d.trained).length;
  const totalSets = rows.reduce((a, r) => a + r.set_count, 0);
  const totalVol = rows.reduce((a, r) => a + r.volume, 0);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-black tracking-tight">History</h1>
        <p className="text-white/50 mt-1 text-sm">
          The scoreboard. Numbers don&apos;t lie.
        </p>
      </header>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        <StatCard
          label="Streak"
          value={`${streak}`}
          sub={streak === 1 ? "day" : "days"}
          tint="from-rose-500/30 to-orange-500/20"
          icon={<Flame className="h-4 w-4 text-rose-300" />}
        />
        <StatCard
          label="This week"
          value={`${weekTrained}`}
          sub={weekTrained === 1 ? "session" : "sessions"}
          tint="from-sky-500/30 to-indigo-500/20"
        />
        <StatCard
          label="Volume"
          value={
            totalVol >= 1000
              ? `${(totalVol / 1000).toFixed(1)}t`
              : `${Math.round(totalVol)}`
          }
          sub={totalVol >= 1000 ? "lifted" : "kg total"}
          tint="from-emerald-500/30 to-lime-500/20"
          icon={<Dumbbell className="h-4 w-4 text-emerald-300" />}
        />
      </div>

      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 space-y-3">
        <div className="text-xs uppercase tracking-wider text-white/40 font-bold">
          This week
        </div>
        <WeekStrip dots={weekDots} />
      </section>

      <section className="space-y-2">
        <div className="px-1 flex items-center justify-between">
          <h2 className="text-xs uppercase tracking-wider text-white/40 font-bold">
            Sessions
          </h2>
          <span className="text-[11px] text-white/30 num">
            {rows.length} total · {totalSets} sets
          </span>
        </div>

        {rows.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-10 text-center">
            <p className="text-white/60">
              No sessions yet. Go to{" "}
              <Link href="/" className="underline text-white font-semibold">
                Today
              </Link>{" "}
              and start one.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {rows.map((r) => (
              <li
                key={r.id}
                className="rounded-2xl border border-white/10 bg-white/[0.02] p-3 sm:p-4 flex items-center gap-3 sm:gap-4"
              >
                <div
                  className={`h-11 w-11 sm:h-12 sm:w-12 shrink-0 rounded-xl bg-gradient-to-br ${DAY_ACCENT[r.day]} flex items-center justify-center font-black text-xs sm:text-sm shadow-lg shadow-black/30`}
                >
                  {DAY_LABEL[r.day].slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold truncate">
                      {DAY_LABEL[r.day]}
                    </span>
                    {!r.completed_at && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold uppercase tracking-wider shrink-0">
                        Live
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-white/50 mt-0.5 num truncate">
                    {fmt(r.started_at)} ·{" "}
                    {duration(r.started_at, r.completed_at)}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-black text-lg num leading-none">
                    {r.set_count}
                    <span className="text-white/30 text-xs ml-0.5">sets</span>
                  </div>
                  {r.top_weight != null && (
                    <div className="text-[11px] text-white/50 num mt-1">
                      top {r.top_weight}kg
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  tint,
  icon,
}: {
  label: string;
  value: string;
  sub: string;
  tint: string;
  icon?: React.ReactNode;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${tint} p-3 min-w-0`}
    >
      <div className="flex items-center justify-between gap-1">
        <div className="text-[10px] uppercase tracking-wider text-white/60 font-bold truncate">
          {label}
        </div>
        <div className="shrink-0">{icon}</div>
      </div>
      <div className="mt-1 text-xl sm:text-2xl font-black num leading-none truncate">
        {value}
      </div>
      <div className="mt-0.5 text-[11px] text-white/50 num truncate">{sub}</div>
    </div>
  );
}
