"use client";

import { useRouter } from "next/navigation";
import { Modal } from "./modal";
import { NewStudentForm } from "./new-student-form";
import { useState } from "react";

export function AddStudentButton({
  tutors,
}: {
  tutors: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md border border-line bg-white px-3 py-1.5 text-sm font-medium hover:bg-background"
      >
        Add student
      </button>
      <Modal open={open} title="Add a student" onClose={() => setOpen(false)}>
        <NewStudentForm tutors={tutors} />
      </Modal>
    </>
  );
}

export function MonthPicker({ month }: { month: string }) {
  const router = useRouter();
  return (
    <label className="grid gap-1 text-sm">
      <span className="text-muted">Month</span>
      <input
        type="month"
        value={month}
        onChange={(event) => router.push(`/staff?month=${event.target.value}`)}
        className="rounded-md border border-line bg-white px-2 py-1.5"
      />
    </label>
  );
}
