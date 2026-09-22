"use client";

import { useState, useTransition } from "react";
import { toggleAchievement } from "@/app/actions";
import { GOAL_CATEGORIES, GOALS } from "@/lib/goals";

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
  const [otherNote, setOtherNote] = useState(
    recorded.find((item) => item.goalId === "other")?.note ?? "",
  );

  return (
    <div className="grid gap-5">
      <p className="text-sm text-muted">
        {editable
          ? "Mark a goal when the student attains it. Starred items are NRS-style outcomes from the paper form."
          : "Tutors record goals when they are attained. Staff can view them here and on the monthly report."}
      </p>
      {GOAL_CATEGORIES.map((category) => (
        <section key={category.id}>
          <h3 className="mb-2 text-sm font-semibold">{category.title}</h3>
          <ul className="grid gap-2">
            {GOALS.filter((goal) => goal.category === category.id).map((goal) => {
              const hit = recorded.find((item) => item.goalId === goal.id);
              return (
                <li key={goal.id} className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={Boolean(hit)}
                    disabled={!editable || pending}
                    onChange={() => {
                      if (!editable) return;
                      start(() => toggleAchievement(studentId, goal.id, otherNote));
                    }}
                  />
                  <span>
                    {goal.nrs ? "* " : ""}
                    {goal.label}
                    {hit ? (
                      <span className="text-muted">
                        {" "}
                        · {new Date(hit.attainedAt).toLocaleDateString("en-US", { timeZone: "UTC" })}
                        {hit.note ? ` — ${hit.note}` : ""}
                      </span>
                    ) : null}
                  </span>
                </li>
              );
            })}
          </ul>
          {editable && category.id === "other" ? (
            <input
              type="text"
              value={otherNote}
              onChange={(event) => setOtherNote(event.target.value)}
              placeholder="Describe the other goal before checking it"
              className="mt-2 w-full rounded-md border border-line bg-white px-3 py-2 text-sm"
            />
          ) : null}
        </section>
      ))}
    </div>
  );
}
