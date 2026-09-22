import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { prisma } from "./prisma";

export const USER_COOKIE = "lvaep_user";

export async function getCurrentUser() {
  const id = (await cookies()).get(USER_COOKIE)?.value;
  if (!id) return null;
  return prisma.user.findUnique({ where: { id } });
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/");
  return user;
}

export async function requireRole(role: Role) {
  const user = await requireUser();
  if (user.role !== role) {
    redirect(user.role === "STAFF" ? "/staff" : "/tutor");
  }
  return user;
}
