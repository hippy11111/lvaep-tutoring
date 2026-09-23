"use client";

import { useRouter } from "next/navigation";
import { StudentStatus } from "./status-badge";
import { tutorTint } from "@/lib/tutor-style";

type Row = {
  studentId: string;
  studentName: string;
  tutorId: string;
  tutorName: string;
  hours: number;
  studentAbsent: number;
  tutorAbsent: number;
  holidays: number;
  newAchievements: string[];
  currentlyStopped: boolean;
  stopped: boolean;
};

export function StudentBreakdownTable({ rows }: { rows: Row[] }) {
  const router = useRouter();
  return (
    <table className="mt-3 w-full text-left text-sm">
      <thead className="text-muted">
        <tr>
          <th className="pb-2 font-medium">Student</th>
          <th className="pb-2 font-medium">Tutor</th>
          <th className="pb-2 font-medium">Hours</th>
          <th className="pb-2 font-medium">
            <span className="inline-grid w-full grid-cols-3 gap-1 text-center">
              <span>SA</span>
              <span>TA</span>
              <span>H</span>
            </span>
          </th>
          <th className="pb-2 font-medium">Achievements</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => {
          const unassigned = !row.tutorId;
          const tint = tutorTint(row.tutorId || null);
          return (
            <tr
              key={row.studentId}
              onClick={() => router.push(`/students/${row.studentId}`)}
              className={`cursor-pointer border-t border-line ${
                index % 2 === 0 ? "bg-sky-50" : "bg-white"
              } hover:bg-sky-100`}
            >
              <td className="py-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{row.studentName}</span>
                  <StudentStatus unassigned={unassigned} stopped={row.currentlyStopped} />
                </div>
                {row.stopped ? (
                  <div className="text-xs text-muted">Stopped this month</div>
                ) : null}
              </td>
              <td>
                {unassigned ? (
                  "—"
                ) : (
                  <span
                    className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium"
                    style={{ background: tint.bg, color: tint.text }}
                  >
                    {row.tutorName}
                  </span>
                )}
              </td>
              <td>{row.hours.toFixed(1)}</td>
              <td>
                <span className="inline-grid w-full grid-cols-3 gap-1 text-center tabular-nums">
                  <span>{row.studentAbsent}</span>
                  <span>{row.tutorAbsent}</span>
                  <span>{row.holidays}</span>
                </span>
              </td>
              <td className="max-w-xs text-muted">
                {row.newAchievements.length ? row.newAchievements.join(", ") : "—"}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
