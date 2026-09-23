export type TutorTint = { bg: string; text: string };

const PALETTE: TutorTint[] = [
  { bg: "#dbeafe", text: "#1e3a8a" },
  { bg: "#fce7f3", text: "#9d174d" },
  { bg: "#dcfce7", text: "#166534" },
  { bg: "#ffedd5", text: "#9a3412" },
  { bg: "#ede9fe", text: "#5b21b6" },
  { bg: "#e0f2fe", text: "#075985" },
];

const UNASSIGNED: TutorTint = { bg: "#f3f4f6", text: "#4b5563" };

function hashTint(id: string): TutorTint {
  let hash = 0;
  for (const char of id) hash += char.charCodeAt(0);
  return PALETTE[hash % PALETTE.length];
}

export function tutorTint(tutorId: string | null | undefined): TutorTint {
  if (!tutorId) return UNASSIGNED;
  return hashTint(tutorId);
}

export function studentTint(studentId: string): TutorTint {
  return hashTint(studentId);
}
