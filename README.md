# Gym Tracker

Push. Pull. Legs. Track every set, every rep — and push toward a Cavill-style physique.

## Stack

- **Next.js 16** (App Router, Server Components, Server Actions)
- **Prisma 7** (with `@prisma/adapter-pg` driver adapter)
- **PostgreSQL** (local)
- **Tailwind CSS v4**
- TypeScript

## Features

- **Today view** (`/`) — auto-picks push / pull / legs / rest based on day of week (Mon PUSH, Tue LEGS, Wed PULL, Thu PUSH, Fri LEGS, Sat PULL, Sun REST).
- **Live session logging** — start a workout, log weight × reps × RPE per set, mark it finished. Shows "last time you did X" next to each exercise as a target to beat.
- **History** (`/history`) — last 50 sessions with set counts and top weights.
- **Cavill protocol** (`/guide`) — progressive-overload rules, RPE scale, nutrition targets, weekly scoreboard.
- Server Actions for every mutation — no REST layer, no client DB access.

## Local setup

### 1. Install deps

```bash
npm install
```

### 2. Make sure Postgres is running

```bash
pg_isready          # should say "accepting connections"
createdb gym_tracker
```

### 3. Configure the connection string

`.env` is already pointed at the local DB:

```
DATABASE_URL="postgresql://<your-username>@localhost:5432/gym_tracker"
```

Adjust username if yours isn't the macOS default.

### 4. Migrate + seed

```bash
npm run db:migrate   # applies the init migration
npm run db:seed      # inserts all 15 exercises from the plan
```

### 5. Run it

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command            | What it does                                |
| ------------------ | ------------------------------------------- |
| `npm run dev`      | Next.js dev server                          |
| `npm run build`    | Production build                            |
| `npm run db:migrate` | Apply + create Prisma migrations          |
| `npm run db:seed`  | Re-seed exercises (idempotent)              |
| `npm run db:studio`| Open Prisma Studio (GUI for the DB)         |
| `npm run db:reset` | Wipe the DB and re-migrate + seed           |

## Schema

Three tables: `exercises`, `workout_sessions`, `sets`. Enum `Day` covers push / pull / legs. Source of truth is `prisma/schema.prisma`.

## Project layout

```
prisma/
  schema.prisma        # Prisma models
  seed.ts              # Seed exercises from the training plan
  migrations/          # Generated migration history

src/
  app/
    page.tsx           # Today's workout (day-of-week aware)
    workout/[day]/     # Push / Pull / Legs pages
    history/           # Past sessions
    guide/             # Cavill protocol
    actions.ts         # Server Actions (start/finish session, log set)
  components/
    nav.tsx            # Top + bottom nav
    workout-view.tsx   # Exercise list + live logger
    set-logger.tsx     # Per-exercise set input
    session-controls.tsx
  lib/
    prisma.ts          # Singleton Prisma client w/ pg adapter
    workout-data.ts    # All read queries
    schedule.ts        # Day-of-week → push/pull/legs/rest
    types.ts

```

## Routine

**Push** — Incline bench · Chest press · Overhead triceps ext · Lateral raises · Triceps pushdown
**Pull** — Lat pulldown · Machine row · Rope pulldown · Rear delt · Bicep curl
**Legs** — Seated hamstring · Leg press · Calves · Overhead press (DB) · Leg extension

Weekly split: **Mon Push · Tue Legs · Wed Pull · Thu Push · Fri Legs · Sat Pull · Sun Rest.**
