"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Check, Pencil, Trash2, X } from "lucide-react";
import type { ExerciseDTO, WorkoutSetDTO } from "@/lib/types";
import { deleteSet, editSet, logSet } from "@/app/actions";
import { RestTimer } from "./rest-timer";
import { Sparkline } from "./sparkline";
import { WheelPicker, makeRange } from "./wheel-picker";
import type { ProgressionPoint } from "@/lib/workout-data";

type Props = {
  sessionId: string;
  exercise: ExerciseDTO;
  sets: WorkoutSetDTO[];
  lastSessionBest: { weight: number | null; reps: number | null } | null;
  progression: ProgressionPoint[];
};

const RPE_OPTIONS = [6, 7, 8, 9, 10];
const WEIGHT_VALUES = makeRange(0, 300, 2.5);
const REP_VALUES = makeRange(0, 40, 1);

export function SetLogger({
  sessionId,
  exercise,
  sets,
  lastSessionBest,
  progression,
}: Props) {
  const [pending, startTransition] = useTransition();
  const [restKey, setRestKey] = useState<string | null>(null);
  const [editingSetId, setEditingSetId] = useState<string | null>(null);
  const [prFlashId, setPrFlashId] = useState<string | null>(null);
  const cardRef = useRef<HTMLElement | null>(null);

  const lastLogged = sets[sets.length - 1];
  const editingSet = editingSetId
    ? sets.find((s) => s.id === editingSetId)
    : undefined;

  // Seed the steppers: if editing, from that set; else from last-logged; else last session's best
  const seedWeight =
    editingSet?.weight_kg ??
    lastLogged?.weight_kg ??
    lastSessionBest?.weight ??
    null;
  const seedReps =
    editingSet?.reps ?? lastLogged?.reps ?? lastSessionBest?.reps ?? null;
  const seedRpe = editingSet?.rpe ?? null;

  const [weight, setWeight] = useState<number | null>(seedWeight);
  const [reps, setReps] = useState<number | null>(seedReps);
  const [rpe, setRpe] = useState<number | null>(seedRpe);

  // Re-seed on editing target change
  useEffect(() => {
    if (editingSet) {
      setWeight(editingSet.weight_kg);
      setReps(editingSet.reps);
      setRpe(editingSet.rpe);
    } else {
      setWeight(lastLogged?.weight_kg ?? lastSessionBest?.weight ?? null);
      setReps(lastLogged?.reps ?? lastSessionBest?.reps ?? null);
      setRpe(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingSetId, sets.length]);

  const nextSetNumber = (lastLogged?.set_number ?? 0) + 1;
  const completed = sets.length;
  const target = exercise.target_sets;
  const done = completed >= target;
  const pct = Math.min(100, (completed / target) * 100);
  const suggestedRestSec = exercise.sort_order <= 2 ? 120 : 75;

  const lastBestScore =
    (lastSessionBest?.weight ?? 0) * 1000 + (lastSessionBest?.reps ?? 0);

  const currentTopWeight = useMemo(() => {
    let top = 0;
    for (const s of sets) {
      const w = s.weight_kg ?? 0;
      if (w > top) top = w;
    }
    return top > 0 ? top : null;
  }, [sets]);

  const submit = () => {
    if (reps == null && weight == null) return;
    if (editingSetId) {
      const id = editingSetId;
      startTransition(async () => {
        await editSet({
          setId: id,
          reps,
          weightKg: weight,
          rpe,
          day: exercise.day,
        });
        setEditingSetId(null);
      });
      return;
    }
    const thisScore = (weight ?? 0) * 1000 + (reps ?? 0);
    const isPR = lastBestScore > 0 && thisScore > lastBestScore;
    const prFlashKey = `pr-${Date.now()}`;

    startTransition(async () => {
      await logSet({
        sessionId,
        exerciseId: exercise.id,
        setNumber: nextSetNumber,
        reps,
        weightKg: weight,
        rpe,
        day: exercise.day,
      });
      setRpe(null);
      setRestKey(`rest-${Date.now()}`);
      if (isPR) {
        setPrFlashId(prFlashKey);
        window.setTimeout(() => setPrFlashId(null), 2500);
      }
    });
  };

  const remove = (setId: string) => {
    startTransition(async () => {
      await deleteSet(setId, exercise.day);
      if (editingSetId === setId) setEditingSetId(null);
    });
  };

  // Auto-scroll into view when this exercise becomes the next one to work on
  const wasIncompleteRef = useRef(done);
  useEffect(() => {
    if (done && !wasIncompleteRef.current) {
      // just completed — trigger a hash event for the workout-view to focus the next one
      window.dispatchEvent(
        new CustomEvent("exercise-complete", {
          detail: { exerciseId: exercise.id },
        }),
      );
    }
    wasIncompleteRef.current = done;
  }, [done, exercise.id]);

  const primaryLabel = editingSetId
    ? "Save edit"
    : `Log set ${nextSetNumber}`;
  const valueSummary =
    weight != null && reps != null
      ? `${weight}kg × ${reps}`
      : weight != null
        ? `${weight}kg`
        : reps != null
          ? `${reps} reps`
          : "";

  return (
    <article
      ref={cardRef}
      id={`exercise-${exercise.id}`}
      className={`scroll-mt-24 rounded-3xl border bg-white/[0.02] overflow-hidden transition-colors ${
        done
          ? "border-emerald-500/30 bg-emerald-500/[0.03]"
          : "border-white/10"
      }`}
    >
      {/* Header */}
      <header className="px-4 sm:px-5 pt-4 sm:pt-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-base sm:text-lg leading-tight tracking-tight">
              {exercise.name}
            </h3>
            <div className="mt-1 text-xs text-white/50">
              Target: <span className="num text-white/70">{target}</span> ×{" "}
              <span className="num text-white/70">{exercise.target_reps}</span>
            </div>
          </div>
          <ProgressPie done={completed} total={target} />
        </div>

        {progression.length > 0 && (
          <div className="mt-3">
            <Sparkline
              points={progression}
              currentTopWeight={currentTopWeight}
            />
          </div>
        )}

        <div className="mt-3 h-1 rounded-full bg-white/5 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              done
                ? "bg-gradient-to-r from-emerald-400 to-lime-400"
                : "bg-gradient-to-r from-white to-white/60"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </header>

      {/* Logged sets as chips */}
      {sets.length > 0 && (
        <div className="px-4 sm:px-5 pb-3 flex flex-wrap gap-1.5">
          {sets.map((s) => (
            <SetChip
              key={s.id}
              set={s}
              editing={editingSetId === s.id}
              flashPr={prFlashId != null && s.id === lastLogged?.id}
              onEdit={() =>
                setEditingSetId(editingSetId === s.id ? null : s.id)
              }
              onDelete={() => remove(s.id)}
            />
          ))}
        </div>
      )}

      {/* Rest timer — auto-dismisses after expiry */}
      {restKey && !editingSetId && (
        <div className="px-4 sm:px-5 pb-4">
          <RestTimer
            key={restKey}
            seconds={suggestedRestSec}
            onDone={() => setRestKey(null)}
          />
        </div>
      )}

      {/* Inputs — ALWAYS visible. One tap = one set. */}
      <div className="px-4 sm:px-5 pb-5 pt-1 space-y-3">
        {editingSetId && (
          <div className="flex items-center gap-2 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
            <Pencil className="h-3.5 w-3.5" />
            <span className="font-medium">
              Editing set #{editingSet?.set_number}
            </span>
            <button
              onClick={() => setEditingSetId(null)}
              className="ml-auto text-white/50 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <WheelPicker
            label="Weight"
            unit="kg"
            values={WEIGHT_VALUES}
            value={weight}
            onChange={setWeight}
            format={(n) => (Number.isInteger(n) ? String(n) : n.toFixed(1))}
          />
          <WheelPicker
            label="Reps"
            values={REP_VALUES}
            value={reps}
            onChange={setReps}
          />
        </div>

        <div className="flex gap-1">
          {RPE_OPTIONS.map((r) => (
            <button
              key={r}
              onClick={() => setRpe(rpe === r ? null : r)}
              className={`flex-1 h-11 rounded-lg text-sm font-bold num transition active:scale-95 ${
                rpe === r
                  ? r >= 9
                    ? "bg-rose-500 text-white"
                    : r === 8
                      ? "bg-emerald-500 text-black"
                      : "bg-white text-black"
                  : "bg-white/5 text-white/50 hover:bg-white/10"
              }`}
            >
              @{r}
            </button>
          ))}
        </div>

        <button
          onClick={submit}
          disabled={pending || (reps == null && weight == null)}
          className={`w-full h-14 rounded-xl font-bold text-base active:scale-[0.98] transition disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 ${
            editingSetId
              ? "bg-amber-400 text-black"
              : done
                ? "bg-white/10 text-white hover:bg-white/15"
                : "bg-white text-black shadow-lg shadow-white/5"
          }`}
        >
          <Check className="h-5 w-5" strokeWidth={3} />
          <span>
            {pending ? "Saving…" : primaryLabel}
            {valueSummary && (
              <span
                className={`ml-2 num font-black ${editingSetId ? "text-black/70" : done ? "text-white/60" : "text-black/60"}`}
              >
                {valueSummary}
              </span>
            )}
          </span>
        </button>
      </div>
    </article>
  );
}

function SetChip({
  set,
  editing,
  flashPr,
  onEdit,
  onDelete,
}: {
  set: WorkoutSetDTO;
  editing: boolean;
  flashPr?: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={`group relative inline-flex items-center gap-1.5 rounded-full pl-2.5 pr-1 h-9 text-sm transition ${
        editing
          ? "bg-amber-400/20 ring-1 ring-amber-400/60"
          : flashPr
            ? "bg-emerald-400/20 ring-1 ring-emerald-400 animate-pulse"
            : "bg-white/[0.06] hover:bg-white/[0.09]"
      }`}
    >
      <button onClick={onEdit} className="flex items-center gap-1.5">
        <span className="text-[10px] text-white/50 font-bold num">
          #{set.set_number}
        </span>
        <span className="num font-semibold">{set.weight_kg ?? "–"}</span>
        <span className="text-white/40 text-xs">kg</span>
        <span className="text-white/30 mx-0.5">×</span>
        <span className="num font-semibold">{set.reps ?? "–"}</span>
        {set.rpe != null && (
          <span
            className={`ml-1 px-1.5 rounded-full text-[10px] font-bold num ${
              set.rpe >= 9
                ? "bg-rose-500/25 text-rose-200"
                : set.rpe === 8
                  ? "bg-emerald-500/25 text-emerald-200"
                  : "bg-white/10 text-white/60"
            }`}
          >
            @{set.rpe}
          </span>
        )}
        {flashPr && (
          <span className="ml-1 px-1.5 rounded-full text-[10px] font-black bg-emerald-400 text-black">
            PR
          </span>
        )}
      </button>
      <button
        onClick={onDelete}
        aria-label="Delete set"
        className="ml-0.5 h-7 w-7 rounded-full flex items-center justify-center text-white/30 hover:text-rose-400 hover:bg-rose-500/10"
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  );
}

function ProgressPie({ done, total }: { done: number; total: number }) {
  const pct = total > 0 ? done / total : 0;
  const C = 2 * Math.PI * 18;
  const complete = done >= total;
  return (
    <div className="relative h-14 w-14 shrink-0">
      <svg viewBox="0 0 44 44" className="h-full w-full -rotate-90">
        <circle
          cx="22"
          cy="22"
          r="18"
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth="4"
        />
        <circle
          cx="22"
          cy="22"
          r="18"
          fill="none"
          stroke={complete ? "rgb(74,222,128)" : "white"}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - pct)}
          style={{ transition: "stroke-dashoffset 400ms ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {complete ? (
          <Check className="h-5 w-5 text-emerald-400" strokeWidth={3} />
        ) : (
          <span className="num text-xs font-bold">
            {done}
            <span className="text-white/30">/{total}</span>
          </span>
        )}
      </div>
    </div>
  );
}

