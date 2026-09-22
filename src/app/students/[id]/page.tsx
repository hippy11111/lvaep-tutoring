import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fiscalYearRange, formatDate, monthKey } from "@/lib/dates";
import { Shell, Card } from "@/components/shell";
import { SessionForm } from "@/components/session-form";
import { AchievementList } from "@/components/achievements";
import { deleteSession, stopTutoring } from "@/app/actions";
import { AssignmentForm } from "@/components/assignment-form";

export default async function StudentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      assignments: { include: { tutor: true } },
      sessions: { include: { tutor: true }, orderBy: { date: "desc" } },
      achievements: true,
    },
  });

  if (!student) notFound();

  const assignment = student.assignments[0];
  if (user.role === "TUTOR" && assignment?.tutorId !== user.id) {
    redirect("/tutor");
  }

  const tutors =
    user.role === "STAFF"
      ? await prisma.user.findMany({
          where: { role: "TUTOR" },
          orderBy: { name: "asc" },
        })
      : [];

  const fy = fiscalYearRange();
  const thisMonth = monthKey();
  const [year, month] = thisMonth.split("-").map(Number);
  const monthStart = new Date(Date.UTC(year, month - 1, 1));
  const monthEnd = new Date(Date.UTC(year, month, 1));

  const fyHours = student.sessions
    .filter((session) => session.kind === "HELD" && session.date >= fy.start && session.date < fy.end)
    .reduce((sum, session) => sum + (session.hours ?? 0), 0);
  const monthHours = student.sessions
    .filter(
      (session) =>
        session.kind === "HELD" && session.date >= monthStart && session.date < monthEnd,
    )
    .reduce((sum, session) => sum + (session.hours ?? 0), 0);

  const home = user.role === "STAFF" ? "/staff" : "/tutor";

  return (
    <Shell user={user}>
      <Link href={home} className="text-sm text-accent">
        ← Back
      </Link>
      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{student.name}</h1>
          <p className="text-sm text-muted">
            Tutor: {assignment?.tutor.name ?? "Unassigned"} · {student.site}
          </p>
          <p className="text-sm text-muted">
            {student.days} · {student.times}
          </p>
        </div>
        <div className="text-sm">
          <div>
            <span className="font-medium">{monthHours.toFixed(1)}</span> hours this month
          </div>
          <div>
            <span className="font-medium">{fyHours.toFixed(1)}</span> hours {fy.label}
          </div>
        </div>
      </div>

      {student.stoppedAt ? (
        <Card className="mt-6 border-accent">
          <p className="font-medium">Tutoring stopped</p>
          <p className="text-sm text-muted">
            {formatDate(student.stoppedAt)}
            {student.stoppedReason ? ` — ${student.stoppedReason}` : ""}
          </p>
        </Card>
      ) : null}

      {user.role === "TUTOR" && !student.stoppedAt ? (
        <Card className="mt-6">
          <h2 className="mb-3 text-lg font-semibold">Log a session</h2>
          <SessionForm
            students={[{ id: student.id, name: student.name }]}
            defaultStudentId={student.id}
          />
        </Card>
      ) : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold">Attendance</h2>
          <ul className="mt-3 divide-y divide-line text-sm">
            {student.sessions.length === 0 ? (
              <li className="py-2 text-muted">No sessions yet.</li>
            ) : (
              student.sessions.map((session) => (
                <li key={session.id} className="flex items-start justify-between gap-3 py-2">
                  <div>
                    <div>
                      {formatDate(session.date)} · {kindLabel(session.kind, session.hours)}
                    </div>
                    <div className="text-muted">
                      {session.tutor.name}
                      {session.note ? ` · ${session.note}` : ""}
                    </div>
                  </div>
                  {user.role === "STAFF" || session.tutorId === user.id ? (
                    <form action={deleteSession.bind(null, session.id)}>
                      <button type="submit" className="text-muted hover:text-foreground">
                        Remove
                      </button>
                    </form>
                  ) : null}
                </li>
              ))
            )}
          </ul>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold">Achievements</h2>
          <div className="mt-3">
            <AchievementList
              studentId={student.id}
              recorded={student.achievements}
              editable={user.role === "TUTOR" && !student.stoppedAt}
            />
          </div>
        </Card>
      </div>

      {user.role === "STAFF" ? (
        <Card className="mt-6">
          <h2 className="text-lg font-semibold">Tutor assignment</h2>
          <p className="mt-1 text-sm text-muted">
            Assign, transfer, or unassign this student. Only the assigned tutor can log sessions,
            mark achievements, or stop tutoring.
          </p>
          <div className="mt-3">
            <AssignmentForm
              studentId={student.id}
              tutors={tutors}
              currentTutorId={assignment?.tutorId ?? null}
            />
          </div>
        </Card>
      ) : null}

      {user.role === "TUTOR" && !student.stoppedAt ? (
        <Card className="mt-6">
          <h2 className="text-lg font-semibold">Stop tutoring</h2>
          <p className="mt-1 text-sm text-muted">
            Replaces the STOPPED checkbox. Staff see this on the monthly report — notify the office
            as well.
          </p>
          <form action={stopTutoring} className="mt-3 flex flex-wrap gap-2">
            <input type="hidden" name="studentId" value={student.id} />
            <input
              name="reason"
              required
              placeholder="Reason"
              className="min-w-56 flex-1 rounded-md border border-line bg-white px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="rounded-md border border-line px-3 py-2 text-sm hover:bg-background"
            >
              Mark as stopped
            </button>
          </form>
        </Card>
      ) : null}
    </Shell>
  );
}

function kindLabel(kind: string, hours: number | null) {
  if (kind === "HELD") return `${hours} hours`;
  if (kind === "TUTOR_ABSENT") return "Tutor absent";
  if (kind === "STUDENT_ABSENT") return "Student absent";
  return "Holiday";
}
