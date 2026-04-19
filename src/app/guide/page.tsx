import {
  Award,
  Dumbbell,
  Flame,
  Moon,
  Target,
  TrendingUp,
  Utensils,
} from "lucide-react";

export const metadata = { title: "Protocol · Gym Tracker" };

const RPE = [
  { n: 6, left: "4+ reps left", tone: "text-white/50" },
  { n: 7, left: "3 reps left", tone: "text-white/60" },
  { n: 8, left: "2 reps left — growth zone", tone: "text-emerald-300" },
  { n: 9, left: "1 rep left", tone: "text-amber-300" },
  { n: 10, left: "failure", tone: "text-rose-300" },
];

const NUTRITION = [
  {
    label: "Protein",
    value: "1.6–2.2",
    unit: "g / kg bodyweight / day",
    hint: "Chicken, eggs, whey, fish, paneer. Every single day.",
    Icon: Dumbbell,
    tint: "from-rose-500/20 to-orange-500/10",
  },
  {
    label: "Lean bulk",
    value: "+250",
    unit: "kcal over maintenance",
    hint: "Scale moves ~0.3kg / week. Faster = fat gain.",
    Icon: TrendingUp,
    tint: "from-emerald-500/20 to-lime-500/10",
  },
  {
    label: "Cut",
    value: "−450",
    unit: "kcal below maintenance",
    hint: "Keep protein high. Drop carbs + fats.",
    Icon: Flame,
    tint: "from-amber-500/20 to-orange-500/10",
  },
  {
    label: "Sleep",
    value: "7.5–9h",
    unit: "per night",
    hint: "Where muscle is actually built.",
    Icon: Moon,
    tint: "from-sky-500/20 to-indigo-500/10",
  },
];

