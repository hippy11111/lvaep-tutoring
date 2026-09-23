"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { stopTutoring } from "@/app/actions";
import { Modal } from "./modal";

export function StopTutoring({ studentId }: { studentId: string }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        className="rounded-md bg-stopped px-3 py-2 text-sm font-medium text-white hover:opacity-90"
      >
        Mark as stopped
      </button>
      <Modal open={confirmOpen} title="Stop tutoring?" onClose={() => setConfirmOpen(false)}>
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            const data = new FormData();
            data.set("studentId", studentId);
            data.set("reason", reason);
            await stopTutoring(data);
            setConfirmOpen(false);
            setSuccess(true);
            router.refresh();
          }}
          className="grid gap-3"
        >
          <p className="text-sm">This student will stay on your list as no longer being tutored. You will not be able to add or edit sessions.</p>
          <label className="grid gap-1 text-sm">
            Reason
            <input
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              required
              className="rounded-md border border-line bg-white px-3 py-2"
            />
          </label>
          <div className="flex gap-2">
            <button type="submit" className="rounded-md bg-stopped px-3 py-2 text-sm text-white">
              Confirm stop
            </button>
            <button
              type="button"
              className="rounded-md border border-line px-3 py-2 text-sm"
              onClick={() => setConfirmOpen(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
      <Modal open={success} title="Stopped" onClose={() => setSuccess(false)}>
        <p className="text-sm">Successfully marked as stopped.</p>
        <button
          type="button"
          className="mt-4 rounded-md bg-accent px-3 py-2 text-sm text-white"
          onClick={() => setSuccess(false)}
        >
          OK
        </button>
      </Modal>
    </>
  );
}
