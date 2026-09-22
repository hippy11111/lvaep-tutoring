"use client";

import { useState } from "react";
import { logSession } from "@/app/actions";

const KINDS = [
  { value: "HELD", label: "Session held" },
  { value: "STUDENT_ABSENT", label: "Student absent (SA)" },
  { value: "TUTOR_ABSENT", label: "Tutor absent (TA)" },
  { value: "HOLIDAY", label: "Holiday (H)" },
];

export function SessionForm({
  students,
  defaultStudentId,
}: {
  students: { id: string; name: string }[];
  defaultStudentId?: string;
}) {
  const [kind, setKind] = useState("HELD");
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={logSession} className="grid gap-3 sm:grid-cols-2">
      <label className="grid gap-1 text-sm">
        Student
        <select
          name="studentId"
          required
          defaultValue={defaultStudentId ?? students[0]?.id}
          className="rounded-md border border-line bg-white px-3 py-2"
        >
          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.name}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm">
        Date
        <input
          type="date"
          name="date"
          required
          defaultValue={today}
          className="rounded-md border border-line bg-white px-3 py-2"
        />
      </label>
      <label className="grid gap-1 text-sm">
        What happened
        <select
          name="kind"
          value={kind}
          onChange={(event) => setKind(event.target.value)}
          className="rounded-md border border-line bg-white px-3 py-2"
        >
          {KINDS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      {kind === "HELD" ? (
        <label className="grid gap-1 text-sm">
          Hours (include completed homework)
          <input
            type="number"
            name="hours"
            min={0.25}
            max={8}
            step={0.25}
            defaultValue={2}
            required
            className="rounded-md border border-line bg-white px-3 py-2"
          />
        </label>
      ) : (
        <div className="text-sm text-muted self-end">No hours recorded for absences or holidays.</div>
      )}
      <label className="grid gap-1 text-sm sm:col-span-2">
        Note (optional)
        <input
          type="text"
          name="note"
          placeholder="Makeup session, homework credit, etc."
          className="rounded-md border border-line bg-white px-3 py-2"
        />
      </label>
      <div className="sm:col-span-2">
        <button
          type="submit"
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-dark"
        >
          Save record
        </button>
      </div>
    </form>
  );
}
