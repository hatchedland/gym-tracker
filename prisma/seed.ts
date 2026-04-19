import { PrismaClient, Day } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

type Seed = {
  name: string;
  day: Day;
  targetSets: number;
  targetReps: string;
  notes: string;
  sortOrder: number;
};

const EXERCISES: Seed[] = [
  { day: Day.push, sortOrder: 1, name: "Incline Bench Press", targetSets: 4, targetReps: "6-10", notes: "Upper chest focus. Stop 1-2 reps shy of failure." },
  { day: Day.push, sortOrder: 2, name: "Chest Press (Machine)", targetSets: 5, targetReps: "8-12", notes: "Full stretch, controlled eccentric." },
  { day: Day.push, sortOrder: 3, name: "Overhead Triceps Extension", targetSets: 4, targetReps: "10-15", notes: "Rope or dumbbell — deep stretch." },
  { day: Day.push, sortOrder: 4, name: "Lateral Raises", targetSets: 6, targetReps: "12-20", notes: "Slow reps, no momentum. Cavill territory." },
  { day: Day.push, sortOrder: 5, name: "Triceps Push Down", targetSets: 4, targetReps: "10-15", notes: "Squeeze at lockout." },

  { day: Day.pull, sortOrder: 1, name: "Lat Pull Down", targetSets: 4, targetReps: "8-12", notes: "Wide grip. Drive elbows down, not back." },
  { day: Day.pull, sortOrder: 2, name: "Machine Row", targetSets: 4, targetReps: "8-12", notes: "Same machine — switch attachment." },
  { day: Day.pull, sortOrder: 3, name: "Rope Pull Down (Straight-arm)", targetSets: 3, targetReps: "12-15", notes: "Lat isolation." },
  { day: Day.pull, sortOrder: 4, name: "Reverse Rear Delt (Face Pull)", targetSets: 4, targetReps: "12-20", notes: "Shoulder health + rear delt width." },
  { day: Day.pull, sortOrder: 5, name: "Bicep Curl", targetSets: 4, targetReps: "8-12", notes: "Dumbbell or EZ bar." },

  { day: Day.legs, sortOrder: 1, name: "Seated Hamstring Curl", targetSets: 5, targetReps: "10-15", notes: "Pause at full contraction." },
  { day: Day.legs, sortOrder: 2, name: "Leg Press", targetSets: 5, targetReps: "8-12", notes: "Feet high = glute/ham. Feet low = quad." },
  { day: Day.legs, sortOrder: 3, name: "Calves (Bodyweight / Machine)", targetSets: 4, targetReps: "12-20", notes: "Full stretch, full contraction." },
  { day: Day.legs, sortOrder: 4, name: "Overhead Press (Dumbbell)", targetSets: 4, targetReps: "6-10", notes: "Yes, on leg day — hits shoulders fresh." },
  { day: Day.legs, sortOrder: 5, name: "Leg Extension", targetSets: 4, targetReps: "10-15", notes: "Quad finisher. 1s pause at top." },
];

async function main() {
  for (const e of EXERCISES) {
    const existing = await prisma.exercise.findFirst({
      where: { day: e.day, name: e.name },
    });
    if (existing) continue;
    await prisma.exercise.create({ data: e });
  }
  const count = await prisma.exercise.count();
  console.log(`Seeded. ${count} exercises total.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
