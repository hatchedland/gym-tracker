import { DAY_LABEL } from "@/lib/schedule";
import type { WeekDot } from "@/lib/week-data";

const DAY_TINT: Record<WeekDot["planned"], string> = {
  push: "bg-rose-500",
  pull: "bg-sky-500",
  legs: "bg-emerald-500",
  rest: "bg-zinc-600",
};

export function WeekStrip({ dots }: { dots: WeekDot[] }) {
  return (
    <div className="flex items-center gap-1 sm:gap-1.5">
      {dots.map((d) => {
        const letter = DAY_LABEL[d.planned].slice(0, 1);
        return (
          <div
            key={d.index + "-" + (d.isToday ? "t" : "")}
            className={`flex-1 min-w-0 rounded-xl px-1 sm:px-2 py-2 text-center transition ${
              d.isToday
                ? "bg-white text-black font-bold ring-2 ring-white/40"
                : d.trained
                  ? "bg-white/10 text-white"
                  : "bg-white/[0.03] text-white/40"
            }`}
          >
            <div className="text-[10px] uppercase tracking-wider opacity-70 font-semibold">
              {d.letter}
            </div>
            <div className="mt-1 text-sm font-bold leading-none">{letter}</div>
            <div
              className={`mx-auto mt-1.5 h-1 w-1 rounded-full ${
                d.trained
                  ? DAY_TINT[d.planned]
                  : d.isToday
                    ? "bg-black"
                    : "bg-white/15"
              }`}
            />
          </div>
        );
      })}
    </div>
  );
}
