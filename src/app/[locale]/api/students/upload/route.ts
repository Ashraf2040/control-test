import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';
import { parse } from 'csv-parse/sync';

export async function POST(request: Request) {
  try {
    const { fileContent } = await request.json();

    if (!fileContent) {
      return NextResponse.json(
        { error: 'CSV file content is required.' },
        { status: 400 }
      );
    }

    let records: any[];

    // Check if the content looks like JSON or CSV
    if (fileContent.trim().startsWith('[{')) {
      records = JSON.parse(fileContent);
    } else {
      const buffer = Buffer.isBuffer(fileContent)
        ? fileContent
        : Buffer.from(fileContent, 'utf-8');

      records = parse(buffer.toString(), {
        columns: true,
        skip_empty_lines: true,
      });
    }

    const students = [];
    const errors = [];

    for (const row of records) {
      // Validate and parse `dob`
      let dob: Date | null = null;
      if (row.dob) {
        const parsedDate = Date.parse(row.dob);
        if (!isNaN(parsedDate)) {
          dob = new Date(parsedDate);
        } else {
          errors.push(`Invalid date format for dob in row: ${JSON.stringify(row)}`);
          continue;
        }
      }

      if (!row.name || !row.classId || !row.username || !row.password) {
        errors.push(`Missing required fields in row: ${JSON.stringify(row)}`);
        continue;
      }

      students.push({
        ...row,
        dob,
      });
    }

    if (errors.length > 0) {
      return NextResponse.json({ error: errors.join('\n') }, { status: 400 });
    }

    const createdStudents = [];
    const trimesters = ['First Trimester', 'Second Trimester', 'Third Trimester'];

    for (const student of students) {
      const {
        name,
        arabicName,
        school,
        classId,
        nationality,
        iqamaNo,
        passportNo,
        expenses = 'paid',
        username,
        password,
        dob,
      } = student;

      const classExists = await prisma.class.findUnique({ where: { id: classId } });
      if (!classExists) {
        continue; // Skip if the class doesn't exist
      }

      // Create the student
      const newStudent = await prisma.student.create({
        data: {
          name,
          arabicName,
          school,
          nationality,
          iqamaNo,
          passportNo,
          expenses,
          username,
          password,
          dateOfBirth: dob,
          class: { connect: { id: classId } },
        },
      });

      createdStudents.push(newStudent);

      // Fetch class subjects and teachers
      const classSubjects = await prisma.classSubject.findMany({
        where: { classId },
        include: { subject: true },
      });

      const classTeachers = await prisma.classTeacher.findMany({
        where: { classId },
        include: { teacher: true },
      });

      // Prepare marks data
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
    }

    return NextResponse.json(createdStudents, { status: 201 });
  } catch (error) {
    console.error('Error during bulk upload:', error);
    return NextResponse.json({ error: 'Error during bulk upload.' }, { status: 500 });
  }
}
