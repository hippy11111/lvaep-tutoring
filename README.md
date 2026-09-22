# LVAEP tutoring sessions & monthly reports

Demo: **https://web-production-9c1b4.up.railway.app**  
Code: **https://github.com/hippy11111/lvaep-tutoring**

A small web app that replaces LVAEP’s paper *Student Monthly Attendance & Achievement Form*. Tutors log sessions after each meeting. Staff open a month and see hours, absences, achievements, and students who stopped — then download CSV.

## How to run locally

Needs Node 20+ and Postgres.

**Option A — Docker Compose**

```bash
docker compose up -d
cp .env.example .env
# set DATABASE_URL=postgresql://lvaep:lvaep@localhost:5432/lvaep
npm install
npx prisma migrate deploy
npm run db:seed
npm run dev
```

**Option B — Homebrew Postgres**

```bash
brew services start postgresql@16
createdb lvaep
cp .env.example .env
# DATABASE_URL=postgresql://YOUR_OS_USER@localhost:5432/lvaep
npm install
npx prisma migrate deploy
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and pick a seeded staff or tutor user.

## What to try

Seeded hours are in **August 2026** and **September 2026**.

1. Staff (**Sydnay Eckerling**): assign waitlist student **Rosa Alvarez**, or add a new student. Unassigned and stopped students sit in **Needs attention**.
2. Tutor (**Maria Alvarez**): set site/days/times, log a session (try saving the same date twice — it should refuse). Mark an achievement.
3. Tutor: stop a student. They leave your roster. Switch back to staff, open that student, **Resume tutoring**.
4. Staff: download CSV for September 2026.

## Design decisions

The paper form is a 31×12 calendar plus goal checkboxes, one sheet per student per fiscal year (July–June). Staff then re-total those sheets into monthly reports. Recreating the grid would keep the bottleneck.

This app stores **one row per session** (`date`, `student`, `tutor`, `hours` or absence code) and **aggregates** for the office.

| Paper form | This app |
| --- | --- |
| Hours in day/month cells | Session log (default: today) |
| One number per student per day | One record per student per day (duplicates rejected) |
| TA / SA / H codes | Same codes as session kinds |
| Achievement checkmarks | Checklist on the student page, timestamped |
| STOPPED + “notify the office ASAP” | Tutor stops; student appears under staff **Needs attention** |
| Staff collect forms | Staff dashboard + CSV |
| Office matches tutors to students | Staff add students and assign / transfer / unassign |
| Tutoring site, days, times | Assigned tutor sets schedule per student |

Layout: `src/app` for tutor vs staff routes, `src/app/actions.ts` for mutations, `src/lib/reports.ts` for monthly totals.

## Assumptions

- Tutors record after each meeting, not on a yearly grid.
- Dates are **calendar dates** (the day on the form), not timestamps.
- One active tutor per student (or unassigned on a waitlist).
- One attendance record per student per day, matching one cell on the paper grid.
- Stopped students leave the tutor’s roster and cannot have attendance edited by that tutor until staff resume tutoring.
- Staff add students and assign, transfer, and unassign them; they cannot edit achievements, schedules, or stop tutoring.
- The monthly report lists every student, including those with 0 hours, so waitlist and stopped students are not invisible.
- Hours can be fractional (e.g. 1.5). Completed homework can be included in hours, as the paper form asked.
- Starred goals are NRS-style outcomes; stored like other goals and labeled with `*`.
- Fiscal year is July–June.
- Demo login only (no passwords, email, or real student PII). Anyone with the public URL can use the seeded users and the shared database.
- Seed runs only when the database has no users, so deploys and restarts do not wipe reviewer activity.

## Intentionally not built

Kept out of scope for a 3–5 hour take-home: real authentication, emailing the office on stop, in-place session edits (remove and re-log instead), multi-tutor history, and charts. Those are production follow-ons, not required to replace collecting paper forms.

## Stack

Next.js (App Router), Postgres, Prisma, Tailwind. Hosted on Railway (web service + Postgres).
