"use client";

import { useRouter } from "next/navigation";
import { StudentStatus } from "./status-badge";
import { tutorTint } from "@/lib/tutor-style";
import type { CategoryProgress } from "@/lib/goals";

type Row = {
  studentId: string;
  studentName: string;
  tutorId: string;
  tutorName: string;
  hours: number;
  studentAbsent: number;
  tutorAbsent: number;
  holidays: number;
  achievementByCategory: CategoryProgress[];
  currentlyStopped: boolean;
  stopped: boolean;
};

export function StudentBreakdownTable({ rows }: { rows: Row[] }) {
  const router = useRouter();
  return (
    <table className="mt-3 w-full text-left text-sm">
      <thead className="text-muted">
        <tr>
          <th className="pb-2 pl-4 pr-3 font-medium">Student</th>
          <th className="px-3 pb-2 font-medium">Tutor</th>
          <th className="px-3 pb-2 font-medium">Hours</th>
          <th className="w-12 px-3 pb-2 text-center font-medium">SA</th>
          <th className="w-12 px-3 pb-2 text-center font-medium">TA</th>
          <th className="w-12 px-3 pb-2 text-center font-medium">H</th>
          <th className="pb-2 pl-6 pr-3 font-medium">Achievements</th>
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
              <td className="py-2.5 pl-4 pr-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{row.studentName}</span>
                  <StudentStatus unassigned={unassigned} stopped={row.currentlyStopped} />
                </div>
                {row.stopped ? (
                  <div className="text-xs text-muted">Stopped this month</div>
                ) : null}
              </td>
              <td className="px-3">
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
              <td className="px-3 tabular-nums">{row.hours.toFixed(1)}</td>
              <td className="px-3 text-center tabular-nums">{row.studentAbsent}</td>
              <td className="px-3 text-center tabular-nums">{row.tutorAbsent}</td>
              <td className="px-3 text-center tabular-nums">{row.holidays}</td>
              <td className="pl-6 pr-3">
                <span className="flex flex-wrap gap-x-3 gap-y-1 tabular-nums text-muted">
                  {row.achievementByCategory.map((item) => (
                    <span key={item.id}>
                      {item.short}: {item.attained}/{item.total}
                    </span>
                  ))}
                </span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
