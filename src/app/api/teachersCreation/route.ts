import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log('Received data:', data);

    const { name, email, password, subjectClassAssignments } = data;

    if (!Array.isArray(subjectClassAssignments)) {
      return NextResponse.json({ error: 'subjectClassAssignments must be an array' }, { status: 400 });
    }

    const newTeacher = await prisma.teacher.create({
      data: {
        name,
        email,
        password,
      },
    });

    for (const { subjectId, classId } of subjectClassAssignments) {
      // Upsert SubjectTeacher entry
      await prisma.subjectTeacher.upsert({
        where: {
          subjectId_teacherId: { subjectId, teacherId: newTeacher.id },
        },
        update: {},
        create: {
          subjectId,
          teacherId: newTeacher.id,
        },
      });

      // Upsert ClassTeacher entry
      const classTeacherEntry = await prisma.classTeacher.upsert({
        where: {
          classId_teacherId: {
            classId: classId,
            teacherId: newTeacher.id,
          },
        },
        update: {},
        create: {
          id: randomUUID(),
          teacherId: newTeacher.id,
          classId: classId,
        },
      });

      // **New Step**: Upsert ClassSubject entry
      await prisma.classSubject.upsert({
        where: {
          classId_subjectId: { classId, subjectId },
        },
        update: {},
        create: {
          id: randomUUID(),
          classId,
          subjectId,
        },
      });

      // Fetch students and create marks
      const students = await prisma.student.findMany({
        where: { classId: classTeacherEntry.classId },
      });

      const markEntries = students.map((student) => ({
        studentId: student.id,
        classTeacherId: classTeacherEntry.id,
        subjectId,
        participation: 0,
        behavior: 0,
        workingQuiz: 0,
        project: 0,
        finalExam: 0,
      }));

      await prisma.mark.createMany({ data: markEntries });
    }

    return NextResponse.json({ message: 'Teacher created successfully' });
  } catch (error) {
    console.error('Error creating teacher:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
