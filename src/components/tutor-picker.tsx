"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setStudentTutor } from "@/app/actions";
import { tutorTint } from "@/lib/tutor-style";
import { Modal } from "./modal";

type TutorOption = { id: string; name: string };

export function TutorPicker({
  studentId,
  tutors,
  currentTutorId,
  compact = false,
}: {
  studentId: string;
  tutors: TutorOption[];
  currentTutorId: string | null;
  compact?: boolean;
}) {
  const saved = currentTutorId ?? "";
  const [pendingId, setPendingId] = useState<string | null>(null);
  const router = useRouter();
  const tint = tutorTint(saved);
  const currentName = tutors.find((tutor) => tutor.id === saved)?.name ?? "Unassigned";
  const nextName =
    pendingId === ""
      ? "Unassigned"
      : tutors.find((tutor) => tutor.id === pendingId)?.name ?? "Unassigned";

  return (
    <>
      <select
        value={saved}
        onChange={(event) => setPendingId(event.target.value)}
        className="rounded-md border border-line px-2 py-1 text-sm"
        style={{ background: tint.bg, color: tint.text }}
      >
        <option value="">Unassigned</option>
        {tutors.map((tutor) => (
          <option key={tutor.id} value={tutor.id}>
            {tutor.name}
          </option>
        ))}
      </select>
      <Modal
        open={pendingId !== null}
        title="Change tutor?"
        onClose={() => setPendingId(null)}
      >
        <p className="text-sm">
          {compact ? "" : null}
          Change this student from <span className="font-medium">{currentName}</span> to{" "}
          <span className="font-medium">{nextName}</span>?
        </p>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            className="rounded-md bg-accent px-3 py-2 text-sm text-white hover:bg-accent-dark"
            onClick={async () => {
              if (pendingId === null) return;
              await setStudentTutor(studentId, pendingId);
              setPendingId(null);
              router.refresh();
            }}
          >
            Confirm
          </button>
          <button
            type="button"
            className="rounded-md border border-line px-3 py-2 text-sm"
            onClick={() => setPendingId(null)}
          >
            Cancel
          </button>
        </div>
      </Modal>
    </>
  );
}
