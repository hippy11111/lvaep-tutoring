import { setStudentAssignment } from "@/app/actions";

type TutorOption = { id: string; name: string };

export function AssignmentForm({
  studentId,
  tutors,
  currentTutorId,
}: {
  studentId: string;
  tutors: TutorOption[];
  currentTutorId: string | null;
}) {
  return (
    <form action={setStudentAssignment} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="studentId" value={studentId} />
      <label className="grid gap-1 text-sm">
        Tutor
        <select
          name="tutorId"
          defaultValue={currentTutorId ?? ""}
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
      <button
        type="submit"
        className="rounded-md bg-accent px-3 py-2 text-sm text-white hover:bg-accent-dark"
      >
        Save assignment
      </button>
    </form>
  );
}
