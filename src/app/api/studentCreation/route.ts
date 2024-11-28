import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

export async function POST(request: Request) {
  try {
    const {
      name,
      arabicName,
      dob,
      school,
      classId,
      nationality,
      iqamaNo,
      passportNo,
      expenses = 'paid', // Default value
      username,
      password,
    } = await request.json();

    if (!name || !dob || !classId) {
      return NextResponse.json(
        { error: 'Name, date of birth, and class are required.' },
        { status: 400 }
      );
    }

    const classExists = await prisma.class.findUnique({
      where: { id: classId },
    });

    if (!classExists) {
      return NextResponse.json(
        { error: 'Class not found.' },
        { status: 404 }
      );
    }

    // Create the student
    const newStudent = await prisma.student.create({
      data: {
        name,
        arabicName,
        dateOfBirth: new Date(dob),
        nationality,
        iqamaNo,
        passportNo,
        expenses,
        school,
        username,
        password,
        class: {
          connect: { id: classId },
        },
      },
    });

    // Fetch class subjects and teachers
    const classSubjects = await prisma.classSubject.findMany({
      where: { classId },
      include: { subject: true },
    });

    const classTeachers = await prisma.classTeacher.findMany({
      where: { classId },
      include: { teacher: true },
    });

    const trimesters = ['First Trimester', 'Second Trimester', 'Third Trimester'];

    for (const subject of classSubjects) {
      for (const teacher of classTeachers) {
        const marksData = trimesters.map((trimester) => ({
          id: randomUUID(),
          studentId: newStudent.id,
          classTeacherId: teacher.id,
          subjectId: subject.subject.id,
          academicYear: teacher.teacher.academicYear,
          trimester,
          participation: 0,
          behavior: 0,
          workingQuiz: 0,
          project: 0,
          finalExam: 0,
        }));

        await prisma.mark.createMany({ data: marksData });
      }
    }

    return NextResponse.json(newStudent, { status: 201 });
  } catch (error) {
    console.error('Error creating student:', error);
    return NextResponse.json(
      { error: 'Error creating student.' },
      { status: 500 }
    );
  }
}
