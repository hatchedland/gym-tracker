import { notFound } from "next/navigation";
import { WorkoutView } from "@/components/workout-view";
import { DAY_LABEL } from "@/lib/schedule";

export const dynamic = "force-dynamic";

const VALID = ["push", "pull", "legs"] as const;
type Trainable = (typeof VALID)[number];

export default async function DayPage({
  params,
}: {
  params: Promise<{ day: string }>;
}) {
  const { day } = await params;
  if (!VALID.includes(day as Trainable)) notFound();
  const d = day as Trainable;
  return (
    <WorkoutView
      day={d}
      heading={DAY_LABEL[d].toUpperCase()}
      subheading={`${DAY_LABEL[d]} day`}
    />
  );
}
