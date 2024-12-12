import { NextResponse } from 'next/server';
import {prisma} from '../../../../lib/prisma';

export async function GET() {
  try {
    const teachers = await prisma.teacher.findMany({
      where: {
        role: 'TEACHER',
      },
      include: {
        classes: {
          include: {
            class: true,
            marks: true, // Include marks for each class
          },
        },
      },
    });
    console.log(JSON.stringify(teachers, null, 2));

    const progressData = teachers.map((teacher) => {
      const completedClasses = teacher.classes.filter((classTeacher) => {
        // Check if all students in this class have all required marks fields filled
        return classTeacher.marks.length > 0 && classTeacher.marks.every((mark) => (
          mark.participation !== 0 &&
          mark.behavior !== 0 &&
          mark.workingQuiz !== 0 &&
          mark.project !== 0 &&
          mark.finalExam !== 0
        ));
      });

      const incompleteClasses = teacher.classes.filter((classTeacher) => {
        // Consider a class incomplete if:
        // - It has no marks at all, or
        // - Any student in the class has missing marks fields
        return classTeacher.marks.length === 0 || classTeacher.marks.some((mark) => (
          mark.participation === 0 ||
          mark.behavior === 0 ||
          mark.workingQuiz === 0 ||
          mark.project === 0 ||
          mark.finalExam === 0
        ));
      });

      return {
        teacherName: teacher.name,
        completed: completedClasses.map((classTeacher) => classTeacher.class.name),
        incomplete: incompleteClasses.map((classTeacher) => classTeacher.class.name),
      };
    });

    return NextResponse.json(progressData);
  } catch (error) {
    return NextResponse.error();
  }
}
