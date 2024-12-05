import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const name = url.searchParams.get('name') || ''; // Optional: filter by name

  try {
    // Fetch all students, including their associated reports
    const students = await prisma.student.findMany({
      where: {
        name: {
          contains: name, // Case-insensitive search
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        name: true,
        class: {
          select: {
            id: true,
            name: true,
          },
        },
        reports: {
          select: {
            id: true,
            academicYear: true,
            trimester: true,
            status: true,
            recommendations: true,
            comment: true,
            teacher: {
              select: {
                id: true,
                name: true,
              },
            },
            subject: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(students, { status: 200 });
  } catch (error) {
    console.error('Error fetching student data:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching student data.' },
      { status: 500 }
    );
  }
}
