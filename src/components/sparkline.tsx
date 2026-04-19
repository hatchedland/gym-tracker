import type { ProgressionPoint } from "@/lib/workout-data";

type Props = {
  points: ProgressionPoint[];
  currentTopWeight?: number | null; // live top from the active session
  width?: number;
  height?: number;
};

export function Sparkline({
  points,
  currentTopWeight,
  width = 120,
  height = 36,
}: Props) {
  const series = [
    ...points.map((p) => p.topWeight),
    ...(currentTopWeight != null ? [currentTopWeight] : []),
  ];

  if (series.length < 2) {
    return (
      <div
        className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2 h-6 text-[10px] text-white/40"
        style={{ width: "auto" }}
      >
        Not enough data
      </div>
    );
  }

  const min = Math.min(...series);
  const max = Math.max(...series);
  const range = Math.max(0.5, max - min); // avoid flat-line div by zero
  const padY = 4;
  const innerH = height - padY * 2;
  const step = series.length === 1 ? 0 : width / (series.length - 1);

  const coords = series.map((v, i) => {
    const x = i * step;
    const y = padY + innerH * (1 - (v - min) / range);
    return [x, y] as const;
  });

  const path = coords
    .map((c, i) => (i === 0 ? `M ${c[0]},${c[1]}` : `L ${c[0]},${c[1]}`))
    .join(" ");

  const areaPath =
    path +
    ` L ${coords[coords.length - 1][0]},${height - padY} L 0,${height - padY} Z`;

  const last = coords[coords.length - 1];
  const prev = coords[coords.length - 2];
  const rising = last[1] < prev[1];

  const firstVal = series[0];
  const lastVal = series[series.length - 1];
  const delta = lastVal - firstVal;

  return (
    <div className="flex items-center gap-2">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="shrink-0"
      >
        <defs>
          <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor={rising ? "rgb(74,222,128)" : "rgb(244,114,182)"}
              stopOpacity="0.35"
            />
            <stop
              offset="100%"
              stopColor={rising ? "rgb(74,222,128)" : "rgb(244,114,182)"}
              stopOpacity="0"
            />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#spark-fill)" />
        <path
          d={path}
          fill="none"
          stroke={rising ? "rgb(74,222,128)" : "rgb(244,114,182)"}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx={last[0]}
          cy={last[1]}
          r={3}
          fill={rising ? "rgb(74,222,128)" : "rgb(244,114,182)"}
        />
      </svg>
      <div className="text-[10px] leading-tight">
        <div
          className={`font-bold num ${rising ? "text-emerald-300" : "text-rose-300"}`}
        >
          {delta > 0 ? "+" : ""}
          {delta.toFixed(1)}kg
        </div>
        <div className="text-white/40 num">
          {series.length} session{series.length === 1 ? "" : "s"}
        </div>
      </div>
    </div>
  );
}
