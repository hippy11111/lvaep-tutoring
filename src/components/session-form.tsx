"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { logSession, updateSession, type ActionResult } from "@/app/actions";
import { calendarDateKey } from "@/lib/dates";

const KINDS = [
  { value: "HELD", label: "Session held" },
  { value: "STUDENT_ABSENT", label: "Student absent (SA)" },
  { value: "TUTOR_ABSENT", label: "Tutor absent (TA)" },
  { value: "HOLIDAY", label: "Holiday (H)" },
];

function SaveButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-dark disabled:opacity-60"
    >
      {pending ? "Saving…" : label}
    </button>
  );
}

export function SessionForm({
  students,
  defaultStudentId,
  session,
  onSuccess,
}: {
  students: { id: string; name: string }[];
  defaultStudentId?: string;
  session?: {
    id: string;
    date: string;
    kind: string;
    hours: number | null;
    note: string | null;
  };
  onSuccess?: () => void;
}) {
  const [kind, setKind] = useState(session?.kind ?? "HELD");
  const [state, action] = useActionState(
    session ? updateSession : logSession,
    null as ActionResult | null,
  );
  const today = calendarDateKey().date;

  useEffect(() => {
    if (state?.ok) onSuccess?.();
  }, [state, onSuccess]);

  return (
    <form action={action} className="grid gap-3 sm:grid-cols-2">
      {session ? <input type="hidden" name="sessionId" value={session.id} /> : null}
      {state && !state.ok ? (
        <p className="sm:col-span-2 text-sm font-medium text-stopped">{state.error}</p>
      ) : null}
      <label className="grid gap-1 text-sm">
        Student
        <select
          name="studentId"
          required
          disabled={Boolean(session)}
          defaultValue={defaultStudentId ?? students[0]?.id}
          className="rounded-md border border-line bg-white px-3 py-2 disabled:bg-background"
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
          defaultValue={session?.date ?? today}
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
            defaultValue={session?.hours ?? 2}
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
          defaultValue={session?.note ?? ""}
          placeholder="Makeup session, homework credit, etc."
          className="rounded-md border border-line bg-white px-3 py-2"
        />
      </label>
      <div className="sm:col-span-2">
        <SaveButton label={session ? "Save changes" : "Save record"} />
      </div>
    </form>
  );
}
