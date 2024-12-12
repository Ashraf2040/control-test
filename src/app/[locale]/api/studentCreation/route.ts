import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

// Helper function to clean and validate dates
function cleanDate(dateString: string): string {
  // Clean any hidden characters (e.g., non-breaking spaces) and fix any slashes
  const cleaned = dateString.replace(/[^\x00-\x7F]/g, '')  // Remove non-ASCII characters
                             .replace(/[^\d\-\/]/g, '');  // Ensure only valid characters (numbers, hyphens, and slashes)
  console.log(`Cleaned Date: ${cleaned}`);  // Debugging
  return cleaned;
}

// Helper function to validate the date format (assuming 'yyyy-mm-dd' format)
function isValidDate(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  return regex.test(dateString);
}

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

    // Ensure required fields are present
    if (!name || !dob || !classId) {
      return NextResponse.json(
        { error: 'Name, date of birth, and class are required.' },
        { status: 400 }
      );
    }

    // Clean and validate the date of birth
    const cleanedDob = cleanDate(dob);
    if (!isValidDate(cleanedDob)) {
      return NextResponse.json(
        { error: 'Invalid date format for date of birth.' },
        { status: 400 }
      );
    }

    console.log(`Cleaned Date of Birth: ${cleanedDob}`); // Debugging the cleaned date

    const classExists = await prisma.class.findUnique({
      where: { id: classId },
    });

    if (!classExists) {
      return NextResponse.json(
        { error: 'Class not found.' },
        { status: 404 }
      );
    }

    // Create the student with the cleaned date of birth
    const newStudent = await prisma.student.create({
      data: {
        name,
        arabicName,
        dateOfBirth: new Date(cleanedDob),
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

    // Prepare marks data for each subject and teacher
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

        // Insert marks data
        await prisma.mark.createMany({ data: marksData });
      }
    }

    // Return the newly created student
    return NextResponse.json(newStudent, { status: 201 });
  } catch (error) {
    console.error('Error creating student:', error);
    return NextResponse.json(
      { error: 'Error creating student.' },
      { status: 500 }
    );
  }
}
