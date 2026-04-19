import { Flame } from "lucide-react";
import {
  getActiveSession,
  getExercises,
  getLastBests,
  getProgression,
  getSetsForSession,
} from "@/lib/workout-data";
import { getWeekSummary } from "@/lib/week-data";
import type { Day } from "@/lib/schedule";
import { DAY_LABEL } from "@/lib/schedule";
import { SetLogger } from "./set-logger";
import { FinishButton, StartButton } from "./session-controls";
import { WorkoutHero } from "./workout-hero";
import { SessionStats } from "./session-stats";
import { ExerciseNav } from "./exercise-nav";
import { Sparkline } from "./sparkline";

type Trainable = Exclude<Day, "rest">;

export async function WorkoutView({
  day,
  heading,
  subheading,
}: {
  day: Trainable;
  heading: string;
  subheading?: string;
}) {
  const [exercises, session, weekDots] = await Promise.all([
    getExercises(day),
    getActiveSession(day),
    getWeekSummary(),
  ]);

  const [sets, lastBests, progressions] = await Promise.all([
    session ? getSetsForSession(session.id) : Promise.resolve([]),
    getLastBests(day, exercises.map((e) => e.id), session?.id ?? null),
    Promise.all(exercises.map((e) => getProgression(e.id, 6))).then(
      (arr) => new Map(exercises.map((e, i) => [e.id, arr[i]])),
    ),
  ]);

  const setsByExercise = new Map<string, typeof sets>();
  for (const s of sets) {
    const list = setsByExercise.get(s.exercise_id) ?? [];
    list.push(s);
    setsByExercise.set(s.exercise_id, list);
  }

  const setsCountById: Record<string, number> = {};
  for (const e of exercises)
    setsCountById[e.id] = setsByExercise.get(e.id)?.length ?? 0;

  const totalSets = sets.length;
  const targetSets = exercises.reduce((a, e) => a + e.target_sets, 0);
  const volume = sets.reduce(
    (sum, s) => sum + (s.weight_kg ?? 0) * (s.reps ?? 0),
    0,
  );

  return (
    <div className="space-y-5">
      <WorkoutHero
        day={day}
        heading={heading}
        subheading={subheading}
        weekDots={weekDots}
        sessionLive={!!session}
      />

      {session && (
        <SessionStats
          startedAt={session.started_at}
          setsCount={totalSets}
          totalSets={targetSets}
          volumeKg={volume}
        />
      )}

      {!session ? (
        <div className="space-y-4">
          <StartButton day={day} />
          <PrepList
            exercises={exercises}
            lastBests={lastBests}
            progressions={progressions}
          />
        </div>
      ) : (
        <>
          <ExerciseNav
            exercises={exercises}
            setsByExerciseId={setsCountById}
          />
          <div className="space-y-3">
            {exercises.map((ex) => (
              <SetLogger
                key={ex.id}
                sessionId={session.id}
                exercise={ex}
                sets={setsByExercise.get(ex.id) ?? []}
                lastSessionBest={lastBests.get(ex.id) ?? null}
                progression={progressions.get(ex.id) ?? []}
              />
            ))}
            <FinishButton sessionId={session.id} day={day} />
          </div>
        </>
      )}
    </div>
  );
}

function PrepList({
  exercises,
  lastBests,
  progressions,
}: {
  exercises: Awaited<ReturnType<typeof getExercises>>;
  lastBests: Map<string, { weight: number | null; reps: number | null }>;
  progressions: Map<string, Awaited<ReturnType<typeof getProgression>>>;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-1">
        <Flame className="h-4 w-4 text-white/40" />
        <h2 className="text-xs uppercase tracking-wider text-white/40 font-bold">
          Today&apos;s lineup
        </h2>
      </div>
      <ul className="rounded-2xl border border-white/10 bg-white/[0.02] divide-y divide-white/5 overflow-hidden">
        {exercises.map((e, i) => {
          const best = lastBests.get(e.id);
          const prog = progressions.get(e.id) ?? [];
          return (
            <li key={e.id} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4">
              <span className="h-7 w-7 shrink-0 rounded-full bg-white/5 flex items-center justify-center num text-xs font-bold text-white/50">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold leading-tight truncate text-sm sm:text-base">
                  {e.name}
                </div>
                <div className="text-[11px] sm:text-xs text-white/45 mt-0.5 truncate">
                  <span className="num">{e.target_sets}</span> ×{" "}
                  <span className="num">{e.target_reps}</span>
                  {best?.weight != null && (
                    <>
                      <span className="mx-1.5 text-white/20">·</span>
                      <span>
                        last:{" "}
                        <span className="num text-white/60">
                          {best.weight}kg × {best.reps}
                        </span>
                      </span>
                    </>
                  )}
                </div>
              </div>
              {prog.length >= 2 && (
                <div className="hidden min-[400px]:block shrink-0">
                  <Sparkline points={prog} width={70} height={28} />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export { DAY_LABEL };
