import { requireRole } from "@/lib/auth";
import { monthKey } from "@/lib/dates";
import { getMonthlyReport } from "@/lib/reports";
import { prisma } from "@/lib/prisma";
import { Shell, Card } from "@/components/shell";
import { StudentStatus } from "@/components/status-badge";
import { TutorPicker } from "@/components/tutor-picker";
import { AddStudentButton, MonthPicker } from "@/components/staff-controls";
import { StudentBreakdownTable } from "@/components/student-breakdown-table";
import { tutorTint } from "@/lib/tutor-style";

export default async function StaffHome({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const user = await requireRole("STAFF");
  const params = await searchParams;
  const month = params.month ?? monthKey();
  const report = await getMonthlyReport(month);

  const [roster, tutors] = await Promise.all([
    prisma.student.findMany({
      include: { assignments: { include: { tutor: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.user.findMany({
      where: { role: "TUTOR" },
      orderBy: { name: "asc" },
    }),
  ]);

  const unassignedCount = roster.filter((student) => student.assignments.length === 0).length;
  const currentlyStoppedCount = roster.filter((student) => student.stoppedAt).length;
  const needsAttention = [
    ...roster.filter((student) => student.assignments.length === 0),
    ...roster.filter((student) => student.assignments.length > 0 && student.stoppedAt),
  ];
  const activeAssigned = roster.filter(
    (student) => student.assignments.length > 0 && !student.stoppedAt,
  );

  if (!report) {
    return (
      <Shell user={user}>
        <p>Invalid month.</p>
      </Shell>
    );
  }

  return (
    <Shell user={user}>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="grid gap-3">
          <h1 className="text-2xl font-semibold">Monthly report</h1>
          <MonthPicker month={month} />
        </div>
        <a
          href={`/staff/report.csv?month=${month}`}
          className="rounded-md border-2 border-foreground bg-white px-3 py-1.5 text-sm font-medium text-foreground hover:bg-background"
        >
          Download CSV
        </a>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total hours tutored" value={report.totals.hours.toFixed(1)} />
        <Stat label="Total sessions held" value={String(report.totals.sessionsHeld)} />
        <Stat label="Unassigned students" value={String(unassignedCount)} />
        <Stat label="Currently stopped" value={String(currentlyStoppedCount)} />
      </div>

      <Card className="mt-8 overflow-x-auto">
        <h2 className="text-lg font-semibold">Breakdown by tutor</h2>
        <table className="mt-3 w-full text-left text-sm">
          <thead className="text-muted">
            <tr>
              <th className="pb-2 font-medium">Tutor</th>
              <th className="pb-2 font-medium">Students</th>
              <th className="pb-2 font-medium">Sessions</th>
              <th className="pb-2 font-medium">Hours</th>
            </tr>
          </thead>
          <tbody>
            {report.byTutor.map((row) => {
              const tint = tutorTint(row.tutorId || null);
              return (
                <tr key={row.tutorId || "unassigned"} className="border-t border-line">
                  <td className="py-2">
                    <span
                      className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium"
                      style={{ background: tint.bg, color: tint.text }}
                    >
                      {row.tutorName}
                    </span>
                  </td>
                  <td>{row.studentCount}</td>
                  <td>{row.sessionsHeld}</td>
                  <td>{row.hours.toFixed(1)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      <Card className="mt-6 overflow-x-auto">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Breakdown by student</h2>
          <AddStudentButton tutors={tutors} />
        </div>
        <StudentBreakdownTable rows={report.byStudent} />
      </Card>

      <Card className="mt-6">
        <h2 className="text-lg font-semibold">Needs attention</h2>
        <p className="mt-1 text-sm text-muted">
          Unassigned students and students whose tutoring has been stopped.
        </p>
        {needsAttention.length === 0 ? (
          <p className="mt-3 text-sm text-muted">None right now.</p>
        ) : (
          <ul className="mt-3 grid gap-3 text-sm">
            {needsAttention.map((student) => (
              <AssignmentRow
                key={`${student.id}-${student.assignments[0]?.tutorId ?? "none"}`}
                student={student}
                tutors={tutors}
                highlight
              />
            ))}
          </ul>
        )}
      </Card>

      <Card className="mt-6">
        <h2 className="text-lg font-semibold">Active assignments</h2>
        {activeAssigned.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No active assigned students.</p>
        ) : (
          <ul className="mt-3 grid gap-3 text-sm">
            {activeAssigned.map((student) => (
              <AssignmentRow
                key={`${student.id}-${student.assignments[0]?.tutorId ?? "none"}`}
                student={student}
                tutors={tutors}
              />
            ))}
          </ul>
        )}
      </Card>
    </Shell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <div className="text-xs uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </Card>
  );
}

function AssignmentRow({
  student,
  tutors,
  highlight = false,
}: {
  student: {
    id: string;
    name: string;
    site: string;
    stoppedAt: Date | null;
    assignments: { tutorId: string }[];
  };
  tutors: { id: string; name: string }[];
  highlight?: boolean;
}) {
  const assignment = student.assignments[0];
  const unassigned = !assignment;
  const stopped = Boolean(student.stoppedAt);
  return (
    <li
      className={`flex flex-col gap-2 px-3 py-3 sm:flex-row sm:items-center sm:justify-between ${
        highlight
          ? stopped
            ? "rounded-lg border border-stopped/30 bg-stopped/[0.06]"
            : "rounded-lg border border-waitlist/30 bg-waitlist/[0.08]"
          : "border-b border-line"
      }`}
    >
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <a href={`/students/${student.id}`} className="font-medium underline decoration-line">
            {student.name}
          </a>
          <StudentStatus unassigned={unassigned} stopped={stopped} />
        </div>
        <div className="text-muted">{student.site}</div>
      </div>
      <TutorPicker
        studentId={student.id}
        tutors={tutors}
        currentTutorId={assignment?.tutorId ?? null}
      />
    </li>
  );
}
