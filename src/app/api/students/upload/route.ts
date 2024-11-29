import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';
import { parse } from 'csv-parse/sync'; // csv-parse with sync parsing

interface Student {
  name: string;
  arabicName: string;
  school: string;
  classId: string;
  nationality: string;
  iqamaNo: string;
  passportNo: string;
  expenses?: string;
  username: string;
  password: string;
}

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

    // Check if the content looks like a JSON string (not CSV)
    if (fileContent.trim().startsWith('[{')) {
      console.log('Detected JSON format instead of CSV');
      // Attempt to parse as JSON
      records = JSON.parse(fileContent); 
    } else {
      // Parse CSV content normally if it's in the correct format
      const buffer = Buffer.isBuffer(fileContent)
        ? fileContent
        : Buffer.from(fileContent, 'utf-8');

      // Parse CSV content synchronously
      records = parse(buffer.toString(), {
        columns: true,  // Use the first row as column names
        skip_empty_lines: true,  // Skip empty lines in CSV
      });
    }

    const students: Student[] = [];
    const errors: string[] = [];

    // Log each parsed record to debug
    console.log('Parsed Records:', records);

    // Process each record
    for (const row of records) {
      // Log each row before validation to debug
      console.log('Parsed Row:', row);

      // Check for missing required fields
      if (!row.name || !row.classId || !row.username || !row.password) {
        errors.push(`Missing required fields in row: ${JSON.stringify(row)}`);
        continue;
      }

      // Push to the students array
      students.push({
        ...row,
      } as Student);
    }

    // Check if there are validation errors
    if (errors.length > 0) {
      console.error('Validation errors found in CSV data:', errors);
      return NextResponse.json({ error: errors.join('\n') }, { status: 400 });
    }

    console.log('Students array before insertion:', students);

    const createdStudents = [];
    for (const student of students) {
      const { name, arabicName, school, classId, nationality, iqamaNo, passportNo, expenses = 'paid', username, password } = student;

      console.log(`Checking if class exists for classId: ${classId}`);
      const classExists = await prisma.class.findUnique({ where: { id: classId } });
      if (!classExists) {
        console.warn(`Skipping student "${name}" as classId "${classId}" does not exist.`);
        continue;
      }

      console.log(`Creating student: ${JSON.stringify(student)}`);
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
          class: { connect: { id: classId } },
        },
      });
      console.log(`Created student: ${newStudent.id}`);
      createdStudents.push(newStudent);
    }

    console.log('All students created successfully:', createdStudents);
    return NextResponse.json(createdStudents, { status: 201 });
  } catch (error) {
    console.error('Error during bulk upload:', error);
    return NextResponse.json({ error: 'Error during bulk upload.' }, { status: 500 });
  }
}
