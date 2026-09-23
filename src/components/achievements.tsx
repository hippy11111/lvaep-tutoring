"use client";

import { useMemo, useState, useTransition } from "react";
import { toggleAchievement } from "@/app/actions";
import { GOAL_CATEGORIES, GOALS, isOtherGoal } from "@/lib/goals";

type Recorded = { goalId: string; note: string | null; attainedAt: Date };

export function AchievementList({
  studentId,
  recorded,
  editable,
}: {
  studentId: string;
  recorded: Recorded[];
  editable: boolean;
}) {
  const [pending, start] = useTransition();
  const extraOthers = recorded
    .filter((item) => isOtherGoal(item.goalId) && !GOALS.some((goal) => goal.id === item.goalId))
    .map((item) => item.goalId);
  const [extraCount, setExtraCount] = useState(0);
  const otherIds = useMemo(() => {
    const ids = ["other-1", "other-2", ...extraOthers];
    for (let index = 0; index < extraCount; index += 1) {
      ids.push(`other-${3 + extraOthers.length + index}`);
    }
    return [...new Set(ids)];
  }, [extraCount, extraOthers]);

  const [notes, setNotes] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const item of recorded) {
      if (isOtherGoal(item.goalId) && item.note) initial[item.goalId] = item.note;
    }
    return initial;
  });

  return (
    <div className="grid gap-5">
      {GOAL_CATEGORIES.map((category) => {
        const goals =
          category.id === "other"
            ? otherIds.map((id) => ({ id, label: "Other", nrs: false }))
            : GOALS.filter((goal) => goal.category === category.id);
        return (
          <section key={category.id}>
            <h3 className="mb-2 text-sm font-semibold">{category.title}</h3>
            <ul className="grid gap-2">
              {goals.map((goal) => {
                const hit = recorded.find((item) => item.goalId === goal.id);
                const other = isOtherGoal(goal.id);
                return (
                  <li key={goal.id} className="grid gap-1 text-sm">
                    <div className="flex items-start gap-2">
                      {editable ? (
                        <input
                          type="checkbox"
                          className="mt-1"
                          checked={Boolean(hit)}
                          disabled={pending || (other && !hit && !notes[goal.id]?.trim())}
                          onChange={() =>
                            start(() => toggleAchievement(studentId, goal.id, notes[goal.id]))
                          }
                        />
                      ) : (
                        <span className="w-4 text-center font-medium">
                          {hit ? "✓" : "—"}
                        </span>
                      )}
                      <span>
                        {goal.nrs ? "* " : ""}
                        {other ? notes[goal.id] || hit?.note || "Other" : goal.label}
                        {hit ? (
                          <span className="text-muted">
                            {" "}
                            ·{" "}
                            {new Date(hit.attainedAt).toLocaleDateString("en-US", {
                              timeZone: "UTC",
                            })}
                            {hit.note && !other ? ` — ${hit.note}` : ""}
                          </span>
                        ) : null}
                      </span>
                    </div>
                    {other && editable ? (
                      <input
                        type="text"
                        value={notes[goal.id] ?? ""}
                        onChange={(event) =>
                          setNotes((current) => ({ ...current, [goal.id]: event.target.value }))
                        }
                        placeholder="Describe this goal"
                        className="ml-6 rounded-md border border-line bg-white px-3 py-2 text-sm"
                      />
                    ) : null}
                  </li>
                );
              })}
            </ul>
            {editable && category.id === "other" ? (
              <button
                type="button"
                className="mt-2 text-sm text-accent hover:underline"
                onClick={() => setExtraCount((count) => count + 1)}
              >
                Add another
              </button>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
