"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SessionKind } from "@prisma/client";
import { USER_COOKIE, requireRole, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GOALS } from "@/lib/goals";

export async function login(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;
  (await cookies()).set(USER_COOKIE, user.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  redirect(user.role === "STAFF" ? "/staff" : "/tutor");
}

export async function logout() {
  (await cookies()).delete(USER_COOKIE);
  redirect("/");
}

async function requireAssignedTutor(studentId: string) {
  const user = await requireUser();
  if (user.role !== "TUTOR") redirect("/staff");
  const assignment = await prisma.assignment.findFirst({
    where: { studentId, tutorId: user.id },
    include: { student: true },
  });
  if (!assignment || assignment.student.stoppedAt) redirect("/tutor");
  return user;
}

export async function logSession(formData: FormData) {
  const studentId = String(formData.get("studentId") ?? "");
  const date = String(formData.get("date") ?? "");
  const kind = String(formData.get("kind") ?? "HELD") as SessionKind;
  const note = String(formData.get("note") ?? "").trim() || null;
  const hoursRaw = String(formData.get("hours") ?? "");

  const user = await requireAssignedTutor(studentId);

  const validKind = ["HELD", "TUTOR_ABSENT", "STUDENT_ABSENT", "HOLIDAY"].includes(kind);
  if (!studentId || !date || !validKind) return;

  let hours: number | null = null;
  if (kind === "HELD") {
    hours = Number(hoursRaw);
    if (!Number.isFinite(hours) || hours <= 0 || hours > 8) return;
  }

  await prisma.session.create({
    data: {
      studentId,
      tutorId: user.id,
      date: new Date(`${date}T00:00:00.000Z`),
      kind,
      hours,
      note,
    },
  });

  revalidatePath("/tutor");
  revalidatePath(`/students/${studentId}`);
  revalidatePath("/staff");
}

export async function deleteSession(sessionId: string) {
  const user = await requireUser();
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { student: true },
  });
  if (!session) return;
  if (user.role === "STAFF") {
    // staff can always correct records
  } else if (session.tutorId !== user.id || session.student.stoppedAt) {
    return;
  }

  await prisma.session.delete({ where: { id: sessionId } });
  revalidatePath("/tutor");
  revalidatePath(`/students/${session.studentId}`);
  revalidatePath("/staff");
}

export async function toggleAchievement(studentId: string, goalId: string, note?: string) {
  await requireAssignedTutor(studentId);
  if (!GOALS.some((goal) => goal.id === goalId)) return;

  const existing = await prisma.achievement.findUnique({
    where: { studentId_goalId: { studentId, goalId } },
  });

  if (existing) {
    await prisma.achievement.delete({ where: { id: existing.id } });
  } else {
    await prisma.achievement.create({
      data: {
        studentId,
        goalId,
        note: goalId === "other" ? note?.trim() || null : null,
      },
    });
  }

  revalidatePath(`/students/${studentId}`);
  revalidatePath("/staff");
  revalidatePath("/tutor");
}

export async function stopTutoring(formData: FormData) {
  const studentId = String(formData.get("studentId") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  await requireAssignedTutor(studentId);
  if (!reason) return;

  await prisma.student.update({
    where: { id: studentId },
    data: { stoppedAt: new Date(), stoppedReason: reason },
  });

  revalidatePath(`/students/${studentId}`);
  revalidatePath("/staff");
  revalidatePath("/tutor");
  redirect("/tutor");
}

export async function resumeTutoring(studentId: string) {
  await requireRole("STAFF");
  await prisma.student.update({
    where: { id: studentId },
    data: { stoppedAt: null, stoppedReason: null },
  });

  revalidatePath(`/students/${studentId}`);
  revalidatePath("/staff");
  revalidatePath("/tutor");
}

export async function setStudentAssignment(formData: FormData) {
  await requireRole("STAFF");

  const studentId = String(formData.get("studentId") ?? "");
  const tutorId = String(formData.get("tutorId") ?? "");
  if (!studentId) return;

  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student) return;

  if (!tutorId) {
    await prisma.assignment.deleteMany({ where: { studentId } });
  } else {
    const tutor = await prisma.user.findFirst({
      where: { id: tutorId, role: "TUTOR" },
    });
    if (!tutor) return;
    await prisma.assignment.upsert({
      where: { studentId },
      create: { studentId, tutorId },
      update: { tutorId },
    });
  }

  revalidatePath("/staff");
  revalidatePath(`/students/${studentId}`);
  revalidatePath("/tutor");
}

export async function createStudent(formData: FormData) {
  await requireRole("STAFF");

  const name = String(formData.get("name") ?? "").trim();
  const site = String(formData.get("site") ?? "").trim();
  const tutorId = String(formData.get("tutorId") ?? "");
  if (!name) return;

  const student = await prisma.student.create({
    data: {
      name,
      site: site || "To be scheduled",
      days: "To be scheduled",
      times: "To be scheduled",
    },
  });

  if (tutorId) {
    const tutor = await prisma.user.findFirst({
      where: { id: tutorId, role: "TUTOR" },
    });
    if (tutor) {
      await prisma.assignment.create({
        data: { studentId: student.id, tutorId: tutor.id },
      });
    }
  }

  revalidatePath("/staff");
  revalidatePath("/tutor");
  redirect(`/students/${student.id}`);
}

export async function updateStudentSchedule(formData: FormData) {
  const studentId = String(formData.get("studentId") ?? "");
  const site = String(formData.get("site") ?? "").trim();
  const days = String(formData.get("days") ?? "").trim();
  const times = String(formData.get("times") ?? "").trim();
  await requireAssignedTutor(studentId);
  if (!site || !days || !times) return;

  await prisma.student.update({
    where: { id: studentId },
    data: { site, days, times },
  });

  revalidatePath(`/students/${studentId}`);
  revalidatePath("/tutor");
  revalidatePath("/staff");
}
