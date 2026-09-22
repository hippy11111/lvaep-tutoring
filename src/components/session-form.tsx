"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { logSession } from "@/app/actions";
import { calendarDateKey } from "@/lib/dates";

const KINDS = [
  { value: "HELD", label: "Session held" },
  { value: "STUDENT_ABSENT", label: "Student absent (SA)" },
  { value: "TUTOR_ABSENT", label: "Tutor absent (TA)" },
  { value: "HOLIDAY", label: "Holiday (H)" },
];

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-dark disabled:opacity-60"
    >
      {pending ? "Saving…" : "Save record"}
    </button>
  );
}

export function SessionForm({
  students,
  defaultStudentId,
}: {
  students: { id: string; name: string }[];
  defaultStudentId?: string;
}) {
  const [kind, setKind] = useState("HELD");
  const [state, action] = useActionState(logSession, null);
  const today = calendarDateKey().date;

  return (
    <form action={action} className="grid gap-3 sm:grid-cols-2">
      {state && !state.ok ? (
        <p className="sm:col-span-2 text-sm font-medium text-stopped">{state.error}</p>
      ) : null}
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
        <div className="self-end text-sm text-muted">
          No hours recorded for absences or holidays.
        </div>
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
        <SaveButton />
      </div>
    </form>
  );
}
