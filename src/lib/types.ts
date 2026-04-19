import type { Day as PrismaDay } from "@prisma/client";
import type { Day } from "./schedule";

export type Trainable = Exclude<Day, "rest">;

export type ExerciseDTO = {
  id: string;
  name: string;
  day: Trainable;
  target_sets: number;
  target_reps: string;
  notes: string | null;
  sort_order: number;
};

export type WorkoutSetDTO = {
  id: string;
  session_id: string;
  exercise_id: string;
  set_number: number;
  reps: number | null;
  weight_kg: number | null;
  rpe: number | null;
};

export type WorkoutSessionDTO = {
  id: string;
  day: Trainable;
  started_at: string;
  completed_at: string | null;
};

export const toTrainable = (d: PrismaDay): Trainable => d as Trainable;
