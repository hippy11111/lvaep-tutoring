"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateStudentSchedule } from "@/app/actions";
import { Modal } from "./modal";

export function MeetingLine({
  studentId,
  site,
  days,
  times,
  editable,
}: {
  studentId: string;
  site: string;
  days: string;
  times: string;
  editable: boolean;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const unset = site === "To be scheduled";
  const label = unset ? "Meeting not scheduled yet" : `${site} · ${days} · ${times}`;

  return (
    <p className="text-sm">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted">
        Meeting location / days / times
      </span>
      <span className="mt-0.5 flex flex-wrap items-center gap-2">
        <span>{label}</span>
        {editable ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="text-xs text-accent hover:underline"
          >
            Edit
          </button>
        ) : null}
      </span>
      <Modal open={open} title="Edit meeting schedule" onClose={() => setOpen(false)}>
        <form
          action={async (formData) => {
            await updateStudentSchedule(formData);
            setOpen(false);
            router.refresh();
          }}
          className="grid gap-3"
        >
          <input type="hidden" name="studentId" value={studentId} />
          <label className="grid gap-1 text-sm">
            Location
            <input
              name="site"
              required
              defaultValue={unset ? "" : site}
              placeholder="Library, school, or other location"
              className="rounded-md border border-line bg-white px-3 py-2"
            />
          </label>
          <label className="grid gap-1 text-sm">
            Day(s)
            <input
              name="days"
              required
              defaultValue={unset ? "" : days}
              placeholder="Tue / Thu"
              className="rounded-md border border-line bg-white px-3 py-2"
            />
          </label>
          <label className="grid gap-1 text-sm">
            Time(s)
            <input
              name="times"
              required
              defaultValue={unset ? "" : times}
              placeholder="6:00–8:00 pm"
              className="rounded-md border border-line bg-white px-3 py-2"
            />
          </label>
          <button
            type="submit"
            className="rounded-md bg-accent px-3 py-2 text-sm text-white hover:bg-accent-dark"
          >
            Save schedule
          </button>
        </form>
      </Modal>
    </p>
  );
}
