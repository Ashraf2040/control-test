import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

export async function POST(request: Request) {
  try {
    const { name, arabicName, dob, classId, nationality, iqamaNo, passportNo } = await request.json();

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
        class: {
          connect: { id: classId },
        },
      },
    });

    // Get all the subjects assigned to this class
    const classSubjects = await prisma.classSubject.findMany({
      where: { classId },
      include: {
        subject: true, // Include subject details
      },
    });

    // Get all teachers for this class (for classTeacherId reference)
    const classTeachers = await prisma.classTeacher.findMany({
      where: { classId },
      include: {
        teacher: true, // Include teacher details
      },
    });

    // Define the trimesters
    const trimesters = ['First Trimester', 'Second Trimester', 'Third Trimester'];

    // Create marks for the new student for each subject and trimester
    for (const classSubject of classSubjects) {
      for (const classTeacher of classTeachers) {
        const markEntries = trimesters.map((trimester) => ({
          id: randomUUID(),
          studentId: newStudent.id,
          classTeacherId: classTeacher.id, // Link the mark with the class-teacher
          subjectId: classSubject.subject.id, // Link the mark with the subject
          academicYear: classTeacher.teacher.academicYear, // Use the teacher's academic year
          trimester,
          participation: 0,
          behavior: 0,
          workingQuiz: 0,
          project: 0,
          finalExam: 0,
        }));

        // Create marks for the student in the database
        await prisma.mark.createMany({
          data: markEntries,
        });
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
