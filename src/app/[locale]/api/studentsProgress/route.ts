import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const className = searchParams.get('className');
  const subject = searchParams.get('subject');
  const trimester = searchParams.get('trimester');
  const teacherName = searchParams.get('teacherName');

  console.log('Received query parameters:', { className, subject, trimester, teacherName });

  // Validate if className, subject, and trimester are provided
  if (!className || !subject || !trimester || !teacherName) {
    console.error('Missing required query parameters');
    return new Response('Missing required query parameters', { status: 400 });
  }

  try {
    // Fetch students along with their report status for the specific teacher, subject, and trimester
    const students = await prisma.student.findMany({
      where: {
        class: {
          name: className,
        },
        marks: {
          some: {
            subject: {
              name: subject,
            },
            trimester: trimester,
          },
        },
      },
      include: {
        class: true,
        marks: true,
        reports: {
          where: {
            teacher: {
              name: teacherName,
            },
            subject: {
              name: subject,
            },
            trimester: trimester,
          },
        },
      },
    });

    // Transform students data to include a 'reportStatus' field based on whether the report exists
    const studentDataWithReports = students.map((student) => ({
      ...student,
      reportStatus: student.reports.length > 0 ? 'Done' : 'Not Yet',
    }));

    return new Response(JSON.stringify(studentDataWithReports), { status: 200 });
  } catch (error) {
    console.error('Error fetching students:', error);
    return new Response('Failed to fetch students', { status: 500 });
  }
}

