export type Day = "push" | "pull" | "legs" | "rest";

export const WEEK: Day[] = [
  "rest", // Sun
  "push", // Mon
  "legs", // Tue
  "pull", // Wed
  "push", // Thu
  "legs", // Fri
  "pull", // Sat
];

export const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function todayDay(): Day {
  return WEEK[new Date().getDay()];
}

export function todayName(): string {
  return DAY_NAMES[new Date().getDay()];
}

export const DAY_LABEL: Record<Day, string> = {
  push: "Push",
  pull: "Pull",
  legs: "Legs",
  rest: "Rest",
};

export const DAY_ACCENT: Record<Day, string> = {
  push: "from-rose-500 to-orange-500",
  pull: "from-sky-500 to-indigo-500",
  legs: "from-emerald-500 to-lime-500",
  rest: "from-zinc-500 to-zinc-700",
};
