import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { WorkoutView } from "@/components/workout-view";
import { RestHero } from "@/components/workout-hero";
import { todayDay, todayName } from "@/lib/schedule";
import { getWeekSummary } from "@/lib/week-data";

export const dynamic = "force-dynamic";

const QUICK_JUMPS = [
  {
    d: "push" as const,
    label: "Push",
    grad: "from-rose-600 to-orange-500",
    muscles: "Chest · Delts · Tri",
  },
  {
    d: "pull" as const,
    label: "Pull",
    grad: "from-sky-600 to-indigo-500",
    muscles: "Back · Rear · Bi",
  },
  {
    d: "legs" as const,
    label: "Legs",
    grad: "from-emerald-600 to-lime-500",
    muscles: "Quads · Hams · Calves",
  },
];

export default async function HomePage() {
  const day = todayDay();
  const dayName = todayName();

  if (day === "rest") {
    const weekDots = await getWeekSummary();
    return (
      <div className="space-y-6">
        <RestHero weekDots={weekDots} />

        <div>
          <h2 className="px-1 text-xs uppercase tracking-wider text-white/40 font-bold mb-2">
            Train early
          </h2>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {QUICK_JUMPS.map((j) => (
              <Link
                key={j.d}
                href={`/workout/${j.d}`}
                className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${j.grad} p-3 sm:p-5 active:scale-[0.98] transition min-h-[7rem] sm:min-h-0`}
              >
                <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
                <div className="relative flex flex-col sm:flex-row sm:items-start sm:justify-between h-full">
                  <div className="flex-1">
                    <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-white/70">
                      Jump to
                    </div>
                    <div className="mt-1 text-2xl sm:text-3xl font-black tracking-tight">
                      {j.label}
                    </div>
                    <div className="mt-1 text-[10px] sm:text-xs text-white/70 leading-tight">
                      {j.muscles}
                    </div>
                  </div>
                  <ArrowUpRight className="hidden sm:block h-5 w-5 opacity-60 group-hover:opacity-100 transition" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <WorkoutView
      day={day}
      heading={day.toUpperCase()}
      subheading={dayName}
    />
  );
}
