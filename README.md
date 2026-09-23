# LVAEP tutoring sessions & monthly reports

Demo: **[https://web-production-9c1b4.up.railway.app](https://web-production-9c1b4.up.railway.app)**

A small web app that replaces LVAEP’s paper *Student Monthly Attendance & Achievement Form*. Tutors log sessions after each meeting. Staff open a month and see hours, absences, achievement progress, and students who need attention, and can download CSV.

Demo login only: pick a seeded staff or tutor user.

## What to try

Seeded hours are in **August 2026** and **September 2026**. Use the month arrows or the calendar control on the staff page.

1. Staff (**Sydnay Eckerling**): assign **Rosa Alvarez** (unassigned), or **Add student**. Unassigned and stopped students sit in **Needs attention**. Click a student in the breakdown to see the actual achievements (the table shows `A: x/y` through `E: x/y` by category).
2. Tutor (**Maria Alvarez**): set location / days / times (free-text location), log a session, then edit or remove it. Try saving the same date twice — it should refuse. Mark achievements, including more than one **Other** with a note.
3. Tutor: **Mark as stopped**. The student stays on **Your students** as no longer being tutored; you cannot add or edit sessions. Switch to staff, open that student, **Resume tutoring**.
4. Staff: page through months and download CSV.



## Design decisions

The paper form is a 31×12 calendar plus goal checkboxes, one sheet per student per fiscal year (July–June). Staff then re-total those sheets into monthly reports. Recreating the grid would keep the bottleneck.

This app stores **one row per session** (`date`, `student`, `tutor`, `hours` or absence code) and **aggregates** for the office.


| Paper form                         | This app                                                                                                                     |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Hours in day/month cells           | Session log (default: today), with edit / remove                                                                             |
| One number per student per day     | One record per student per day (duplicates rejected)                                                                         |
| TA / SA / H codes                  | Same codes as session kinds                                                                                                  |
| Achievement checkmarks             | Tutor checklist on the student page, timestamped; staff see category counts then the full list                               |
| STOPPED + “notify the office ASAP” | Tutor stops (confirm + reason); student stays visible to that tutor as view-only and appears under staff **Needs attention** |
| Staff collect forms                | Staff dashboard + CSV                                                                                                        |
| Office matches tutors to students  | Staff add students and assign / transfer / unassign                                                                          |
| Tutoring site, days, times         | Assigned tutor sets a free-text location, days, and times                                                                    |


Layout: `src/app` for tutor vs staff routes, `src/app/actions.ts` for mutations, `src/lib/reports.ts` for monthly totals.

## Assumptions

- Tutors record after each meeting, not on a yearly grid.
- Dates are **calendar dates** (the day on the form), stored as UTC midnight for `YYYY-MM-DD`.
- One active tutor per student (or unassigned).
- One attendance record per student per day, matching one cell on the paper grid.
- Stopped students stay on the assigned tutor’s list as view-only. That tutor cannot log or edit attendance, change the schedule, or toggle achievements until staff resume tutoring.
- Staff add students and assign, transfer, and unassign them. Staff can correct session records. Staff cannot mark achievements, set the meeting schedule, or stop tutoring.
- The monthly report lists every student, including those with 0 hours, so unassigned and stopped students are not invisible.
- Hours can be fractional (e.g. 1.5). Completed homework can be included in hours, as the paper form asked.
- Fiscal year is July–June.
- Demo login only (no passwords, email, or real student PII). Anyone with the public URL can use the seeded users and the shared database.
- Seed runs only when the database has no users, so deploys and restarts do not wipe reviewer activity.

## Stack

Next.js (App Router), Postgres, Prisma, Tailwind. Hosted on Railway (web service + Postgres).