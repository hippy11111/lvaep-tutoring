import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, fiscalYearRange } from "@/lib/dates";
import { Shell, Card } from "@/components/shell";
import { LogSessionButton, SessionList } from "@/components/session-list";
import { studentTint } from "@/lib/tutor-style";

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

  const activeStudents = assignments
    .filter((assignment) => !assignment.student.stoppedAt)
    .map((assignment) => assignment.student);
  const roster = assignments.map((assignment) => assignment.student.id);

  return (
    <Shell user={user}>
      <h1 className="text-2xl font-semibold">Your students</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {assignments.length === 0 ? (
          <p className="text-sm text-muted">No students assigned to you.</p>
        ) : (
          assignments.map((assignment) => {
            const hours = assignment.student.sessions
              .filter((session) => session.kind === "HELD")
              .reduce((sum, session) => sum + (session.hours ?? 0), 0);
            const stopped = Boolean(assignment.student.stoppedAt);
            const tint = studentTint(assignment.student.id, roster);
            return (
              <a key={assignment.id} href={`/students/${assignment.studentId}`}>
                <Card
                  className={`h-full hover:border-accent ${stopped ? "border-stopped/40" : ""}`}
                  style={{ background: tint.bg }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-semibold" style={{ color: tint.text }}>
                      {assignment.student.name}
                    </h2>
                    {stopped ? (
                      <span className="rounded-full bg-stopped/12 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-stopped">
                        No longer being tutored
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted">
                    Meeting location / days / times
                  </p>
                  <p className="text-sm text-muted">{assignment.student.site}</p>
                  <p className="text-sm text-muted">
                    {assignment.student.days} · {assignment.student.times}
                  </p>
                  <p className="mt-3 text-sm">
                    <span className="font-medium">{hours.toFixed(1)}</span> hours this fiscal year
                  </p>
                </Card>
              </a>
            );
          })
        )}
      </div>

      <Card className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Recent records</h2>
          <LogSessionButton students={activeStudents} />
        </div>
        <SessionList
          canEdit
          roster={roster}
          students={activeStudents}
          sessions={recent.map((session) => ({
            id: session.id,
            studentId: session.studentId,
            date: session.date,
            kind: session.kind,
            hours: session.hours,
            note: session.note,
            studentName: session.student.name,
            summary: `${formatDate(session.date)} · ${label(session.kind, session.hours)}`,
            editable: !session.student.stoppedAt,
          }))}
        />
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