export default function GuidePage() {
  return (
    <div className="space-y-8">
      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-600 via-rose-500 to-orange-500 p-5 sm:p-10">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-black/30 backdrop-blur px-3 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
            <Target className="h-3.5 w-3.5" />
            Physique Protocol
          </div>
          <h1 className="mt-3 text-[40px] sm:text-6xl font-black tracking-tight leading-[0.95]">
            Build the Cavill.
          </h1>
          <p className="mt-3 text-sm sm:text-base text-white/90 leading-relaxed">
            Wide shoulders. Thick chest. V-taper back. Low body fat. Years, not
            months. Here&apos;s what actually matters.
          </p>
        </div>
      </header>

      <PillarCard
        n="01"
        title="Progressive overload, forever"
        icon={<TrendingUp className="h-5 w-5" />}
        tint="from-white/[0.06] to-white/[0.02]"
      >
        <p className="text-white/80">
          Cavill didn&apos;t get that physique from fancy programming. He added
          weight or reps on a small list of hard exercises, week after week,
          for years. Every session: beat last session on{" "}
          <em className="text-white">at least one set</em> of{" "}
          <em className="text-white">one exercise</em>.
        </p>
        <ul className="mt-3 space-y-1.5 text-sm text-white/70">
          <li className="flex gap-2">
            <span className="text-white/30">→</span>
            Last week 60 × 8? This week 60 × 9, or 62.5 × 8.
          </li>
          <li className="flex gap-2">
            <span className="text-white/30">→</span>
            Hit all target reps clean? Add weight next session.
          </li>
          <li className="flex gap-2">
            <span className="text-white/30">→</span>
            Leave 1–2 reps in the tank. Grinding failure kills recovery.
          </li>
        </ul>
      </PillarCard>

      <PillarCard
        n="02"
        title="Train hard enough to grow"
        icon={<Flame className="h-5 w-5" />}
        tint="from-rose-500/10 to-rose-500/[0.02]"
      >
        <p className="text-white/80 mb-4">
          Effort is the hidden variable. 8 reps at RPE 6 builds nothing. The
          same 8 reps at RPE 8–9 is a growth stimulus.
        </p>
        <div className="rounded-xl border border-white/10 bg-black/30 overflow-hidden">
          {RPE.map((r, i) => (
            <div
              key={r.n}
              className={`flex items-center gap-4 px-4 py-2.5 ${
                i < RPE.length - 1 ? "border-b border-white/5" : ""
              }`}
            >
              <div className="font-black text-2xl num w-10 text-white/80">
                {r.n}
              </div>
              <div className={`text-sm ${r.tone}`}>{r.left}</div>
            </div>
          ))}
        </div>
      </PillarCard>

      <PillarCard
        n="03"
        title="The Cavill emphasis"
        icon={<Award className="h-5 w-5" />}
        tint="from-sky-500/10 to-indigo-500/[0.02]"
      >
        <div className="grid sm:grid-cols-2 gap-2">
          <Emphasis title="Shoulders = width">
            Lateral raises are non-negotiable. 5–6 sets, 12–20 reps. Lighter
            than your ego wants.
          </Emphasis>
          <Emphasis title="Back = v-taper">
            Pulldowns + rows every pull day. Drive elbows <em>down</em>, not
            back. Stretch at the top.
          </Emphasis>
          <Emphasis title="Upper chest = armor">
            Incline press first on push day, every single time.
          </Emphasis>
          <Emphasis title="Posture = presence">
            Rear delts + face pulls every pull session.
          </Emphasis>
        </div>
      </PillarCard>

      <PillarCard
        n="04"
        title="Food is 60% of the job"
        icon={<Utensils className="h-5 w-5" />}
        tint="from-emerald-500/10 to-lime-500/[0.02]"
      >
        <div className="grid sm:grid-cols-2 gap-2">
          {NUTRITION.map((n) => (
            <div
              key={n.label}
              className={`rounded-2xl border border-white/10 bg-gradient-to-br ${n.tint} p-4`}
            >
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-bold uppercase tracking-wider text-white/60">
                  {n.label}
                </div>
                <n.Icon className="h-4 w-4 text-white/70" />
              </div>
              <div className="mt-1 text-3xl font-black num leading-none">
                {n.value}
              </div>
              <div className="mt-0.5 text-[11px] text-white/50 num">
                {n.unit}
              </div>
              <p className="mt-2 text-xs text-white/60 leading-snug">
                {n.hint}
              </p>
            </div>
          ))}
        </div>
      </PillarCard>

      <PillarCard
        n="05"
        title="Sunday scoreboard"
        icon={<Target className="h-5 w-5" />}
      >
        <p className="text-white/70 mb-3">
          Every Sunday, three questions. Two weeks of <em>no</em> to any one
          means something needs to change.
        </p>
        <ol className="space-y-2">
          {[
            "Did I hit all 6 training days?",
            "Did I beat a number on at least 3 exercises this week?",
            "Did I hit my protein target 6 of 7 days?",
          ].map((q, i) => (
            <li
              key={i}
              className="flex items-start gap-3 rounded-xl bg-white/[0.03] border border-white/5 p-3"
            >
              <span className="h-6 w-6 shrink-0 rounded-full bg-white/10 flex items-center justify-center text-xs font-black num">
                {i + 1}
              </span>
              <span className="text-sm text-white/80">{q}</span>
            </li>
          ))}
        </ol>
      </PillarCard>

      <div className="rounded-3xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/10 p-6 text-center">
        <div className="text-5xl font-black num tracking-tight bg-gradient-to-br from-white to-white/50 bg-clip-text text-transparent">
          3–5 yrs
        </div>
        <p className="mt-2 text-sm text-white/60 max-w-sm mx-auto">
          Natural, honest timeline to a visibly Cavill-adjacent physique, from
          untrained. There are no shortcuts. The work <em>is</em> the shortcut.
        </p>
        <p className="mt-4 text-xs text-white/40 italic">
          &ldquo;The iron never lies to you.&rdquo; — Henry Rollins
        </p>
      </div>
    </div>
  );
}

function PillarCard({
  n,
  title,
  icon,
  tint = "from-white/[0.04] to-white/[0.02]",
  children,
}: {
  n: string;
  title: string;
  icon: React.ReactNode;
  tint?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`rounded-3xl border border-white/10 bg-gradient-to-br ${tint} p-4 sm:p-6`}
    >
      <header className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 shrink-0 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center">
          {icon}
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-widest text-white/40 font-bold num">
            Pillar {n}
          </div>
          <h2 className="text-lg font-bold tracking-tight leading-tight">
            {title}
          </h2>
        </div>
      </header>
      <div className="leading-relaxed">{children}</div>
    </section>
  );
}

function Emphasis({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <div className="text-sm font-bold">{title}</div>
      <p className="mt-1 text-xs text-white/60 leading-relaxed">{children}</p>
    </div>
  );
}
