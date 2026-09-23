import { createStudent } from "@/app/actions";
import { TUTORING_SITES } from "@/lib/sites";

type TutorOption = { id: string; name: string };

export function NewStudentForm({ tutors }: { tutors: TutorOption[] }) {
  return (
    <form action={createStudent} className="grid gap-3 sm:grid-cols-2">
      <label className="grid gap-1 text-sm">
        Student name
        <input
          name="name"
          required
          placeholder="Full name"
          className="rounded-md border border-line bg-white px-3 py-2"
        />
      </label>
      <label className="grid gap-1 text-sm">
        Assign tutor (optional)
        <select name="tutorId" defaultValue="" className="rounded-md border border-line bg-white px-3 py-2">
          <option value="">Unassigned</option>
          {tutors.map((tutor) => (
            <option key={tutor.id} value={tutor.id}>
              {tutor.name}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm sm:col-span-2">
        Tutoring site (optional — tutor can set this)
        <input
          name="site"
          list="tutoring-sites"
          placeholder="Bloomfield Public Library"
          className="rounded-md border border-line bg-white px-3 py-2"
        />
        <datalist id="tutoring-sites">
          {TUTORING_SITES.map((site) => (
            <option key={site} value={site} />
          ))}
        </datalist>
      </label>
      <div className="sm:col-span-2">
        <button
          type="submit"
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-dark"
        >
          Add student
        </button>
      </div>
    </form>
  );
}
