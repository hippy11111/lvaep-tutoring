"use client";

import { useRouter } from "next/navigation";
import { Modal } from "./modal";
import { NewStudentForm } from "./new-student-form";
import { shiftMonth } from "@/lib/dates";
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
  const go = (next: string) => router.push(`/staff?month=${next}`);

  return (
    <div className="text-sm">
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label="Previous month"
          onClick={() => go(shiftMonth(month, -1))}
          className="rounded-md border border-line bg-white px-2 py-1.5 font-medium hover:bg-background"
        >
          ‹
        </button>
        <input
          type="month"
          value={month}
          aria-label="Choose month"
          onChange={(event) => go(event.target.value)}
          className="rounded-md border border-line bg-white px-2 py-1.5"
        />
        <button
          type="button"
          aria-label="Next month"
          onClick={() => go(shiftMonth(month, 1))}
          className="rounded-md border border-line bg-white px-2 py-1.5 font-medium hover:bg-background"
        >
          ›
        </button>
      </div>
    </div>
  );
}
