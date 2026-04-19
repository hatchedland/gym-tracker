"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

type Props = {
  label: string;
  unit?: string;
  values: number[];
  value: number | null;
  onChange: (v: number) => void;
  format?: (n: number) => string;
};

const ITEM_H = 44; // WCAG min touch target
const VISIBLE = 3; // odd — 1 center + equal above/below
const CONTAINER_H = ITEM_H * VISIBLE;
const PAD = (CONTAINER_H - ITEM_H) / 2;

/** iOS-style scroll-wheel picker.
 *  - Snap-to-center via CSS scroll-snap
 *  - Scrolling commits the centered value
 *  - External value changes animate scroll to the new index
 *  - Tap any row to jump to it
 */
export function WheelPicker({
  label,
  unit,
  values,
  value,
  onChange,
  format = (n) => String(n),
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<number | null>(null);
  const userScrollingRef = useRef(false);
  const programmaticScrollRef = useRef(false);

  const currentIndex = nearestIndex(values, value);
  const [centeredIndex, setCenteredIndex] = useState(currentIndex);

  // Jump scroll position to the provided value (no animation on initial mount)
  useLayoutEffect(() => {
    if (!ref.current) return;
    ref.current.scrollTop = currentIndex * ITEM_H;
    setCenteredIndex(currentIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Smooth-scroll when value updates externally
  useEffect(() => {
    if (!ref.current) return;
    if (userScrollingRef.current) return;
    const target = currentIndex * ITEM_H;
    if (Math.abs(ref.current.scrollTop - target) > 2) {
      programmaticScrollRef.current = true;
      ref.current.scrollTo({ top: target, behavior: "smooth" });
      setTimeout(() => (programmaticScrollRef.current = false), 400);
    }
    setCenteredIndex(currentIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  const handleScroll = useCallback(() => {
    if (!ref.current) return;
    if (programmaticScrollRef.current) return;
    userScrollingRef.current = true;
    const idx = Math.round(ref.current.scrollTop / ITEM_H);
    const clamped = Math.max(0, Math.min(values.length - 1, idx));
    if (clamped !== centeredIndex) setCenteredIndex(clamped);

    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      userScrollingRef.current = false;
      const v = values[clamped];
      if (v != null && v !== value) onChange(v);
    }, 140);
  }, [centeredIndex, onChange, value, values]);

  const jumpToIndex = (i: number) => {
    if (!ref.current) return;
    programmaticScrollRef.current = true;
    ref.current.scrollTo({ top: i * ITEM_H, behavior: "smooth" });
    setCenteredIndex(i);
    setTimeout(() => {
      programmaticScrollRef.current = false;
      const v = values[i];
      if (v != null) onChange(v);
    }, 250);
  };

  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-white/40 font-semibold mb-1.5 flex items-center justify-between">
        <span>
          {label}
          {unit && (
            <span className="normal-case ml-1 text-white/30">({unit})</span>
          )}
        </span>
        <span className="num text-white/60 font-black normal-case text-sm">
          {value != null ? format(value) : "—"}
        </span>
      </div>

      <div
        className="relative rounded-xl bg-black/60 border border-white/10 overflow-hidden"
        style={{ height: CONTAINER_H }}
      >
        {/* Selected row highlight */}
        <div
          className="absolute inset-x-2 pointer-events-none rounded-md bg-white/[0.08] border-y border-white/10"
          style={{ top: PAD, height: ITEM_H }}
        />

        <div
          ref={ref}
          onScroll={handleScroll}
          className="h-full overflow-y-scroll scrollbar-none overscroll-contain"
          style={{
            scrollSnapType: "y mandatory",
            paddingTop: PAD,
            paddingBottom: PAD,
            WebkitOverflowScrolling: "touch",
          }}
        >
          {values.map((v, i) => {
            const active = i === centeredIndex;
            const dist = Math.abs(i - centeredIndex);
            const opacity = dist === 0 ? 1 : dist === 1 ? 0.55 : 0.25;
            return (
              <button
                key={`${v}-${i}`}
                type="button"
                onClick={() => jumpToIndex(i)}
                tabIndex={-1}
                className="w-full flex items-center justify-center font-black num select-none"
                style={{
                  height: ITEM_H,
                  scrollSnapAlign: "center",
                  scrollSnapStop: "always",
                  fontSize: active ? "1.5rem" : "1.125rem",
                  opacity,
                  color: active ? "white" : "rgba(255,255,255,0.8)",
                  transition:
                    "font-size 150ms ease, opacity 150ms ease, color 150ms ease",
                }}
              >
                {format(v)}
              </button>
            );
          })}
        </div>

        {/* Edge fades */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-black/90 to-transparent"
          style={{ height: PAD }}
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent"
          style={{ height: PAD }}
        />
      </div>
    </div>
  );
}

function nearestIndex(values: number[], v: number | null): number {
  if (v == null || values.length === 0) return 0;
  let best = 0;
  let bestDist = Infinity;
  for (let i = 0; i < values.length; i++) {
    const d = Math.abs(values[i] - v);
    if (d < bestDist) {
      bestDist = d;
      best = i;
    }
  }
  return best;
}

export function makeRange(start: number, end: number, step: number): number[] {
  const out: number[] = [];
  for (let v = start; v <= end + 1e-9; v += step) {
    // round to avoid FP drift (2.5 + 2.5 = 4.999999…)
    out.push(Math.round(v * 100) / 100);
  }
  return out;
}
