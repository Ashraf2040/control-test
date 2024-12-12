import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log('Received data:', data);

    const { name,arabicName, email, password, academicYear,signature, subjectClassAssignments ,school} = data;

    if (!Array.isArray(subjectClassAssignments)) {
      return NextResponse.json({ error: 'subjectClassAssignments must be an array' }, { status: 400 });
    }

    // Create the teacher
    const newTeacher = await prisma.teacher.create({
      data: {
        name,
        email,
        password,
        school,
        academicYear,
        signature,
        arabicName
      },
    });

    const trimesters = ['First Trimester', 'Second Trimester', 'Third Trimester'];

    // Iterate over subject-class pairs
    for (const { subjectId, classId } of subjectClassAssignments) {
      // Upsert SubjectTeacher
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

      // Upsert ClassTeacher
      const classTeacherEntry = await prisma.classTeacher.upsert({
        where: {
          classId_teacherId: { classId, teacherId: newTeacher.id },
        },
        update: {},
        create: {
          id: randomUUID(),
          classId,
          teacherId: newTeacher.id,
        },
      });

      // Upsert ClassSubject
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

      // Fetch all students in the class
      const students = await prisma.student.findMany({
        where: { classId },
      });

      // Generate marks for each student in each trimester
      for (const student of students) {
        const markEntries = trimesters.map((trimester) => ({
          id: randomUUID(),
          studentId: student.id,
          classTeacherId: classTeacherEntry.id,
          subjectId,
          academicYear,
          trimester,
          participation: 0,
          behavior: 0,
          workingQuiz: 0,
          project: 0,
          finalExam: 0,
        }));

        await prisma.mark.createMany({
          data: markEntries,
        });
      }
    }

    return NextResponse.json({ message: 'Teacher and marks created successfully' });
  } catch (error) {
    console.error('Error creating teacher:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
