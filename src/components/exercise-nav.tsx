"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import type { ExerciseDTO } from "@/lib/types";

type Props = {
  exercises: ExerciseDTO[];
  setsByExerciseId: Record<string, number>;
};

export function ExerciseNav({ exercises, setsByExerciseId }: Props) {
  const [activeId, setActiveId] = useState<string | null>(
    () => exercises[0]?.id ?? null,
  );

  // Track which exercise is currently "in view" via IntersectionObserver
  useEffect(() => {
    const sections = exercises
      .map((e) => document.getElementById(`exercise-${e.id}`))
      .filter((el): el is HTMLElement => !!el);

    if (!sections.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        // Use the most-visible intersecting entry
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          const id = visible.target.id.replace("exercise-", "");
          setActiveId(id);
        }
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: [0, 0.25, 0.5, 1] },
    );

    sections.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, [exercises]);

  // Auto-scroll to the next incomplete exercise when the current one completes
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ exerciseId: string }>).detail;
      const idx = exercises.findIndex((x) => x.id === detail.exerciseId);
      if (idx === -1) return;
      // Find next exercise that isn't done
      for (let i = idx + 1; i < exercises.length; i++) {
        const ex = exercises[i];
        const done = (setsByExerciseId[ex.id] ?? 0) >= ex.target_sets;
        if (!done) {
          setTimeout(() => {
            document
              .getElementById(`exercise-${ex.id}`)
              ?.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 600);
          return;
        }
      }
    };
    window.addEventListener("exercise-complete", handler);
    return () => window.removeEventListener("exercise-complete", handler);
  }, [exercises, setsByExerciseId]);

  const jumpTo = (id: string) => {
    document
      .getElementById(`exercise-${id}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav
      className="sticky top-0 sm:top-16 z-20 -mx-4 px-4 py-2 bg-black/70 backdrop-blur-xl border-b border-white/5"
      aria-label="Exercises"
    >
      <ol className="flex gap-1.5 overflow-x-auto scrollbar-none -mx-1 px-1">
        {exercises.map((e, i) => {
          const count = setsByExerciseId[e.id] ?? 0;
          const done = count >= e.target_sets;
          const active = e.id === activeId;
          const pct = Math.min(100, (count / e.target_sets) * 100);
          return (
            <li key={e.id} className="shrink-0">
              <button
                onClick={() => jumpTo(e.id)}
                aria-current={active ? "true" : undefined}
                className={`group flex items-center gap-2 rounded-full pl-2 pr-3 h-11 sm:h-10 text-xs transition active:scale-95 ${
                  done
                    ? "bg-emerald-500/15 text-emerald-200 border border-emerald-500/30"
                    : active
                      ? "bg-white text-black font-semibold"
                      : "bg-white/5 text-white/60 hover:bg-white/10 border border-white/10"
                }`}
                title={e.name}
              >
                <span
                  className={`relative h-7 w-7 sm:h-6 sm:w-6 rounded-full flex items-center justify-center text-[11px] sm:text-[10px] font-black num ${
                    done
                      ? "bg-emerald-500 text-black"
                      : active
                        ? "bg-black text-white"
                        : "bg-white/10 text-white/60"
                  }`}
                >
                  {done ? <Check className="h-4 w-4 sm:h-3.5 sm:w-3.5" strokeWidth={3} /> : i + 1}
                  {!done && pct > 0 && (
                    <svg
                      viewBox="0 0 24 24"
                      className="absolute inset-0 -rotate-90"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        fill="none"
                        stroke={active ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.7)"}
                        strokeWidth="2"
                        strokeDasharray={2 * Math.PI * 10}
                        strokeDashoffset={(2 * Math.PI * 10) * (1 - pct / 100)}
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                </span>
                <span className="max-w-[8rem] truncate">
                  {shortName(e.name)}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function shortName(s: string) {
  // "Overhead Triceps Extension" → "Overhead Tri Ext"
  return s
    .replace(/Extension/i, "Ext")
    .replace(/\(.*?\)/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
