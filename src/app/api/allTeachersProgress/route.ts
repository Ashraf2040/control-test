import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Modify to accept query parameters (e.g. trimester)
export async function GET(request: Request) {
  try {
    // Extract the trimester from the query parameters
    const url = new URL(request.url);
    const trimester = url.searchParams.get('trimester'); // Get the trimester from query params

    if (!trimester) {
      return NextResponse.json({ message: 'Trimester is required' }, { status: 400 });
    }

    // Fetch all teachers with their details, subjects, classes, and marks
    const teachers = await prisma.teacher.findMany({
      where: {
        role: 'TEACHER', // Ensure you're fetching only teachers
      },
      include: {
        subjects: {
          include: {
            subject: true, // Include the actual subject name
          },
        },
        classes: {
          include: {
            class: true, // Include the actual class name
            marks: {
              where: {
                trimester: trimester, // Filter marks by the selected trimester
              },
            },
          },
        },
      },
    });

    // Process progress data for each teacher
    const progressData = teachers.map((teacher) => {
      const completedClasses = teacher.classes.filter((classTeacher) => {
        // console.log(`Checking marks for class: ${classTeacher.class.name}`);
        // console.log('Marks:', classTeacher.marks); // Log marks to debug

        // Ensure that all marks fields are filled, including checking for null or undefined values
        const allMarksFilled = classTeacher.marks.every((mark) => {
          return (
            mark.participation !== null && mark.participation !== undefined && mark.participation !== 0 &&
            mark.behavior !== null && mark.behavior !== undefined && mark.behavior !== 0 &&
            mark.workingQuiz !== null && mark.workingQuiz !== undefined && mark.workingQuiz !== 0 &&
            mark.project !== null && mark.project !== undefined && mark.project !== 0 &&
            mark.finalExam !== null && mark.finalExam !== undefined && mark.finalExam !== 0
          );
        });

        console.log('Completed:', allMarksFilled); // Log whether the class is considered completed
        return allMarksFilled;
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

      // Debugging the progress data
      console.log('Completed Classes:', completedClasses.map((classTeacher) => classTeacher.class.name));
      console.log('Incomplete Classes:', incompleteClasses.map((classTeacher) => classTeacher.class.name));

      // Return a complete teacher object including details, subjects, and progress
      return {
        teacherId: teacher.id, // Teacher ID
        name: teacher.name, // Teacher name
        academicYear: teacher.academicYear, // Teacher's academic year
        email: teacher.email, // Teacher's email (or any other detail you want)
        role: teacher.role, // Teacher's role (in case needed)
        subjects: teacher.subjects.map((subject) => subject.subject.name), // Subjects taught by the teacher
        classesAssigned: teacher.classes.map((classTeacher) => classTeacher.class.name), // All classes assigned to the teacher
        completedClasses: completedClasses.map((classTeacher) => classTeacher.class.name), // Completed classes
        incompleteClasses: incompleteClasses.map((classTeacher) => classTeacher.class.name), // Incomplete classes
      };
    });

    // Return the combined data (teachers with details, subjects, classes, and progress information)
    return NextResponse.json(progressData);

  } catch (error) {
    console.error('Error fetching teachers with progress:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
