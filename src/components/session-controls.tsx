"use client";

import { useTransition } from "react";
import { Check, Play } from "lucide-react";
import { finishSession, startSession } from "@/app/actions";
import type { Day } from "@/lib/schedule";

type Trainable = Exclude<Day, "rest">;

export function StartButton({ day }: { day: Trainable }) {
  const [pending, start] = useTransition();
  return (
    <button
      onClick={() => start(async () => void (await startSession(day)))}
      disabled={pending}
      className="w-full h-16 rounded-2xl bg-white text-black font-black text-lg shadow-2xl shadow-white/10 active:scale-[0.98] transition disabled:opacity-60 inline-flex items-center justify-center gap-2 tracking-tight"
    >
      <Play className="h-5 w-5" fill="currentColor" />
      {pending ? "Starting…" : "Start workout"}
    </button>
  );
}

export function FinishButton({
  sessionId,
  day,
}: {
  sessionId: string;
  day: Trainable;
}) {
  const [pending, start] = useTransition();
  return (
    <button
      onClick={() =>
        start(async () => void (await finishSession(sessionId, day)))
      }
      disabled={pending}
      className="w-full h-14 rounded-2xl bg-gradient-to-r from-emerald-500 to-lime-500 text-black font-bold shadow-lg shadow-emerald-500/20 active:scale-[0.99] transition disabled:opacity-60 inline-flex items-center justify-center gap-2"
    >
      <Check className="h-5 w-5" strokeWidth={3} />
      {pending ? "Finishing…" : "Finish workout"}
    </button>
  );
}
