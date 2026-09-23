export type GoalCategory =
  | "economic"
  | "educational"
  | "family"
  | "community"
  | "other";

export type Goal = {
  id: string;
  category: GoalCategory;
  label: string;
  nrs: boolean;
};

export const GOAL_CATEGORIES: { id: GoalCategory; title: string }[] = [
  { id: "economic", title: "A. Economic" },
  { id: "educational", title: "B. Educational" },
  { id: "family", title: "C. Family" },
  { id: "community", title: "D. Societal / Community" },
  { id: "other", title: "E. Other" },
];

export const GOALS: Goal[] = [
  { id: "enter-employment", category: "economic", label: "Enter employment", nrs: true },
  { id: "retain-employment", category: "economic", label: "Retain employment", nrs: true },
  { id: "leave-public-assistance", category: "economic", label: "Leave public assistance", nrs: false },
  {
    id: "work-based-learner-goal",
    category: "educational",
    label: "Achieve work-based project learner goal",
    nrs: false,
  },
  {
    id: "enter-occupational-training",
    category: "educational",
    label: "Enter occupational skills training program",
    nrs: true,
  },
  {
    id: "enter-postsecondary",
    category: "educational",
    label: "Enter postsecondary education",
    nrs: true,
  },
  {
    id: "obtain-hs-diploma",
    category: "educational",
    label: "Obtain high school diploma",
    nrs: true,
  },
  {
    id: "help-more-with-school",
    category: "family",
    label: "Help more frequently with school",
    nrs: false,
  },
  {
    id: "contact-teachers",
    category: "family",
    label: "Increase contact with child(ren)'s teachers",
    nrs: false,
  },
  {
    id: "school-activities",
    category: "family",
    label: "More involvement in child(ren)'s school activities",
    nrs: false,
  },
  {
    id: "purchase-books",
    category: "family",
    label: "Purchase books or magazines",
    nrs: false,
  },
  { id: "read-to-children", category: "family", label: "Read to child(ren)", nrs: false },
  {
    id: "visit-library",
    category: "family",
    label: "Visit the library (with/for child(ren))",
    nrs: false,
  },
  { id: "obtain-citizenship", category: "community", label: "Obtain citizenship", nrs: true },
  { id: "civics-skills", category: "community", label: "Achieve civics skills", nrs: false },
  {
    id: "community-activities",
    category: "community",
    label: "Increase involvement in community activities",
    nrs: false,
  },
  { id: "vote", category: "community", label: "Vote or register to vote", nrs: false },
  { id: "other-1", category: "other", label: "Other", nrs: false },
  { id: "other-2", category: "other", label: "Other", nrs: false },
];

export function isOtherGoal(id: string) {
  return id === "other" || id.startsWith("other-");
}

export function goalById(id: string) {
  return GOALS.find((goal) => goal.id === id);
}

export function achievementLabel(goalId: string, note?: string | null) {
  if (isOtherGoal(goalId)) return note?.trim() || "Other";
  return goalById(goalId)?.label ?? goalId;
}

export type CategoryProgress = {
  id: GoalCategory;
  short: string;
  attained: number;
  total: number;
};

const CATEGORY_LETTERS: Record<GoalCategory, string> = {
  economic: "A",
  educational: "B",
  family: "C",
  community: "D",
  other: "E",
};

export function categoryProgress(goalIds: string[]): CategoryProgress[] {
  return GOAL_CATEGORIES.map((category) => {
    const ids = goalIds.filter((id) =>
      category.id === "other"
        ? isOtherGoal(id)
        : goalById(id)?.category === category.id,
    );
    const catalog = GOALS.filter((goal) => goal.category === category.id).length;
    return {
      id: category.id,
      short: CATEGORY_LETTERS[category.id],
      attained: ids.length,
      total: Math.max(catalog, ids.length),
    };
  });
}
