'use client';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Class, Student, Teacher } from '@prisma/client';
import toast, { Toaster } from 'react-hot-toast';

interface Mark {
  id: string;
  participation?: number;
  behavior?: number;
  workingQuiz?: number;
  project?: number;
  finalExam?: number;
  totalMarks?: number;
}

interface StudentWithMarks extends Student {
  marks: Mark[];
  markId: string;
}

const TeacherPage: React.FC = () => {
  const { user } = useUser();
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<StudentWithMarks[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [fetchedClasses, setFetchedClasses] = useState<Class[]>([]);
  const [marks, setMarks] = useState<Record<string, Mark>>({});
  const [teacherDetails, setTeacherDetails] = useState<Teacher | null>(null);

  const maxValues = {
    participation: 15,
    behavior: 15,
    workingQuiz: 15,
    project: 20,
    finalExam: 35,
  };

  // Fetch teacher details and subjects
  useEffect(() => {
    const fetchTeacherDetails = async () => {
      if (!user) return;
      try {
        const response = await fetch(`/api/teachers?teacherId=${user.id}`);
        if (!response.ok) throw new Error('Failed to fetch teacher details');
        const teacherData = await response.json();
        setTeacherDetails(teacherData);
        console.log(teacherData)

        // Automatically set the subject if the teacher has only one
        if (teacherData.subjects.length === 1) {
          setSelectedSubject(teacherData.subjects[0].subjectId);
        }
      } catch (error) {
        console.error(error);
        toast.error('Error fetching teacher details.');
      }
    };

    fetchTeacherDetails();
  }, [user]);

  // Filter classes whenever selectedSubject changes
  const filteredClasses = fetchedClasses.filter((classItem) =>
    classItem.class.subjects.some((subject) => subject.subjectId === selectedSubject)
  );

  const currentTeacher = teacherDetails;

  // Fetch students based on the selected class, subject, and logged-in teacher
  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedClassId || !selectedSubject) return;

      try {
        const response = await fetch(`/api/students?classId=${selectedClassId}&subject=${selectedSubject}&teacherId=${user?.id}`);
        if (!response.ok) throw new Error('Failed to fetch students');
        const data: StudentWithMarks[] = await response.json();
        setStudents(data);

        const initialMarks: Record<string, Mark> = {};
        data.forEach((student) => {
          const studentMark = student.marks[0] || {};
          initialMarks[student.id] = {
            id: studentMark.id,
            participation: studentMark.participation || 0,
            behavior: studentMark.behavior || 0,
            workingQuiz: studentMark.workingQuiz || 0,
            project: studentMark.project || 0,
            finalExam: studentMark.finalExam || 0,
          };
        });
        setMarks(initialMarks);
      } catch (error) {
        console.error(error);
        toast.error('Error fetching students.');
      }
    };

    fetchStudents();
  }, [selectedClassId, selectedSubject]);

  const handleClassChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedClassId(event.target.value);
  };

  const handleSubjectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSubject(event.target.value);
  };

  const handleMarkChange = (studentId: string, field: keyof Mark, value: string) => {
    setMarks((prevMarks) => ({
      ...prevMarks,
      [studentId]: {
        ...(prevMarks[studentId] || {}),
        [field]: value ? Number(value) : undefined,
      },
    }));
  };

  const calculateTotalMarks = (studentId: string): number => {
    const studentMarks = marks[studentId] || {};
    return (
      (studentMarks.participation || 0) +
      (studentMarks.behavior || 0) +
      (studentMarks.workingQuiz || 0) +
      (studentMarks.project || 0) +
      (studentMarks.finalExam || 0)
    );
  };

  const handleSaveMarks = async () => {
    try {
      const responses = await Promise.all(
        students.map((student) => {
          const studentMarks = marks[student.id];

          return fetch(`/api/students/${student.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              markId: student.marks[0].id,
              participation: studentMarks.participation,
              behavior: studentMarks.behavior,
              workingQuiz: studentMarks.workingQuiz,
              project: studentMarks.project,
              finalExam: studentMarks.finalExam,
            }),
          });
        })
      );

      if (responses.some((response) => !response.ok)) {
        throw new Error('Failed to update marks');
      }

      toast.success('Marks updated successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Error updating marks. Please try again.');
    }
  };

  const fillAllMarks = (field: keyof Mark) => {
    const maxValue = maxValues[field];
    setMarks((prevMarks) => {
      const updatedMarks = { ...prevMarks };
      students.forEach((student) => {
        updatedMarks[student.id] = {
          ...updatedMarks[student.id],
          [field]: maxValue,
        };
      });
      return updatedMarks;
    });
  };

  const resetAllMarks = (field: keyof Mark) => {
    setMarks((prevMarks) => {
      const updatedMarks = { ...prevMarks };
      students.forEach((student) => {
        updatedMarks[student.id] = {
          ...updatedMarks[student.id],
          [field]: 0,
        };
      });
      return updatedMarks;
    });
  };

  async function fetchClasses(teacherId: string) {
    const response = await fetch(`/api/classes?teacherId=${teacherId}`);
    const data = await response.json();
    setFetchedClasses(data); 
    return data;
  }

  useEffect(() => {
    if (user?.id) {
      fetchClasses(user?.id);
    }
  }, [user?.id]);

  return (
    <div className="mx-auto pt-24 p-6 min-h-screen">
      <Toaster position="top-right" />
     <div className='flex items-center justify-between md:pr-12'> 
      <h1 className="md:text-xl font-bold text-white bg-main p-3 rounded-md mb-6 max-w-fit text-center">
        Hello, {currentTeacher?.name}
      </h1>
      <h1 className="md:text-2xl font-extrabold text-main    mb-6 max-w-fit text-center">
     Subject :   <span className='text-[#e16262]'> {currentTeacher?.subjects[0]?.subject.name}</span>
      </h1></div>

      {currentTeacher?.subjects.length > 1 && (
        <div className="mb-6">
          <label htmlFor="subjectSelect" className="block my-2 text-xl font-medium text-lamaPurple">
            Select Subject
          </label>
          <select
            id="subjectSelect"
            value={selectedSubject}
            onChange={handleSubjectChange}
            className="border border-lamaSky p-2 rounded w-full text-lg max-w-fit"
          >
            <option value="">-- Select a Subject --</option>
            {currentTeacher.subjects.map((subject) => (
              <option key={subject.id} value={subject.subjectId}>
                {subject.subject.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedSubject && (
        <div className="mb-6">
          <label htmlFor="classSelect" className="block my-2 text-xl font-medium text-lamaPurple">
            Select Class
          </label>
          <select
            id="classSelect"
            value={selectedClassId}
            onChange={handleClassChange}
            className="border border-lamaSky p-2 rounded w-full text-lg max-w-fit"
          >
            <option value="">-- Select a Class --</option>
            {filteredClasses.map((classItem) => (
              <option key={classItem.class.id} value={classItem.class.id}>
                {classItem.class.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {students.length > 0 && (
        <div className="overflow-x-scroll">
          <h2 className="text-2xl text-lamaPurple font-semibold mb-4">Students in Class</h2>
          <table className="min-w-full bg-white shadow-lg rounded-lg border">
          <thead className="bg-gray-200">
  <tr>
    <th className="p-3 text-center text-black">NO</th>
    <th className="p-3 text-center text-black">Name</th>
    {['participation', 'behavior', 'workingQuiz', 'project', 'finalExam'].map((field) => (
      <th key={field} className="p-3 text-center text-black">
        {/* Conditional display names for workingQuiz and finalExam */}
        {field === 'workingQuiz' ? 'Quiz' : field === 'finalExam' ? 'Exam' : field.charAt(0).toUpperCase() + field.slice(1)}
        
        <button
          onClick={() => fillAllMarks(field as keyof Mark)}
          className="ml-2 bg-main hover:bg-gray-400 text-xs font-bold py-1 px-2 rounded text-white"
        >
          Fill
        </button>
        <button
          onClick={() => resetAllMarks(field as keyof Mark)}
          className="ml-2 bg-[#e16262] hover:bg-gray-400 text-xs font-bold py-1 px-2 rounded text-white"
        >
          Reset 
        </button>
      </th>
    ))}
    <th className="p-3 text-center text-black">Total</th>
  </tr>
</thead>

            <tbody>
              {students.map((student, index) => {
                const studentMarks = marks[student.id] || {};
                return (
                  <tr key={student.id} className="even:bg-gray-200 odd:bg-gray-100">
                  <td className="px-3">
                    <span className="font-bold">{index + 1}</span>
                  </td>
                  <td className="text-[14px] font-bold">{student.name}</td>
                  {['participation', 'behavior', 'workingQuiz', 'project', 'finalExam'].map((field) => (
                      <td key={field} className="p-1">
                      <input
                        type="number"
                        value={marks[student.id]?.[field as keyof Mark] || ''}
                        onChange={(e) => handleMarkChange(student.id, field as keyof Mark, e.target.value)}
                        className="w-full border border-gray-300 p-2 rounded"
                      />
                    </td>
                    ))}
                    <td className="p-3 text-center">{calculateTotalMarks(student.id)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="m-2 mb-2 text-end">
            <button
              onClick={handleSaveMarks}
              className=" bg-main hover:bg-lamaYellow text-white font-bold py-2 px-6 rounded shadow-lg  "
            >
              Save Marks
            </button>
           
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherPage;
