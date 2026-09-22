import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, fiscalYearRange } from "@/lib/dates";
import { Shell, Card } from "@/components/shell";
import { SessionForm } from "@/components/session-form";
import { deleteSession } from "@/app/actions";

export default async function TutorHome() {
  const user = await requireRole("TUTOR");
  const fy = fiscalYearRange();

  const assignments = await prisma.assignment.findMany({
    where: { tutorId: user.id },
    include: {
      student: {
        include: {
          sessions: {
            where: { date: { gte: fy.start, lt: fy.end } },
          },
        },
      },
    },
    orderBy: { student: { name: "asc" } },
  });

  const recent = await prisma.session.findMany({
    where: { tutorId: user.id },
    include: { student: true },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    take: 12,
  });

  const students = assignments
    .map((assignment) => assignment.student)
    .filter((student) => !student.stoppedAt);

  return (
    <Shell user={user}>
      <h1 className="text-2xl font-semibold">Your students</h1>
      <p className="mt-1 text-sm text-muted">
        Log a session after each meeting. Hours here replace the yearly paper calendar.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {assignments.map((assignment) => {
          const hours = assignment.student.sessions
            .filter((session) => session.kind === "HELD")
            .reduce((sum, session) => sum + (session.hours ?? 0), 0);
          return (
            <Link key={assignment.id} href={`/students/${assignment.studentId}`}>
              <Card className="h-full hover:border-accent">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-semibold">{assignment.student.name}</h2>
                  {assignment.student.stoppedAt ? (
                    <span className="rounded-full bg-background px-2 py-0.5 text-xs text-muted">
                      Stopped
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-muted">{assignment.student.site}</p>
                <p className="text-sm text-muted">
                  {assignment.student.days} · {assignment.student.times}
                </p>
                <p className="mt-3 text-sm">
                  <span className="font-medium">{hours.toFixed(1)}</span> hours this fiscal year
                </p>
              </Card>
            </Link>
          );
        })}
      </div>

      <Card className="mt-8">
        <h2 className="text-lg font-semibold">Log a session</h2>
        <p className="mb-4 text-sm text-muted">Defaults to today. Fractional hours (for example 1.5) are allowed.</p>
        <SessionForm students={students} />
      </Card>

      <Card className="mt-8">
        <h2 className="text-lg font-semibold">Recent records</h2>
        <ul className="mt-3 divide-y divide-line">
          {recent.map((session) => (
            <li key={session.id} className="flex items-center justify-between gap-3 py-2 text-sm">
              <div>
                <span className="font-medium">{session.student.name}</span>
                <span className="text-muted"> · {formatDate(session.date)} · {label(session.kind, session.hours)}</span>
                {session.note ? <div className="text-muted">{session.note}</div> : null}
              </div>
              <form action={deleteSession.bind(null, session.id)}>
                <button type="submit" className="text-muted hover:text-foreground">
                  Remove
                </button>
              </form>
            </li>
          ))}
        </ul>
      </Card>
    </Shell>
  );
}

function label(kind: string, hours: number | null) {
  if (kind === "HELD") return `${hours} hr`;
  if (kind === "TUTOR_ABSENT") return "TA";
  if (kind === "STUDENT_ABSENT") return "SA";
  return "Holiday";
}
