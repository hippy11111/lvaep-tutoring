import { SessionKind } from "@prisma/client";
import { prisma } from "./prisma";
import { parseMonth } from "./dates";
import { goalById } from "./goals";

export type StudentReportRow = {
  studentId: string;
  studentName: string;
  tutorId: string;
  tutorName: string;
  site: string;
  sessionsHeld: number;
  hours: number;
  tutorAbsent: number;
  studentAbsent: number;
  holidays: number;
  newAchievements: string[];
  stopped: boolean;
  stoppedReason: string | null;
  currentlyStopped: boolean;
};

export type TutorReportRow = {
  tutorId: string;
  tutorName: string;
  studentCount: number;
  sessionsHeld: number;
  hours: number;
};

export type MonthlyReport = {
  month: string;
  byStudent: StudentReportRow[];
  byTutor: TutorReportRow[];
  totals: {
    hours: number;
    sessionsHeld: number;
    tutorAbsent: number;
    studentAbsent: number;
    holidays: number;
    newAchievements: number;
    stopped: number;
  };
};

function emptyCounts() {
  return {
    sessionsHeld: 0,
    hours: 0,
    tutorAbsent: 0,
    studentAbsent: 0,
    holidays: 0,
  };
}

function applyKind(
  counts: ReturnType<typeof emptyCounts>,
  kind: SessionKind,
  hours: number | null,
) {
  if (kind === "HELD") {
    counts.sessionsHeld += 1;
    counts.hours += hours ?? 0;
  } else if (kind === "TUTOR_ABSENT") counts.tutorAbsent += 1;
  else if (kind === "STUDENT_ABSENT") counts.studentAbsent += 1;
  else counts.holidays += 1;
}

export async function getMonthlyReport(month: string): Promise<MonthlyReport | null> {
  const range = parseMonth(month);
  if (!range) return null;

  const [students, sessions, achievements] = await Promise.all([
    prisma.student.findMany({
      include: { assignments: { include: { tutor: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.session.findMany({
      where: { date: { gte: range.start, lt: range.end } },
    }),
    prisma.achievement.findMany({
      where: { attainedAt: { gte: range.start, lt: range.end } },
    }),
  ]);

  const sessionByStudent = new Map<string, ReturnType<typeof emptyCounts>>();
  for (const session of sessions) {
    const counts = sessionByStudent.get(session.studentId) ?? emptyCounts();
    applyKind(counts, session.kind, session.hours);
    sessionByStudent.set(session.studentId, counts);
  }

  const achievementsByStudent = new Map<string, string[]>();
  for (const achievement of achievements) {
    const label = goalById(achievement.goalId)?.label ?? achievement.goalId;
    const list = achievementsByStudent.get(achievement.studentId) ?? [];
    list.push(label);
    achievementsByStudent.set(achievement.studentId, list);
  }

  const byStudent: StudentReportRow[] = students.map((student) => {
    const assignment = student.assignments[0];
    const counts = sessionByStudent.get(student.id) ?? emptyCounts();
    const stopped =
      student.stoppedAt !== null &&
      student.stoppedAt >= range.start &&
      student.stoppedAt < range.end;
    const currentlyStopped = student.stoppedAt !== null;
    return {
      studentId: student.id,
      studentName: student.name,
      tutorId: assignment?.tutorId ?? "",
      tutorName: assignment?.tutor.name ?? "Unassigned",
      site: student.site,
      ...counts,
      newAchievements: achievementsByStudent.get(student.id) ?? [],
      stopped,
      stoppedReason: stopped ? student.stoppedReason : null,
      currentlyStopped,
    };
  });

  const tutorMap = new Map<string, TutorReportRow>();
  for (const row of byStudent) {
    const existing = tutorMap.get(row.tutorId) ?? {
      tutorId: row.tutorId,
      tutorName: row.tutorName,
      studentCount: 0,
      sessionsHeld: 0,
      hours: 0,
    };
    existing.studentCount += row.currentlyStopped ? 0 : 1;
    existing.sessionsHeld += row.sessionsHeld;
    existing.hours += row.hours;
    tutorMap.set(row.tutorId, existing);
  }

  const totals = byStudent.reduce(
    (acc, row) => {
      acc.hours += row.hours;
      acc.sessionsHeld += row.sessionsHeld;
      acc.tutorAbsent += row.tutorAbsent;
      acc.studentAbsent += row.studentAbsent;
      acc.holidays += row.holidays;
      acc.newAchievements += row.newAchievements.length;
      acc.stopped += row.stopped ? 1 : 0;
      return acc;
    },
    {
      hours: 0,
      sessionsHeld: 0,
      tutorAbsent: 0,
      studentAbsent: 0,
      holidays: 0,
      newAchievements: 0,
      stopped: 0,
    },
  );

  return {
    month,
    byStudent,
    byTutor: [...tutorMap.values()].sort((a, b) => a.tutorName.localeCompare(b.tutorName)),
    totals,
  };
}

export function reportToCsv(report: MonthlyReport) {
  const lines = [
    ["Student", "Tutor", "Site", "Status", "Sessions held", "Hours", "TA", "SA", "H", "Achievements this month", "Stopped this month", "Stop reason"],
    ...report.byStudent.map((row) => [
      row.studentName,
      row.tutorName,
      row.site,
      row.currentlyStopped ? "Stopped" : row.tutorId ? "Active" : "Unassigned",
      String(row.sessionsHeld),
      row.hours.toFixed(1),
      String(row.tutorAbsent),
      String(row.studentAbsent),
      String(row.holidays),
      row.newAchievements.join("; "),
      row.stopped ? "Yes" : "",
      row.stoppedReason ?? "",
    ]),
  ];
  return lines
    .map((cells) =>
      cells
        .map((cell) => {
          if (/[",\n]/.test(cell)) return `"${cell.replaceAll('"', '""')}"`;
          return cell;
        })
        .join(","),
    )
    .join("\n");
}
