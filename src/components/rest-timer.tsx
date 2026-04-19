"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, SkipForward } from "lucide-react";

type Props = {
  seconds: number;
  onDone: () => void;
};

// Auto-dismiss N ms after hitting 0 so user doesn't have to tap Skip
const AUTO_DISMISS_MS = 2500;

export function RestTimer({ seconds, onDone }: Props) {
  const [remaining, setRemaining] = useState(seconds);
  const [total, setTotal] = useState(seconds);
  const firedRef = useRef(false);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (remaining > 0) {
      const id = setInterval(() => setRemaining((r) => r - 1), 1000);
      return () => clearInterval(id);
    }
    if (!firedRef.current) {
      firedRef.current = true;
      vibrate();
      dismissTimerRef.current = setTimeout(() => {
        onDone();
      }, AUTO_DISMISS_MS);
    }
  }, [remaining, onDone]);

  useEffect(() => {
    return () => {
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    };
  }, []);

  const mm = Math.max(0, Math.floor(remaining / 60));
  const ss = Math.max(0, remaining % 60);
  const pct = Math.max(0, Math.min(1, remaining / total));
  const C = 2 * Math.PI * 42;
  const overtime = remaining <= 0;

  return (
    <div
      className={`rounded-2xl p-4 transition-colors ${
        overtime
          ? "bg-emerald-500/10 border border-emerald-400/40"
          : "bg-white/5 border border-white/10"
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="relative h-20 w-20 shrink-0">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="7"
            />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke={overtime ? "rgb(74, 222, 128)" : "white"}
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={C * (1 - pct)}
              style={{ transition: "stroke-dashoffset 1s linear" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="num text-xl font-black leading-none tabular-nums">
              {overtime ? "GO" : `${mm}:${String(ss).padStart(2, "0")}`}
            </div>
            {!overtime && (
              <div className="text-[9px] text-white/40 uppercase tracking-wider mt-0.5">
                Rest
              </div>
            )}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold">
            {overtime ? "Back to it." : "Breathe. Recover."}
          </div>
          <div className="text-xs text-white/50 mt-0.5">
            {overtime
              ? "Auto-closing…"
              : `Target: ${Math.round(total / 60)}:${String(total % 60).padStart(2, "0")}`}
          </div>
          <div className="mt-2 flex gap-1.5">
            <button
              onClick={() => {
                setRemaining((r) => r + 15);
                setTotal((t) => t + 15);
              }}
              disabled={overtime}
              className="inline-flex items-center gap-1 px-2.5 h-8 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-40 text-xs font-medium"
            >
              <Plus className="h-3 w-3" /> 15s
            </button>
            <button
              onClick={onDone}
              className="inline-flex items-center gap-1 px-2.5 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium"
            >
              <SkipForward className="h-3 w-3" /> Skip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function vibrate() {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.([80, 50, 80]);
    }
  } catch {}
}
