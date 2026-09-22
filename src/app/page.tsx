import { redirect } from "next/navigation";
import { login } from "./actions";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function LoginPage() {
  const current = await getCurrentUser();
  if (current) {
    redirect(current.role === "STAFF" ? "/staff" : "/tutor");
  }

  const users = await prisma.user.findMany({ orderBy: [{ role: "asc" }, { name: "asc" }] });
  const staff = users.filter((user) => user.role === "STAFF");
  const tutors = users.filter((user) => user.role === "TUTOR");

  return (
    <main className="mx-auto flex min-h-full max-w-xl flex-col justify-center px-4 py-16">
      <p className="text-sm font-semibold tracking-wide text-accent">
        Literacy Volunteers of America
      </p>
      <h1 className="mt-1 text-3xl font-semibold">Essex / Passaic tutoring records</h1>
      <p className="mt-3 text-muted">
        Tutors log sessions as they happen. Staff get monthly hour and achievement reports without
        collecting paper forms.
      </p>
      <p className="mt-2 text-sm text-muted">Demo login — pick a seeded user. No password.</p>

      <section className="mt-8">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">Staff</h2>
        <ul className="grid gap-2">
          {staff.map((user) => (
            <UserButton key={user.id} id={user.id} name={user.name} detail={user.title} />
          ))}
        </ul>
      </section>

      <section className="mt-6">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">Tutors</h2>
        <ul className="grid gap-2">
          {tutors.map((user) => (
            <UserButton key={user.id} id={user.id} name={user.name} detail={user.title} />
          ))}
        </ul>
      </section>
    </main>
  );
}

function UserButton({
  id,
  name,
  detail,
}: {
  id: string;
  name: string;
  detail: string | null;
}) {
  return (
    <li>
      <form action={login.bind(null, id)}>
        <button
          type="submit"
          className="flex w-full items-center justify-between rounded-xl border border-line bg-card px-4 py-3 text-left hover:border-accent"
        >
          <span className="font-medium">{name}</span>
          <span className="text-sm text-muted">{detail}</span>
        </button>
      </form>
    </li>
  );
}
