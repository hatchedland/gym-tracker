import { prisma } from "./prisma";
import type {
  ExerciseDTO,
  Trainable,
  WorkoutSessionDTO,
  WorkoutSetDTO,
} from "./types";
import type { Day as PrismaDay } from "@prisma/client";

export type ProgressionPoint = {
  sessionId: string;
  at: string; // ISO
  topWeight: number;
  topReps: number;
};

export async function getExercises(day: Trainable): Promise<ExerciseDTO[]> {
  const rows = await prisma.exercise.findMany({
    where: { day: day as PrismaDay },
    orderBy: { sortOrder: "asc" },
  });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    day: r.day as Trainable,
    target_sets: r.targetSets,
    target_reps: r.targetReps,
    notes: r.notes,
    sort_order: r.sortOrder,
  }));
}

export async function getActiveSession(
  day: Trainable,
): Promise<WorkoutSessionDTO | null> {
  const row = await prisma.workoutSession.findFirst({
    where: { day: day as PrismaDay, completedAt: null },
    orderBy: { startedAt: "desc" },
  });
  if (!row) return null;
  return {
    id: row.id,
    day: row.day as Trainable,
    started_at: row.startedAt.toISOString(),
    completed_at: row.completedAt?.toISOString() ?? null,
  };
}

export async function getSetsForSession(
  sessionId: string,
): Promise<WorkoutSetDTO[]> {
  const rows = await prisma.workoutSet.findMany({
    where: { sessionId },
    orderBy: [{ exerciseId: "asc" }, { setNumber: "asc" }],
  });
  return rows.map((s) => ({
    id: s.id,
    session_id: s.sessionId,
    exercise_id: s.exerciseId,
    set_number: s.setNumber,
    reps: s.reps,
    weight_kg: s.weightKg ? Number(s.weightKg) : null,
    rpe: s.rpe,
  }));
}

/** Best (heaviest × most reps) set per exercise from the most recent completed session of that day. */
export async function getLastBests(
  day: Trainable,
  exerciseIds: string[],
  excludeSessionId: string | null,
): Promise<Map<string, { weight: number | null; reps: number | null }>> {
  const map = new Map<string, { weight: number | null; reps: number | null }>();
  if (exerciseIds.length === 0) return map;

  const lastSession = await prisma.workoutSession.findFirst({
    where: {
      day: day as PrismaDay,
      completedAt: { not: null },
      ...(excludeSessionId ? { NOT: { id: excludeSessionId } } : {}),
    },
    orderBy: { completedAt: "desc" },
  });
  if (!lastSession) return map;

  const sets = await prisma.workoutSet.findMany({
    where: {
      sessionId: lastSession.id,
      exerciseId: { in: exerciseIds },
    },
  });

  for (const s of sets) {
    const existing = map.get(s.exerciseId);
    const weight = s.weightKg ? Number(s.weightKg) : 0;
    const reps = s.reps ?? 0;
    const score = weight * 1000 + reps;
    const existingScore =
      (existing?.weight ?? 0) * 1000 + (existing?.reps ?? 0);
    if (!existing || score > existingScore) {
      map.set(s.exerciseId, {
        weight: s.weightKg ? Number(s.weightKg) : null,
        reps: s.reps,
      });
    }
  }
  return map;
}

/** Top set (heaviest weight, breaking ties by reps) for each of the last N
 *  completed sessions for a given exercise. Returns oldest → newest. */
export async function getProgression(
  exerciseId: string,
  limit = 6,
): Promise<ProgressionPoint[]> {
  const sessions = await prisma.workoutSession.findMany({
    where: {
      completedAt: { not: null },
      sets: { some: { exerciseId } },
    },
    orderBy: { completedAt: "desc" },
    take: limit,
    include: {
      sets: {
        where: { exerciseId },
        select: { weightKg: true, reps: true },
      },
    },
  });

  const out: ProgressionPoint[] = [];
  for (const s of sessions) {
    let top: { w: number; r: number } | null = null;
    for (const st of s.sets) {
      const w = st.weightKg ? Number(st.weightKg) : 0;
      const r = st.reps ?? 0;
      if (!top || w > top.w || (w === top.w && r > top.r)) top = { w, r };
    }
    if (!top) continue;
    out.push({
      sessionId: s.id,
      at: (s.completedAt ?? s.startedAt).toISOString(),
      topWeight: top.w,
      topReps: top.r,
    });
  }
  return out.reverse();
}
