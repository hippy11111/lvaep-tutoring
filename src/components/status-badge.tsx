export function StatusBadge({
  kind,
}: {
  kind: "unassigned" | "stopped";
}) {
  if (kind === "stopped") {
    return (
      <span className="inline-flex rounded-full bg-stopped/12 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-stopped">
        Stopped
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-full bg-waitlist/12 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-waitlist">
      Unassigned
    </span>
  );
}

export function StudentStatus({
  unassigned,
  stopped,
}: {
  unassigned: boolean;
  stopped: boolean;
}) {
  if (!unassigned && !stopped) return null;
  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      {unassigned ? <StatusBadge kind="unassigned" /> : null}
      {stopped ? <StatusBadge kind="stopped" /> : null}
    </span>
  );
}
