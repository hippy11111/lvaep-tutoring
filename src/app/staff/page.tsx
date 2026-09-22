import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { formatMonthLabel, monthKey } from "@/lib/dates";
import { getMonthlyReport } from "@/lib/reports";
import { prisma } from "@/lib/prisma";
import { Shell, Card } from "@/components/shell";
import { AssignmentForm } from "@/components/assignment-form";
import { NewStudentForm } from "@/components/new-student-form";
import { StudentStatus } from "@/components/status-badge";

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
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Monthly report</h1>
          <p className="mt-1 text-sm text-muted">
            Totals are calculated from session records. This replaces collecting one paper form per
            student.
          </p>
        </div>
        <form className="flex items-center gap-2 text-sm">
          <label>
            Month
            <input
              type="month"
              name="month"
              defaultValue={month}
              className="ml-2 rounded-md border border-line bg-white px-2 py-1.5"
            />
          </label>
          <button type="submit" className="rounded-md border border-line px-3 py-1.5">
            View
          </button>
          <a
            href={`/staff/report.csv?month=${month}`}
            className="rounded-md bg-accent px-3 py-1.5 text-white hover:bg-accent-dark"
          >
            Download CSV
          </a>
        </form>
      </div>

      <p className="mt-2 text-sm font-medium">{formatMonthLabel(month)}</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Hours tutored" value={report.totals.hours.toFixed(1)} />
        <Stat label="Sessions held" value={String(report.totals.sessionsHeld)} />
        <Stat label="Unassigned" value={String(unassignedCount)} />
        <Stat label="Currently stopped" value={String(currentlyStoppedCount)} />
      </div>

      <Card className="mt-8 overflow-x-auto">
        <h2 className="text-lg font-semibold">By tutor</h2>
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
            {report.byTutor.map((row) => (
              <tr key={row.tutorId} className="border-t border-line">
                <td className="py-2">{row.tutorName}</td>
                <td>{row.studentCount}</td>
                <td>{row.sessionsHeld}</td>
                <td>{row.hours.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card className="mt-6 overflow-x-auto">
        <h2 className="text-lg font-semibold">By student</h2>
        <table className="mt-3 w-full text-left text-sm">
          <thead className="text-muted">
            <tr>
              <th className="pb-2 font-medium">Student</th>
              <th className="pb-2 font-medium">Tutor</th>
              <th className="pb-2 font-medium">Hours</th>
              <th className="pb-2 font-medium">SA / TA / H</th>
              <th className="pb-2 font-medium">Achievements</th>
            </tr>
          </thead>
          <tbody>
            {report.byStudent.map((row) => {
              const unassigned = !row.tutorId;
              return (
              <tr
                key={row.studentId}
                className={`border-t border-line ${
                  row.currentlyStopped
                    ? "bg-stopped/[0.06]"
                    : unassigned
                      ? "bg-waitlist/[0.08]"
                      : ""
                }`}
              >
                <td className="py-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/students/${row.studentId}`} className="underline decoration-line">
                      {row.studentName}
                    </Link>
                    <StudentStatus unassigned={unassigned} stopped={row.currentlyStopped} />
                  </div>
                  {row.stopped ? (
                    <div className="text-xs text-muted">Stopped this month</div>
                  ) : null}
                </td>
                <td>{unassigned ? "—" : row.tutorName}</td>
                <td>{row.hours.toFixed(1)}</td>
                <td>
                  {row.studentAbsent} / {row.tutorAbsent} / {row.holidays}
                </td>
                <td className="max-w-xs text-muted">
                  {row.newAchievements.length ? row.newAchievements.join(", ") : "—"}
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      <Card className="mt-6">
        <h2 className="text-lg font-semibold">Add a student</h2>
        <p className="mt-1 text-sm text-muted">
          Staff enroll students. Meeting days, times, and location are filled in by the assigned
          tutor.
        </p>
        <div className="mt-3">
          <NewStudentForm tutors={tutors} />
        </div>
      </Card>

      <Card className="mt-6">
        <h2 className="text-lg font-semibold">Needs attention</h2>
        <p className="mt-1 text-sm text-muted">
          Waitlist (no tutor) and students whose tutoring has been stopped.
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
        <p className="mt-1 text-sm text-muted">
          Staff assign and transfer students. Tutors cannot change who they work with.
        </p>
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
          <Link href={`/students/${student.id}`} className="font-medium underline decoration-line">
            {student.name}
          </Link>
          <StudentStatus unassigned={unassigned} stopped={stopped} />
        </div>
        <div className="text-muted">{student.site}</div>
      </div>
      <AssignmentForm
        studentId={student.id}
        tutors={tutors}
        currentTutorId={assignment?.tutorId ?? null}
      />
    </li>
  );
}
