// app/api/students/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const classId = searchParams.get('classId');
  const teacherId = searchParams.get('teacherId');
  const role = searchParams.get('role');
  const subjectId = searchParams.get('subjectId');
   // new parameter to identify admin vs. teacher request

  if (!classId || !teacherId) {
    return new Response('Missing classId or teacherId', { status: 400 });
  }

  try {
    const studentsWithMarks = await prisma.student.findMany({
      where: {
        classId,
        marks: {
          some: {
            classTeacher: {
              teacherId: role === 'admin' ? undefined : teacherId, // filter based on teacherId only if not admin
            },
       
          },
        },
      },
      include: {
        marks: {
          where: {
            classTeacher: {
              teacherId: role === 'admin' ? undefined : teacherId,
               // include marks by teacher for teacher requests
            },
           
          },
        },
      },
    });

    return new Response(JSON.stringify(studentsWithMarks), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response('Failed to fetch students', { status: 500 });
  }
}
