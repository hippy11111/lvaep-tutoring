import Link from "next/link";
import type { User } from "@prisma/client";
import { logout } from "@/app/actions";

export function Shell({
  user,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) {
  const home = user.role === "STAFF" ? "/staff" : "/tutor";

  return (
    <div className="min-h-full">
      <header className="border-b border-line bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <div>
            <Link href={home} className="text-sm font-semibold tracking-wide text-accent">
              LVAEP
            </Link>
            <p className="text-xs text-muted">Tutoring sessions & monthly reports</p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="text-right">
              <div className="font-medium">{user.name}</div>
              <div className="text-xs text-muted">
                {user.role === "STAFF" ? "Staff" : "Tutor"}
                {user.title ? ` · ${user.title}` : ""}
              </div>
            </div>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-md border border-line px-3 py-1.5 text-sm hover:bg-background"
              >
                Switch user
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-line bg-card p-5 shadow-sm ${className}`}>
      {children}
    </div>
  );
}
