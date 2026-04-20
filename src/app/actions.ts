"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/current-user";
import type { Day as PrismaDay } from "@prisma/client";
import type { Trainable } from "@/lib/types";

async function ownSession(userId: string, sessionId: string) {
  const s = await prisma.workoutSession.findFirst({
    where: { id: sessionId, userId },
    select: { id: true },
  });
  if (!s) throw new Error("Not found");
}

async function ownSet(userId: string, setId: string) {
  const s = await prisma.workoutSet.findFirst({
    where: { id: setId, session: { userId } },
    select: { id: true },
  });
  if (!s) throw new Error("Not found");
}

export async function startSession(day: Trainable) {
  const user = await requireUser();
  const s = await prisma.workoutSession.create({
    data: { day: day as PrismaDay, userId: user.id },
    select: { id: true },
  });
  revalidatePath(`/workout/${day}`);
  revalidatePath("/");
  return s.id;
}

export async function finishSession(sessionId: string, day: Trainable) {
  const user = await requireUser();
  await ownSession(user.id, sessionId);
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
  const user = await requireUser();
  await ownSession(user.id, input.sessionId);
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
  const user = await requireUser();
  await ownSet(user.id, input.setId);
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
  const user = await requireUser();
  await ownSet(user.id, setId);
  await prisma.workoutSet.delete({ where: { id: setId } });
  revalidatePath(`/workout/${day}`);
}

export async function deleteSession(sessionId: string) {
  const user = await requireUser();
  await ownSession(user.id, sessionId);
  await prisma.workoutSession.delete({ where: { id: sessionId } });
  revalidatePath("/history");
  revalidatePath("/");
}
