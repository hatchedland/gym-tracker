// One-shot: insert a few completed historical sessions so the UI has something to show.
// Run once with: npx tsx prisma/demo.ts
import { PrismaClient, Day } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const now = new Date();

  const plans: Array<{ day: Day; daysAgo: number; durationMin: number }> = [
    { day: Day.pull, daysAgo: 8, durationMin: 58 },
    { day: Day.legs, daysAgo: 6, durationMin: 72 },
    { day: Day.push, daysAgo: 5, durationMin: 63 },
    { day: Day.pull, daysAgo: 3, durationMin: 55 },
    { day: Day.push, daysAgo: 2, durationMin: 61 },
    { day: Day.legs, daysAgo: 1, durationMin: 70 },
  ];

  for (const p of plans) {
    const started = new Date(now);
    started.setDate(now.getDate() - p.daysAgo);
    started.setHours(7, 30, 0, 0);
    const completed = new Date(started.getTime() + p.durationMin * 60_000);

    const exercises = await prisma.exercise.findMany({
      where: { day: p.day },
      orderBy: { sortOrder: "asc" },
    });

    const session = await prisma.workoutSession.create({
      data: { day: p.day, startedAt: started, completedAt: completed },
    });

    for (const ex of exercises) {
      const base = 40 + Math.round(Math.random() * 30);
      const setCount = ex.targetSets;
      for (let i = 1; i <= setCount; i++) {
        const weight = base + (i - 1) * 2.5;
        const reps = 10 - Math.max(0, i - 2);
        await prisma.workoutSet.create({
          data: {
            sessionId: session.id,
            exerciseId: ex.id,
            setNumber: i,
            weightKg: weight,
            reps,
            rpe: 7 + Math.min(2, i - 1),
            completedAt: new Date(started.getTime() + i * 90_000),
          },
        });
      }
    }
  }

  console.log("Inserted demo history.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
