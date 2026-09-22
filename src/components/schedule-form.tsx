import { updateStudentSchedule } from "@/app/actions";
import { TUTORING_SITES } from "@/lib/sites";

export function ScheduleForm({
  studentId,
  site,
  days,
  times,
}: {
  studentId: string;
  site: string;
  days: string;
  times: string;
}) {
  return (
    <form action={updateStudentSchedule} className="grid gap-3 sm:grid-cols-2">
      <input type="hidden" name="studentId" value={studentId} />
      <label className="grid gap-1 text-sm sm:col-span-2">
        Location
        <input
          name="site"
          required
          list="student-sites"
          defaultValue={site}
          placeholder="Bloomfield Public Library"
          className="rounded-md border border-line bg-white px-3 py-2"
        />
        <datalist id="student-sites">
          {TUTORING_SITES.map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>
      </label>
      <label className="grid gap-1 text-sm">
        Day(s)
        <input
          name="days"
          required
          defaultValue={days}
          placeholder="Tue / Thu"
          className="rounded-md border border-line bg-white px-3 py-2"
        />
      </label>
      <label className="grid gap-1 text-sm">
        Time(s)
        <input
          name="times"
          required
          defaultValue={times}
          placeholder="6:00–8:00 pm"
          className="rounded-md border border-line bg-white px-3 py-2"
        />
      </label>
      <div className="sm:col-span-2">
        <button
          type="submit"
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-dark"
        >
          Save schedule
        </button>
      </div>
    </form>
  );
}
