import { DAY_LABEL, type Day } from "@/lib/schedule";
import type { WeekDot } from "@/lib/week-data";
import { WeekStrip } from "./week-strip";

type Trainable = Exclude<Day, "rest">;

const ACCENT: Record<Trainable, { grad: string; chip: string; label: string }> = {
  push: {
    grad: "from-rose-600 via-rose-500 to-orange-500",
    chip: "bg-rose-500/20 text-rose-200",
    label: "Chest · Shoulders · Triceps",
  },
  pull: {
    grad: "from-sky-600 via-blue-500 to-indigo-500",
    chip: "bg-sky-500/20 text-sky-200",
    label: "Back · Rear delts · Biceps",
  },
  legs: {
    grad: "from-emerald-600 via-emerald-500 to-lime-500",
    chip: "bg-emerald-500/20 text-emerald-200",
    label: "Quads · Hams · Calves",
  },
};

export function WorkoutHero({
  day,
  heading,
  subheading,
  weekDots,
  sessionLive = false,
  children,
}: {
  day: Trainable;
  heading: string;
  subheading?: string;
  weekDots: WeekDot[];
  sessionLive?: boolean;
  children?: React.ReactNode;
}) {
  const a = ACCENT[day];
  return (
    <section
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${a.grad} p-5 sm:p-8`}
    >
      <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-white/20 blur-3xl" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] uppercase tracking-[0.2em] text-white/80 font-bold">
            {subheading ?? "Workout"}
          </span>
          {sessionLive && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/35 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </span>
          )}
        </div>
        <h1 className="mt-1 text-[44px] sm:text-6xl font-black tracking-tight leading-[0.95]">
          {heading}
        </h1>
        <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-black/25 backdrop-blur px-2.5 py-1 text-[11px] sm:text-xs font-medium">
          {a.label}
        </div>

        <div className="mt-4 sm:mt-5">
          <WeekStrip dots={weekDots} />
        </div>

        {children && <div className="mt-4">{children}</div>}
      </div>
    </section>
  );
}

export function RestHero({ weekDots }: { weekDots: WeekDot[] }) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-800 via-zinc-900 to-black p-5 sm:p-8">
      <div className="absolute -top-24 -right-24 h-60 w-60 rounded-full bg-white/5 blur-3xl" />
      <div className="relative z-10">
        <span className="text-[11px] uppercase tracking-[0.2em] text-white/60 font-bold">
          {new Date().toLocaleDateString(undefined, { weekday: "long" })}
        </span>
        <h1 className="mt-1 text-[44px] sm:text-6xl font-black tracking-tight leading-[0.95]">
          Rest.
        </h1>
        <p className="mt-2 text-white/70 text-sm max-w-sm">
          Recovery is when growth happens. Sleep 8h. Eat your protein. Walk.
        </p>
        <div className="mt-5">
          <WeekStrip dots={weekDots} />
        </div>
      </div>
    </section>
  );
}

export { DAY_LABEL };
