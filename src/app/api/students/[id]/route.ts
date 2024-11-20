// app/api/students/[id]/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Extract student ID directly from URL parameters
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const studentId = params.id;

  if (!studentId) {
    console.error("Missing Student ID");
    return NextResponse.json({ error: 'Student ID is required' }, { status: 400 });
  }

  try {
    // Parse JSON body to get updated mark data
    const updatedData = await request.json();

    // Log to verify incoming data
    console.log('Updating marks for student ID:', studentId);
    console.log('Data:', updatedData);

    // Validate the incoming data structure
    if (!updatedData || typeof updatedData !== 'object') {
      console.error("Invalid data format:", updatedData);
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
    }

    // Ensure that markId is provided in the request data
    const { markId } = updatedData;
    if (!markId) {
      console.error("Missing Mark ID");
      return NextResponse.json({ error: 'Mark ID is required' }, { status: 400 });
    }

    // Find the mark by its ID
    const existingMark = await prisma.mark.findUnique({
      where: { id: markId },
    });

    if (!existingMark) {
      console.error("Mark not found:", markId);
      return NextResponse.json({ message: 'Mark not found.' }, { status: 404 });
    }

    // Update the marks
    const updatedMarks = await prisma.mark.update({
      where: { id: markId },
      data: {
        participation: updatedData.participation,
        behavior: updatedData.behavior,
        workingQuiz: updatedData.workingQuiz,
        project: updatedData.project,
        finalExam: updatedData.finalExam,
        totalMarks: (
          (updatedData.participation || 0) +
          (updatedData.behavior || 0) +
          (updatedData.workingQuiz || 0) +
          (updatedData.project || 0) +
          (updatedData.finalExam || 0)
        ),
        academicYear: updatedData.academicYear, // Add this
        trimester: updatedData.trimester,       // Add this
      },
    });
    

    return NextResponse.json(updatedMarks, { status: 200 });
  } catch (error) {
    console.error('Error updating marks:', error);
    return NextResponse.json({ error: 'Failed to update marks' }, { status: 500 });
  }
}
