import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fiscalYearRange, formatDate, monthKey } from "@/lib/dates";
import { Shell, Card } from "@/components/shell";
import { AchievementList } from "@/components/achievements";
import { StudentStatus } from "@/components/status-badge";
import { TutorPicker } from "@/components/tutor-picker";
import { MeetingLine } from "@/components/meeting-line";
import { SessionList, LogSessionButton } from "@/components/session-list";
import { StopTutoring } from "@/components/stop-tutoring";
import { resumeTutoring } from "@/app/actions";

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
  const stopped = Boolean(student.stoppedAt);
  const canEdit = user.role === "TUTOR" && !stopped;
  const canEditSessions = user.role === "STAFF" || canEdit;

  return (
    <Shell user={user}>
      <Link href={home} className="text-sm text-accent">
        ← Back
      </Link>
      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div className="grid gap-2">
          <h1 className="flex flex-wrap items-center gap-2 text-2xl font-semibold">
            {student.name}
            <StudentStatus unassigned={!assignment} stopped={stopped} />
          </h1>
          <p className="flex flex-wrap items-center gap-2 text-sm">
            <span>{student.site === "To be scheduled" ? "Location TBD" : student.site}</span>
            <span className="text-muted">·</span>
            <span className="text-muted">Tutor:</span>
            {user.role === "STAFF" ? (
              <TutorPicker
                studentId={student.id}
                tutors={tutors}
                currentTutorId={assignment?.tutorId ?? null}
                compact
              />
            ) : (
              <span>{assignment?.tutor.name ?? "Unassigned"}</span>
            )}
          </p>
          <MeetingLine
            studentId={student.id}
            site={student.site}
            days={student.days}
            times={student.times}
            editable={canEdit}
          />
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

      {stopped ? (
        <Card className="mt-6 border-stopped">
          <p className="font-medium">No longer being tutored</p>
          <p className="text-sm text-muted">
            {formatDate(student.stoppedAt!)}
            {student.stoppedReason ? ` — ${student.stoppedReason}` : ""}
          </p>
          {user.role === "STAFF" ? (
            <form action={resumeTutoring.bind(null, student.id)} className="mt-3">
              <button
                type="submit"
                className="rounded-md bg-accent px-3 py-2 text-sm text-white hover:bg-accent-dark"
              >
                Resume tutoring
              </button>
            </form>
          ) : null}
        </Card>
      ) : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Attendance</h2>
            {canEdit ? (
              <LogSessionButton
                students={[{ id: student.id, name: student.name }]}
                defaultStudentId={student.id}
              />
            ) : null}
          </div>
          <SessionList
            canEdit={canEditSessions}
            students={[{ id: student.id, name: student.name }]}
            sessions={student.sessions.map((session) => ({
              id: session.id,
              studentId: student.id,
              date: session.date,
              kind: session.kind,
              hours: session.hours,
              note: session.note,
              summary: `${formatDate(session.date)} · ${kindLabel(session.kind, session.hours)}`,
              detail: `${session.tutor.name}${session.note ? ` · ${session.note}` : ""}`,
            }))}
          />
        </Card>

        <Card>
          <h2 className="text-lg font-semibold">Achievements</h2>
          <div className="mt-3">
            <AchievementList
              studentId={student.id}
              recorded={student.achievements}
              editable={canEdit}
            />
          </div>
        </Card>
      </div>

      {user.role === "TUTOR" && !stopped ? (
        <div className="mt-6">
          <StopTutoring studentId={student.id} />
        </div>
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
