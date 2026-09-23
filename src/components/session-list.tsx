"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteSession } from "@/app/actions";
import { Modal } from "./modal";
import { SessionForm } from "./session-form";
import { studentTint } from "@/lib/tutor-style";

type StudentOption = { id: string; name: string };

type SessionRow = {
  id: string;
  studentId: string;
  studentName?: string;
  date: Date | string;
  kind: string;
  hours: number | null;
  note: string | null;
  editable?: boolean;
};

function dateValue(date: Date | string) {
  const value = typeof date === "string" ? new Date(date) : date;
  return value.toISOString().slice(0, 10);
}

export function SessionList({
  sessions,
  students,
  canEdit,
  roster = [],
  emptyLabel = "No records yet.",
}: {
  sessions: (SessionRow & { summary: string; detail?: string })[];
  students: StudentOption[];
  canEdit: boolean;
  roster?: string[];
  emptyLabel?: string;
}) {
  const [editing, setEditing] = useState<SessionRow | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const router = useRouter();

  return (
    <>
      <ul className="mt-3 divide-y divide-line text-sm">
        {sessions.length === 0 ? (
          <li className="py-2 text-muted">{emptyLabel}</li>
        ) : (
          sessions.map((session) => {
            const tint = session.studentName ? studentTint(session.studentId, roster) : null;
            return (
            <li
              key={session.id}
              className="flex items-start justify-between gap-3 rounded-md px-2 py-2"
              style={tint ? { background: tint.bg } : undefined}
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  {session.studentName && tint ? (
                    <span className="font-medium" style={{ color: tint.text }}>
                      {session.studentName}
                    </span>
                  ) : null}
                  <span>{session.summary}</span>
                </div>
                {session.detail ? <div className="text-muted">{session.detail}</div> : null}
              </div>
              {canEdit && session.editable !== false ? (
                <button
                  type="button"
                  onClick={() => {
                    setEditing(session);
                    setConfirmDelete(false);
                  }}
                  className="text-muted hover:text-foreground"
                >
                  Edit
                </button>
              ) : null}
            </li>
            );
          })
        )}
      </ul>

      <Modal
        open={Boolean(editing)}
        title="Edit session"
        onClose={() => {
          setEditing(null);
          setConfirmDelete(false);
        }}
      >
        {editing ? (
          <div className="grid gap-4">
            <SessionForm
              students={students}
              defaultStudentId={editing.studentId}
              session={{
                id: editing.id,
                date: dateValue(editing.date),
                kind: editing.kind,
                hours: editing.hours,
                note: editing.note,
              }}
              onSuccess={() => {
                setEditing(null);
                router.refresh();
              }}
            />
            <div className="border-t border-line pt-3">
              {confirmDelete ? (
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span>Remove this record?</span>
                  <button
                    type="button"
                    className="rounded-md bg-stopped px-3 py-1.5 text-white"
                    onClick={async () => {
                      await deleteSession(editing.id);
                      setEditing(null);
                      setConfirmDelete(false);
                      router.refresh();
                    }}
                  >
                    Yes, remove
                  </button>
                  <button
                    type="button"
                    className="text-muted hover:text-foreground"
                    onClick={() => setConfirmDelete(false)}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="text-sm text-stopped hover:underline"
                  onClick={() => setConfirmDelete(true)}
                >
                  Remove record
                </button>
              )}
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  );
}

export function LogSessionButton({
  students,
  defaultStudentId,
}: {
  students: StudentOption[];
  defaultStudentId?: string;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  if (students.length === 0) return null;
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md border border-line bg-white px-3 py-1.5 text-sm font-medium hover:bg-background"
      >
        Log a session
      </button>
      <Modal open={open} title="Log a session" onClose={() => setOpen(false)}>
        <SessionForm
          students={students}
          defaultStudentId={defaultStudentId}
          onSuccess={() => {
            setOpen(false);
            router.refresh();
          }}
        />
      </Modal>
    </>
  );
}
