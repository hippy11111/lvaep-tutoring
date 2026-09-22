import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { formatMonthLabel, monthKey } from "@/lib/dates";
import { getMonthlyReport } from "@/lib/reports";
import { prisma } from "@/lib/prisma";
import { Shell, Card } from "@/components/shell";
import { AssignmentForm } from "@/components/assignment-form";
import { NewStudentForm } from "@/components/new-student-form";

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

      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        <Stat label="Hours tutored" value={report.totals.hours.toFixed(1)} />
        <Stat label="Sessions held" value={String(report.totals.sessionsHeld)} />
        <Stat label="New achievements" value={String(report.totals.newAchievements)} />
        <Stat label="Students stopped" value={String(report.totals.stopped)} />
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
            {report.byStudent.map((row) => (
              <tr key={row.studentId} className="border-t border-line">
                <td className="py-2">
                  <Link href={`/students/${row.studentId}`} className="underline decoration-line">
                    {row.studentName}
                  </Link>
                  {row.stopped ? (
                    <span className="ml-2 text-xs text-muted">stopped</span>
                  ) : null}
                </td>
                <td>{row.tutorName}</td>
                <td>{row.hours.toFixed(1)}</td>
                <td>
                  {row.studentAbsent} / {row.tutorAbsent} / {row.holidays}
                </td>
                <td className="max-w-xs text-muted">
                  {row.newAchievements.length ? row.newAchievements.join(", ") : "—"}
                </td>
              </tr>
            ))}
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
        <h2 className="text-lg font-semibold">Assignments</h2>
        <p className="mt-1 text-sm text-muted">
          Staff assign and transfer students. Tutors cannot change who they work with.
        </p>
        <ul className="mt-3 grid gap-3 text-sm">
          {roster.map((student) => {
            const assignment = student.assignments[0];
            return (
              <li
                key={student.id}
                className="flex flex-col gap-2 border-b border-line py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <Link href={`/students/${student.id}`} className="font-medium underline decoration-line">
                    {student.name}
                  </Link>
                  <div className="text-muted">
                    {student.site}
                    {student.stoppedAt ? " · stopped" : ""}
                    {!assignment ? " · unassigned" : ""}
                  </div>
                </div>
                <AssignmentForm
                  studentId={student.id}
                  tutors={tutors}
                  currentTutorId={assignment?.tutorId ?? null}
                />
              </li>
            );
          })}
        </ul>
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
