"use client";

import { useEffect, useState } from "react";

export function SessionStats({
  startedAt,
  setsCount,
  totalSets,
  volumeKg,
}: {
  startedAt: string;
  setsCount: number;
  totalSets: number;
  volumeKg: number;
}) {
  const [elapsed, setElapsed] = useState(() =>
    Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000)),
  );

  useEffect(() => {
    const id = setInterval(
      () =>
        setElapsed(
          Math.max(
            0,
            Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000),
          ),
        ),
      1000,
    );
    return () => clearInterval(id);
  }, [startedAt]);

  const pct = totalSets > 0 ? Math.min(100, (setsCount / totalSets) * 100) : 0;
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;

  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-3 sm:p-4">
      <div className="flex items-end justify-between gap-2 sm:gap-4">
        <Stat label="Sets" value={`${setsCount}`} sub={`of ${totalSets}`} />
        <Stat
          label="Volume"
          value={
            volumeKg >= 1000
              ? `${(volumeKg / 1000).toFixed(1)}t`
              : `${Math.round(volumeKg)}`
          }
          sub={volumeKg >= 1000 ? "tonnes" : "kg"}
        />
        <Stat
          label="Time"
          value={`${mins}:${String(secs).padStart(2, "0")}`}
          sub="elapsed"
        />
      </div>
      <div className="mt-3 h-1 rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-400 to-lime-400 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex-1 min-w-0">
      <div className="text-[10px] uppercase tracking-wider text-white/40 font-semibold truncate">
        {label}
      </div>
      <div className="mt-0.5 text-xl sm:text-2xl font-black leading-none num truncate">
        {value}
      </div>
      {sub && (
        <div className="mt-0.5 text-[11px] text-white/40 num truncate">
          {sub}
        </div>
      )}
    </div>
  );
}
