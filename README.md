# LVAEP tutoring sessions & monthly reports

Demo: **https://web-production-9c1b4.up.railway.app**

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

1. Log in as **Sydnay Eckerling** (staff). Add a student or assign waitlist student **Rosa Alvarez**.
2. Switch user → **Maria Alvarez** (tutor). Open a student, set site/days/times, log a session, mark an achievement. Choose **August 2026** or **September 2026** as staff to see seeded hours.

## Design decisions

The paper form is a 31×12 calendar plus goal checkboxes, one sheet per student per fiscal year (July–June). Staff then re-total those sheets into monthly reports. Recreating the grid would keep the bottleneck.

This app stores **one row per session** (`date`, `student`, `tutor`, `hours` or absence code) and **aggregates** for the office.

| Paper form | This app |
| --- | --- |
| Hours in day/month cells | Session log (default: today) |
| TA / SA / H codes | Same codes as session kinds |
| Achievement checkmarks | Checklist on the student page, timestamped |
| STOPPED + reason | Assigned tutor stops tutoring + reason; appears on that month’s report |
| Staff collect forms | Staff dashboard + CSV |
| Office matches tutors to students | Staff add students and assign / transfer / unassign |
| Tutoring site, days, times | Assigned tutor sets schedule per student |

## Assumptions

- Tutors record after each meeting, not on a yearly grid.
- One active tutor per student (or unassigned on a waitlist).
- Stopped students leave the tutor’s roster and cannot have attendance edited by that tutor until staff resume tutoring.
- Staff add students and assign, transfer, and unassign them; they cannot edit achievements, schedules, or stop tutoring.
- Hours can be fractional (e.g. 1.5). Completed homework can be included in hours, as the paper form asked.
- Starred goals are NRS-style outcomes; stored like other goals and labeled with `*`.
- Fiscal year is July–June.
- Demo login only (no passwords, email, or real student PII). Anyone with the public URL can use the seeded users and the shared database.
- Seed runs only when the database has no users, so deploys and restarts do not wipe reviewer activity.

## Stack

Next.js (App Router), Postgres, Prisma, Tailwind. Hosted on Railway (web service + Postgres).
