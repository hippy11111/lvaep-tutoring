import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { USER_COOKIE } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { monthKey } from "@/lib/dates";
import { getMonthlyReport, reportToCsv } from "@/lib/reports";

export async function GET(request: Request) {
  const userId = (await cookies()).get(USER_COOKIE)?.value;
  const user = userId
    ? await prisma.user.findUnique({ where: { id: userId } })
    : null;
  if (!user || user.role !== "STAFF") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const month = new URL(request.url).searchParams.get("month") ?? monthKey();
  const report = await getMonthlyReport(month);
  if (!report) {
    return new NextResponse("Invalid month", { status: 400 });
  }

  return new NextResponse(reportToCsv(report), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="lvaep-report-${month}.csv"`,
    },
  });
}
