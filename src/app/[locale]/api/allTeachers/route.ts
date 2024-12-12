import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    // Fetch all teachers along with their associated subjects and classes
    const teachers = await prisma.teacher.findMany({
      include: {
        subjects: {
          include: {
            subject: true, // Include the actual subject name
          },
        },
        classes: {
          include: {
            class: true, // Include the actual class name
          },
        },
      },
    });

    // Return the list of teachers with related subjects and classes
    return NextResponse.json(teachers);

  } catch (error) {
    console.error('Error fetching teachers:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
