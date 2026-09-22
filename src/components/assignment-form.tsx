"use client";

import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { setStudentAssignment } from "@/app/actions";

type TutorOption = { id: string; name: string };

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-accent px-3 py-2 text-sm text-white hover:bg-accent-dark disabled:opacity-60"
    >
      {pending ? "Saving…" : "Save assignment"}
    </button>
  );
}

export function AssignmentForm({
  studentId,
  tutors,
  currentTutorId,
}: {
  studentId: string;
  tutors: TutorOption[];
  currentTutorId: string | null;
}) {
  const saved = currentTutorId ?? "";
  const [tutorId, setTutorId] = useState(saved);
  const router = useRouter();

  useEffect(() => {
    setTutorId(saved);
  }, [saved]);

  return (
    <form
      action={async (formData) => {
        await setStudentAssignment(formData);
        router.refresh();
      }}
      className="flex flex-wrap items-end gap-2"
    >
      <input type="hidden" name="studentId" value={studentId} />
      <label className="grid gap-1 text-sm">
        Tutor
        <select
          name="tutorId"
          value={tutorId}
          onChange={(event) => setTutorId(event.target.value)}
          className="min-w-48 rounded-md border border-line bg-white px-3 py-2"
        >
          <option value="">Unassigned</option>
          {tutors.map((tutor) => (
            <option key={tutor.id} value={tutor.id}>
              {tutor.name}
            </option>
          ))}
        </select>
      </label>
      <SaveButton />
    </form>
  );
}
