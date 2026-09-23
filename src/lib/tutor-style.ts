export type TutorTint = { bg: string; text: string };

const TUTOR_PALETTE: TutorTint[] = [
  { bg: "#dbeafe", text: "#1e3a8a" },
  { bg: "#fce7f3", text: "#9d174d" },
  { bg: "#dcfce7", text: "#166534" },
  { bg: "#ffedd5", text: "#9a3412" },
  { bg: "#ede9fe", text: "#5b21b6" },
  { bg: "#e0f2fe", text: "#075985" },
];

const STUDENT_PALETTE: TutorTint[] = [
  { bg: "#bfdbfe", text: "#1e3a8a" },
  { bg: "#fbcfe8", text: "#9d174d" },
  { bg: "#bbf7d0", text: "#14532d" },
  { bg: "#fdba74", text: "#7c2d12" },
  { bg: "#ddd6fe", text: "#4c1d95" },
  { bg: "#fde047", text: "#713f12" },
  { bg: "#5eead4", text: "#134e4a" },
  { bg: "#fda4af", text: "#881337" },
  { bg: "#93c5fd", text: "#1e40af" },
  { bg: "#86efac", text: "#166534" },
];

const UNASSIGNED: TutorTint = { bg: "#f3f4f6", text: "#4b5563" };

function hashTint(id: string, palette: TutorTint[]): TutorTint {
  let hash = 0;
  for (const char of id) hash += char.charCodeAt(0);
  return palette[hash % palette.length];
}

export function tutorTint(tutorId: string | null | undefined): TutorTint {
  if (!tutorId) return UNASSIGNED;
  return hashTint(tutorId, TUTOR_PALETTE);
}

export function studentTint(studentId: string, roster: string[] = []): TutorTint {
  const unique = [...new Set(roster)];
  const index = unique.indexOf(studentId);
  if (index >= 0) return STUDENT_PALETTE[index % STUDENT_PALETTE.length];
  return hashTint(studentId, STUDENT_PALETTE);
}
