"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { Day as PrismaDay } from "@prisma/client";
import type { Trainable } from "@/lib/types";

export async function startSession(day: Trainable) {
  const s = await prisma.workoutSession.create({
    data: { day: day as PrismaDay },
    select: { id: true },
  });
  revalidatePath(`/workout/${day}`);
  revalidatePath("/");
  return s.id;
}

export async function finishSession(sessionId: string, day: Trainable) {
  await prisma.workoutSession.update({
    where: { id: sessionId },
    data: { completedAt: new Date() },
  });
  revalidatePath(`/workout/${day}`);
  revalidatePath("/");
  revalidatePath("/history");
}

export async function logSet(input: {
  sessionId: string;
  exerciseId: string;
  setNumber: number;
  reps: number | null;
  weightKg: number | null;
  rpe: number | null;
  day: Trainable;
}) {
  await prisma.workoutSet.create({
    data: {
      sessionId: input.sessionId,
      exerciseId: input.exerciseId,
      setNumber: input.setNumber,
      reps: input.reps,
      weightKg: input.weightKg ?? undefined,
      rpe: input.rpe,
    },
  });
  revalidatePath(`/workout/${input.day}`);
}

export async function editSet(input: {
  setId: string;
  reps: number | null;
  weightKg: number | null;
  rpe: number | null;
  day: Trainable;
}) {
  await prisma.workoutSet.update({
    where: { id: input.setId },
    data: {
      reps: input.reps,
      weightKg: input.weightKg ?? null,
      rpe: input.rpe,
    },
  });
  revalidatePath(`/workout/${input.day}`);
}

export async function deleteSet(setId: string, day: Trainable) {
  await prisma.workoutSet.delete({ where: { id: setId } });
  revalidatePath(`/workout/${day}`);
}

export async function deleteSession(sessionId: string) {
  await prisma.workoutSession.delete({ where: { id: sessionId } });
  revalidatePath("/history");
  revalidatePath("/");
}
