-- CreateEnum
CREATE TYPE "Day" AS ENUM ('push', 'pull', 'legs');

-- CreateTable
CREATE TABLE "exercises" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "day" "Day" NOT NULL,
    "target_sets" INTEGER NOT NULL DEFAULT 4,
    "target_reps" TEXT NOT NULL DEFAULT '8-12',
    "notes" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workout_sessions" (
    "id" UUID NOT NULL,
    "day" "Day" NOT NULL,
    "started_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMPTZ(6),
    "notes" TEXT,

    CONSTRAINT "workout_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sets" (
    "id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "exercise_id" UUID NOT NULL,
    "set_number" INTEGER NOT NULL,
    "reps" INTEGER,
    "weight_kg" DECIMAL(6,2),
    "rpe" INTEGER,
    "completed_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "exercises_day_sort_order_idx" ON "exercises"("day", "sort_order");

-- CreateIndex
CREATE INDEX "workout_sessions_started_at_idx" ON "workout_sessions"("started_at" DESC);

-- CreateIndex
CREATE INDEX "workout_sessions_day_completed_at_idx" ON "workout_sessions"("day", "completed_at");

-- CreateIndex
CREATE INDEX "sets_session_id_idx" ON "sets"("session_id");

-- CreateIndex
CREATE INDEX "sets_exercise_id_idx" ON "sets"("exercise_id");

-- AddForeignKey
ALTER TABLE "sets" ADD CONSTRAINT "sets_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "workout_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sets" ADD CONSTRAINT "sets_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;
