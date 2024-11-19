import { prisma } from './prisma';
import { Student, Mark } from '@prisma/client';

// Fetch all teachers with subjects and classes
export async function getAllTeachers() {
  return await prisma.teacher.findMany({
    include: {
      subjects: { include: { subject: true } }, // Access subjects via SubjectTeacher join table
      classes: { include: { class: true } },
    },
  });
}

// Fetch all subjects
export async function getAllSubjects() {
  return await prisma.subject.findMany();
}

// Fetch teachers by subject
export async function getTeachersBySubject(subjectId: string) {
  return await prisma.subjectTeacher.findMany({
    where: { subjectId },
    include: { teacher: true },
  });
}

// Fetch classes by teacher using ClassTeacher join table
// lib/actions.ts



export async function getClassesByTeacher(teacherId: string) {
  try {
    const classesWithSubjects = await prisma.classTeacher.findMany({
      where: {
        teacherId: teacherId,
      },
      include: {
        class: {
          include: {
            subjects: {   // Include ClassSubject relation to get associated subjects
              include: {
                subject: true, // Include subject details in each ClassSubject
              },
            },
          },
        },
      },
    });

    return classesWithSubjects;
  } catch (error) {
    console.error('Error fetching classes with subjects:', error);
    throw new Error('Failed to fetch classes');
  }
}


// Fetch students by class with marks for each subject within the class
export async function getStudentsByClass(classId: string, teacherId: string) {
  return await prisma.student.findMany({
    where: { classId },
    include: {
      marks: {
        where: {
          classTeacher: {
            teacherId: teacherId,
            classId: classId,
          },
        },
        select: {
          id: true,
          participation: true,
          behavior: true,
          workingQuiz: true,
          project: true,
          finalExam: true,
          totalMarks: true,
        },
      },
    },
  });
}



// Create a new teacher and associate with a subject
export async function createTeacher(email: string, password: string, name: string, subjectIds: string[]) {
  return await prisma.teacher.create({
    data: {
      email,
      password,
      name,
      subjects: {
        create: subjectIds.map(subjectId => ({ subjectId })),
      },
    },
  });
}

// Create a new class and assign it to a teacher using ClassTeacher
export async function createClass(teacherId: string, className: string) {
  const newClass = await prisma.class.create({
    data: { name: className },
  });
  await prisma.classTeacher.create({
    data: {
      classId: newClass.id,
      teacherId,
    },
  });
  return newClass;
}

// Add a student to a class
export async function addStudentToClass(classId: string, studentName: string) {
  return await prisma.student.create({
    data: {
      name: studentName,
      classId,
    },
  });
}

// Create a new subject
export async function createSubject(subjectName: string) {
  return await prisma.subject.create({
    data: { name: subjectName },
  });
}

// Delete a class by ID
export async function deleteClass(classId: string) {
  return await prisma.class.delete({
    where: { id: classId },
  });
}

// Delete a student by ID
export async function deleteStudent(studentId: string) {
  return await prisma.student.delete({
    where: { id: studentId },
  });
}

// Update student information
export async function updateStudent(studentId: string, newName: string) {
  return await prisma.student.update({
    where: { id: studentId },
    data: {
      name: newName,
    },
  });
}

// Update class information
export async function updateClass(classId: string, newName: string) {
  return await prisma.class.update({
    where: { id: classId },
    data: {
      name: newName,
    },
  });
}

// Update student marks
export async function updateStudentMarks(studentId: string, updatedData: Partial<Mark>) {
  return await prisma.mark.updateMany({
    where: { studentId },
    data: updatedData,
  });
}


export async function getStudentWithMarks(studentId: string) {
  return prisma.student.findUnique({
    where: { id: studentId },
    include: {
      class: true,
      marks: {
        include: {
          subject: true,
        },
      },
    },
  });
}

export async function getTeachersProgress() {
  const teachers = await prisma.teacher.findMany({
    include: {
      classes: {
        include: {
          class: true,
          marks: true, // Include marks for each class
        },
      },
    },
  });

  return teachers.map((teacher) => {
    const completedClasses = teacher.classes.filter((classTeacher) =>
      classTeacher.marks.length > 0 // Check if marks are entered for this class
    );
    const incompleteClasses = teacher.classes.filter(
      (classTeacher) => classTeacher.marks.length === 0
    );

    return {
      teacherName: teacher.name,
      completed: completedClasses.map((classTeacher) => classTeacher.class.name),
      incomplete: incompleteClasses.map((classTeacher) => classTeacher.class.name),
    };
  });
}

export async function getClassesByTeacherAdmin(teacherId: string, subjectId: string) {
  try {
    const classesWithSubjects = await prisma.classTeacher.findMany({
      where: {
        teacherId: teacherId,
        class: {
          subjects: {
            some: {
              subjectId: subjectId, // Ensure that the class has the provided subjectId
            },
          },
        },
      },
      include: {
        class: {
          include: {
            subjects: {   // Include ClassSubject relation to get associated subjects
              include: {
                subject: true, // Include subject details in each ClassSubject
              },
            },
          },
        },
      },
    });

    return classesWithSubjects;
  } catch (error) {
    console.error('Error fetching classes with subjects:', error);
    throw new Error('Failed to fetch classes');
  }
}



