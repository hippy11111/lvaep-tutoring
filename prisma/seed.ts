import { PrismaClient, SessionKind } from "@prisma/client";

const prisma = new PrismaClient();

function d(iso: string) {
  return new Date(`${iso}T00:00:00.000Z`);
}

async function ensureUnassignedStudent() {
  const existing = await prisma.student.findFirst({ where: { name: "Rosa Alvarez" } });
  if (existing) return;
  await prisma.student.create({
    data: {
      name: "Rosa Alvarez",
      site: "Bloomfield Public Library",
      days: "Fri",
      times: "10:00 am–12:00 pm",
    },
  });
  console.log("Added unassigned waitlist student Rosa Alvarez.");
}

export async function seedIfEmpty() {
  const existing = await prisma.user.count();
  if (existing > 0) {
    await ensureUnassignedStudent();
    console.log("Database already has users; skipping full seed.");
    return;
  }

  const sydnay = await prisma.user.create({
    data: { name: "Sydnay Eckerling", role: "STAFF", title: "Education Coordinator" },
  });
  const jorge = await prisma.user.create({
    data: { name: "Jorge Chavez", role: "STAFF", title: "Student Coordinator" },
  });
  const maria = await prisma.user.create({
    data: { name: "Maria Alvarez", role: "TUTOR", title: "Volunteer tutor" },
  });
  const david = await prisma.user.create({
    data: { name: "David Chen", role: "TUTOR", title: "Volunteer tutor" },
  });
  const aisha = await prisma.user.create({
    data: { name: "Aisha Rahman", role: "TUTOR", title: "Volunteer tutor" },
  });

  const students = await Promise.all([
    prisma.student.create({
      data: {
        name: "Luis Ramirez",
        site: "Bloomfield Public Library",
        days: "Tue / Thu",
        times: "6:00–8:00 pm",
      },
    }),
    prisma.student.create({
      data: {
        name: "Fatima Hassan",
        site: "Bloomfield Public Library",
        days: "Mon / Wed",
        times: "10:00 am–12:00 pm",
      },
    }),
    prisma.student.create({
      data: {
        name: "Jean-Pierre Morel",
        site: "Bloomfield Public Library",
        days: "Sat",
        times: "11:00 am–1:00 pm",
      },
    }),
    prisma.student.create({
      data: {
        name: "Olga Petrov",
        site: "Passaic Public Library",
        days: "Tue",
        times: "5:30–7:30 pm",
      },
    }),
    prisma.student.create({
      data: {
        name: "Carlos Mendoza",
        site: "Passaic Public Library",
        days: "Thu",
        times: "6:00–8:00 pm",
      },
    }),
    prisma.student.create({
      data: {
        name: "Mei Lin",
        site: "Bloomfield Public Library",
        days: "Wed",
        times: "4:00–6:00 pm",
      },
    }),
    prisma.student.create({
      data: {
        name: "Ana Septimo",
        site: "Passaic Public Library",
        days: "Mon / Fri",
        times: "1:00–3:00 pm",
        stoppedAt: d("2026-08-28"),
        stoppedReason: "Moved out of county",
      },
    }),
    prisma.student.create({
      data: {
        name: "Joseph David",
        site: "Bloomfield Public Library",
        days: "Sat",
        times: "9:00–11:00 am",
      },
    }),
    prisma.student.create({
      data: {
        name: "Rosa Alvarez",
        site: "Bloomfield Public Library",
        days: "Fri",
        times: "10:00 am–12:00 pm",
      },
    }),
  ]);

  const [luis, fatima, jean, olga, carlos, mei, ana, joseph] = students;

  await prisma.assignment.createMany({
    data: [
      { tutorId: maria.id, studentId: luis.id },
      { tutorId: maria.id, studentId: fatima.id },
      { tutorId: maria.id, studentId: jean.id },
      { tutorId: david.id, studentId: olga.id },
      { tutorId: david.id, studentId: carlos.id },
      { tutorId: aisha.id, studentId: mei.id },
      { tutorId: aisha.id, studentId: ana.id },
      { tutorId: aisha.id, studentId: joseph.id },
    ],
  });

  type SessionSeed = {
    studentId: string;
    tutorId: string;
    date: string;
    kind: SessionKind;
    hours?: number;
    note?: string;
  };

  const sessions: SessionSeed[] = [
    { studentId: luis.id, tutorId: maria.id, date: "2026-08-04", kind: "HELD", hours: 2 },
    { studentId: luis.id, tutorId: maria.id, date: "2026-08-06", kind: "HELD", hours: 2 },
    { studentId: luis.id, tutorId: maria.id, date: "2026-08-11", kind: "STUDENT_ABSENT" },
    { studentId: luis.id, tutorId: maria.id, date: "2026-08-13", kind: "HELD", hours: 2.5 },
    { studentId: luis.id, tutorId: maria.id, date: "2026-08-18", kind: "HELD", hours: 2 },
    { studentId: luis.id, tutorId: maria.id, date: "2026-08-20", kind: "HELD", hours: 2 },
    { studentId: luis.id, tutorId: maria.id, date: "2026-09-01", kind: "HELD", hours: 2 },
    { studentId: luis.id, tutorId: maria.id, date: "2026-09-03", kind: "HELD", hours: 2 },
    { studentId: luis.id, tutorId: maria.id, date: "2026-09-08", kind: "HOLIDAY", note: "Labor Day week makeup planned" },
    { studentId: luis.id, tutorId: maria.id, date: "2026-09-10", kind: "HELD", hours: 2 },
    { studentId: luis.id, tutorId: maria.id, date: "2026-09-15", kind: "HELD", hours: 2 },
    { studentId: luis.id, tutorId: maria.id, date: "2026-09-17", kind: "HELD", hours: 2 },
    { studentId: fatima.id, tutorId: maria.id, date: "2026-08-03", kind: "HELD", hours: 2 },
    { studentId: fatima.id, tutorId: maria.id, date: "2026-08-05", kind: "HELD", hours: 2 },
    { studentId: fatima.id, tutorId: maria.id, date: "2026-08-10", kind: "HELD", hours: 1.5, note: "Homework included" },
    { studentId: fatima.id, tutorId: maria.id, date: "2026-08-12", kind: "TUTOR_ABSENT" },
    { studentId: fatima.id, tutorId: maria.id, date: "2026-08-17", kind: "HELD", hours: 2 },
    { studentId: fatima.id, tutorId: maria.id, date: "2026-09-02", kind: "HELD", hours: 2 },
    { studentId: fatima.id, tutorId: maria.id, date: "2026-09-09", kind: "HELD", hours: 2 },
    { studentId: fatima.id, tutorId: maria.id, date: "2026-09-14", kind: "HELD", hours: 2 },
    { studentId: jean.id, tutorId: maria.id, date: "2026-08-08", kind: "HELD", hours: 2 },
    { studentId: jean.id, tutorId: maria.id, date: "2026-08-15", kind: "HELD", hours: 2 },
    { studentId: jean.id, tutorId: maria.id, date: "2026-08-22", kind: "HELD", hours: 2 },
    { studentId: jean.id, tutorId: maria.id, date: "2026-09-05", kind: "HELD", hours: 2 },
    { studentId: jean.id, tutorId: maria.id, date: "2026-09-12", kind: "HELD", hours: 2 },
    { studentId: jean.id, tutorId: maria.id, date: "2026-09-19", kind: "HELD", hours: 2 },
    { studentId: olga.id, tutorId: david.id, date: "2026-08-04", kind: "HELD", hours: 2 },
    { studentId: olga.id, tutorId: david.id, date: "2026-08-11", kind: "HELD", hours: 2 },
    { studentId: olga.id, tutorId: david.id, date: "2026-08-18", kind: "HELD", hours: 2 },
    { studentId: olga.id, tutorId: david.id, date: "2026-08-25", kind: "STUDENT_ABSENT" },
    { studentId: olga.id, tutorId: david.id, date: "2026-09-01", kind: "HELD", hours: 2 },
    { studentId: olga.id, tutorId: david.id, date: "2026-09-08", kind: "HELD", hours: 2 },
    { studentId: olga.id, tutorId: david.id, date: "2026-09-15", kind: "HELD", hours: 2 },
    { studentId: carlos.id, tutorId: david.id, date: "2026-08-06", kind: "HELD", hours: 2 },
    { studentId: carlos.id, tutorId: david.id, date: "2026-08-13", kind: "HELD", hours: 2 },
    { studentId: carlos.id, tutorId: david.id, date: "2026-08-20", kind: "HELD", hours: 2 },
    { studentId: carlos.id, tutorId: david.id, date: "2026-09-03", kind: "HELD", hours: 2 },
    { studentId: carlos.id, tutorId: david.id, date: "2026-09-10", kind: "HELD", hours: 2 },
    { studentId: carlos.id, tutorId: david.id, date: "2026-09-17", kind: "HELD", hours: 2 },
    { studentId: mei.id, tutorId: aisha.id, date: "2026-08-05", kind: "HELD", hours: 2 },
    { studentId: mei.id, tutorId: aisha.id, date: "2026-08-12", kind: "HELD", hours: 2 },
    { studentId: mei.id, tutorId: aisha.id, date: "2026-08-19", kind: "HELD", hours: 2 },
    { studentId: mei.id, tutorId: aisha.id, date: "2026-09-02", kind: "HELD", hours: 2 },
    { studentId: mei.id, tutorId: aisha.id, date: "2026-09-09", kind: "HELD", hours: 2 },
    { studentId: mei.id, tutorId: aisha.id, date: "2026-09-16", kind: "HELD", hours: 2 },
    { studentId: ana.id, tutorId: aisha.id, date: "2026-08-03", kind: "HELD", hours: 2 },
    { studentId: ana.id, tutorId: aisha.id, date: "2026-08-07", kind: "HELD", hours: 2 },
    { studentId: ana.id, tutorId: aisha.id, date: "2026-08-10", kind: "HELD", hours: 2 },
    { studentId: ana.id, tutorId: aisha.id, date: "2026-08-14", kind: "HELD", hours: 2 },
    { studentId: joseph.id, tutorId: aisha.id, date: "2026-08-08", kind: "HELD", hours: 2 },
    { studentId: joseph.id, tutorId: aisha.id, date: "2026-08-15", kind: "HELD", hours: 2 },
    { studentId: joseph.id, tutorId: aisha.id, date: "2026-08-22", kind: "TUTOR_ABSENT" },
    { studentId: joseph.id, tutorId: aisha.id, date: "2026-09-05", kind: "HELD", hours: 2 },
    { studentId: joseph.id, tutorId: aisha.id, date: "2026-09-12", kind: "HELD", hours: 2 },
    { studentId: joseph.id, tutorId: aisha.id, date: "2026-09-19", kind: "HELD", hours: 2 },
  ];

  await prisma.session.createMany({
    data: sessions.map((session) => ({
      studentId: session.studentId,
      tutorId: session.tutorId,
      date: d(session.date),
      kind: session.kind,
      hours: session.hours ?? null,
      note: session.note ?? null,
    })),
  });

  await prisma.achievement.createMany({
    data: [
      { studentId: fatima.id, goalId: "visit-library", attainedAt: d("2026-08-12") },
      { studentId: fatima.id, goalId: "read-to-children", attainedAt: d("2026-09-09") },
      { studentId: luis.id, goalId: "enter-employment", attainedAt: d("2026-09-10") },
      { studentId: olga.id, goalId: "obtain-citizenship", attainedAt: d("2026-08-18") },
      { studentId: mei.id, goalId: "civics-skills", attainedAt: d("2026-09-16") },
      { studentId: jean.id, goalId: "community-activities", attainedAt: d("2026-08-22") },
    ],
  });

  console.log(
    `Seeded staff ${sydnay.name}, ${jorge.name}; tutors ${maria.name}, ${david.name}, ${aisha.name}; ${students.length} students.`,
  );
}

async function main() {
  await seedIfEmpty();
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
