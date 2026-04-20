import { prisma } from "./prisma";
import { DAY_NAMES, WEEK, type Day } from "./schedule";

export type WeekDot = {
  index: number; // 0 (Sun) - 6 (Sat)
  letter: string;
  planned: Day;
  trained: boolean;
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
};

/** Monday-anchored week that wraps a reference date.
 *  Returns 7 dots from Mon → Sun with `trained` true if a completed
 *  session exists on that calendar date. */
export async function getWeekSummary(
  userId: string,
  ref: Date = new Date(),
): Promise<WeekDot[]> {
  const monday = startOfMonday(ref);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 7);

  const sessions = await prisma.workoutSession.findMany({
    where: {
      userId,
      startedAt: { gte: monday, lt: sunday },
    },
    select: { startedAt: true, completedAt: true },
  });

  const trainedYMDs = new Set(
    sessions
      .filter((s) => s.completedAt != null)
      .map((s) => ymd(s.startedAt)),
  );

  const todayYMD = ymd(ref);
  const refYMD = todayYMD;

  const dots: WeekDot[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dow = d.getDay();
    const key = ymd(d);
    dots.push({
      index: dow,
      letter: DAY_NAMES[dow][0],
      planned: WEEK[dow],
      trained: trainedYMDs.has(key),
      isToday: key === todayYMD,
      isPast: key < refYMD,
      isFuture: key > refYMD,
    });
  }
  return dots;
}

export async function getStreak(userId: string): Promise<number> {
  // Count consecutive days back from today where: either today trained OR it was a planned rest day. Gap on a trainable day that wasn't completed ends the streak.
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const horizon = new Date(today);
  horizon.setDate(today.getDate() - 120);

  const sessions = await prisma.workoutSession.findMany({
    where: { userId, completedAt: { not: null, gte: horizon } },
    select: { startedAt: true },
  });
  const trained = new Set(sessions.map((s) => ymd(s.startedAt)));

  let streak = 0;
  for (let i = 0; i < 120; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const planned = WEEK[d.getDay()];
    const key = ymd(d);
    if (planned === "rest") {
      streak++;
      continue;
    }
    if (trained.has(key)) {
      streak++;
      continue;
    }
    // today is allowed to be "not yet trained" without breaking the streak
    if (i === 0) continue;
    break;
  }
  return streak;
}

function startOfMonday(d: Date) {
  const m = new Date(d);
  m.setHours(0, 0, 0, 0);
  const dow = m.getDay(); // 0 = Sun
  const delta = dow === 0 ? -6 : 1 - dow;
  m.setDate(m.getDate() + delta);
  return m;
}

function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
