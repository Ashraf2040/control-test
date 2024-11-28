'use client';

import { useRef, useState, useEffect } from 'react';
import { Class, Student, Subject } from '@prisma/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getTeachersProgress } from '@/lib/actions';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
interface AdminUIProps {
  subjects: Subject[];
}

interface Teacher {
  id: string;
  email: string;
  name: string;
}

interface LocalStudent {
  name: string;
  id: string;
  classId: string;
  behavior?: number;
  participation?: number;
  workingQuiz?: number;
  project?: number;
  finalExam?: number;
}

const AdminUI: React.FC<AdminUIProps> = ({ subjects }) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedTeacherEmail, setSelectedTeacherEmail] = useState<string | null>(null);
  const [selectedClassName, setSelectedClassName] = useState<string | null>(null);
  const [marks, setMarks] = useState<{ [studentId: string]: Partial<LocalStudent> }>({});
  const [showTeacherProgress, setShowTeacherProgress] = useState(false);
  const [teacherProgress, setTeacherProgress] = useState<any[]>([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string | null>(null);
const [selectedTrimester, setSelectedTrimester] = useState<string | null>(null);

  const router = useRouter();

  const fetchTeachersBySubject = async (subjectId: string) => {
    const res = await fetch(`/api/teachers?subjectId=${subjectId}`);
    if (!res.ok) throw new Error('Failed to fetch teachers');
    const data = await res.json();
    return data;
  };
  const MAX_VALUES = {
    behavior: 15,
    participation: 15,
    workingQuiz: 15,
    project: 20,
    finalExam: 35,
  };

  const getInputClass = (value: number | undefined, field: keyof LocalStudent) => {
    const maxValue = MAX_VALUES[field];
    const isBelowThreshold = (value || 0) < maxValue * 0.66;
    return `w-full text-center  ${isBelowThreshold ? 'bg-red-100' : ''}`;
  };
  const fetchClasses = async (teacherId: string) => {
    const res = await fetch(`/api/classesByAdmin?teacherId=${teacherId}&subjectId=${selectedSubjectId}`);
    if (!res.ok) throw new Error('Failed to fetch classes');
    const data = await res.json();
    console.log(data)
    return data;
  };

  console.log(classes)
  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedClassId || !selectedTeacherId || !selectedSubjectId || !selectedAcademicYear || !selectedTrimester) return;
    
      try {
        const response = await fetch(
          `/api/students?classId=${selectedClassId}&teacherId=${selectedTeacherId}&subjectId=${selectedSubjectId}&academicYear=${selectedAcademicYear}&trimester=${selectedTrimester}`
        );
        if (!response.ok) throw new Error('Failed to fetch students');
    
        const data = await response.json();
    
        const mappedStudents = data.map((student: any) => ({
          ...student,
          behavior: student.marks?.behavior || 0,
          participation: student.marks?.participation || 0,
          workingQuiz: student.marks?.workingQuiz || 0,
          project: student.marks?.project || 0,
          finalExam: student.marks?.finalExam || 0,
        }));
    
        setStudents(mappedStudents);
      } catch (error) {
        console.error(error);
      }
    };
    

    fetchStudents();
  }, [selectedClassId, selectedTeacherId, selectedSubjectId]);

  useEffect(() => {
    if (students.length > 0) {
      const initialMarks: { [studentId: string]: Partial<LocalStudent> } = {};
      students.forEach((student) => {
        const mark = student.marks.find((mark) => mark.subjectId === selectedSubjectId) || {};
        initialMarks[student.id] = {
          behavior: mark.behavior || 0,
          participation: mark.participation || 0,
          workingQuiz: mark.workingQuiz || 0,
          project: mark.project || 0,
          finalExam: mark.finalExam || 0,
        };
      });
      setMarks(initialMarks);
    }
  }, [students, selectedSubjectId]);

  const handleSubjectChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const subjectId = e.target.value;
    setSelectedSubjectId(subjectId);
  
    // Reset teacher, class, and student data when changing the subject
    setTeachers([]);
    setSelectedTeacherId(null);
    setClasses([]);
    setSelectedClassId(null);
    setSelectedClassName(null);
    setStudents([]);
    setSelectedTeacherEmail(null);  
    const teachersData = await fetchTeachersBySubject(subjectId);
    setTeachers(teachersData);
  };
  

  const handleTeacherChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const teacherId = e.target.value;
    setSelectedTeacherId(teacherId);

    const selectedTeacher = teachers.find((teacher) => teacher.id === teacherId);
    if (selectedTeacher) {
      setSelectedTeacherEmail(selectedTeacher.name);
      console.log(selectedTeacher)
    }

    const classesData = await fetchClasses(teacherId);
    setClasses(classesData);
    setSelectedClassId(null);
    setSelectedClassName(null);
    setStudents([]);
  };

  const handleClassChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const classId = e.target.value;
    setSelectedClassId(classId);

    const selectedClass = classes.find((classItem) => classItem.id === classId);
    if (selectedClass) {
      setSelectedClassName(selectedClass.class.name);
    }
  };

  const handlePrintCertificate = () => {
    window.print();
  };
  const toggleTeacherProgress = () => {
    setShowTeacherProgress(!showTeacherProgress);
  };
  useEffect(() => {
    const fetchTeacherProgress = async () => {
      try {
        const response = await fetch('/api/teacherProgress');
        const progressData = await response.json();
        setTeacherProgress(progressData);
      } catch (error) {
        console.error('Error fetching teacher progress:', error);
      }
    };
  
    if (showTeacherProgress) {
      fetchTeacherProgress();
    }
  }, [showTeacherProgress]);
  const handleInputChange = (studentId: string, field: keyof LocalStudent, value: number) => {
    setMarks((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
      },
    }));
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
              markId: student.marks[0]?.id,
              ...studentMarks,
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

  return (
    <div className="w-full mx-auto p-6 pt-24 bg-white rounded-lg shadow-lg">
      <div className='flex justify-between items-center mb-3 flex-wrap print:hidden gap-2 '>
      {/* <h1  className="text-white w-full md:max-w-fit bg-main text-center rounded px-4 py-2 font-semibold mb-2">Admin Dashboard
      </h1> */}
      <h1  className="text-main w-full md:max-w-fit md:text-xl  text-center rounded px-4 py-2 font-bold mb-2"> <span className='bg-main  p-1 rounded-md text-white'><span className='md:text-xl font-bold'>1</span>st</span> Trimester Data Entray <span className='text-[#e16262]'>(2024-2025)</span> 
      </h1>

      <div className='flex flex-wrap  gap-2 w-full md:w-fit'>
        
        <button
        className="text-white w-full md:max-w-fit bg-main text-center rounded px-4 py-2 font-semibold mb-2"
        onClick={() => router.push('/teacherCreation')}
      >
        Create New Teacher
      </button>
      <button
  className="text-white w-full md:max-w-fit bg-main text-center rounded px-4 py-2 font-semibold mb-2"
  onClick={() => router.push('/teacherProgress')}
>
  Show Teacher Progress
</button>

<button
  className="text-white w-full md:max-w-fit bg-main text-center rounded px-4 py-2 font-semibold mb-2"
  onClick={() => router.push('/studentsManage')}
>
 Students Management
</button>
</div>
      
{showTeacherProgress && teacherProgress.length > 0 && (
      <div className="mt-6 w-full relative">
        <h2 className="text-xl font-semibold mb-2">Teacher Progress</h2>
        <table className="min-w-full border-collapse border border-gray-200 text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="border p-2">Teacher</th>
              <th className="border p-2">Completed</th>
              <th className="border p-2">Incomplete</th>
            </tr>
          </thead>
          <tbody className=''>
            {teacherProgress.map((progress, index) => (
              <tr key={index} className='even:bg-gray-100 font-semibold'>
                <td className="border p-2">{progress.teacherName}</td>
                <td className="border p-2 text-center">
                  {progress.completed.length > 0
                    ? progress.completed.join(', ')
                    : 'No classes completed'}
                </td>
                
                <td className="border p-2 text-center ">
                  {progress.incomplete.length > 0
                    ? progress.incomplete.join(', ')
                    : 'All classes completed'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className='absolute flex items-center justify-center right-0 top-0 text-white font-bold bg-main  px-2 rounded text-lg' onClick={()=>setShowTeacherProgress(false)}>x</button>
      </div>
    )}
      </div>

      <div className="my-6 mx-auto   text-main font-semibold px-1 md:px-8 py-2  print:hidden flex w-fit gap-2 md:gap-12 lg:gap-24 flex-wrap justify-center items-center  ">
      <div className='flex w-full md:w-fit bg-main rounded  gap-2 items-center justify-center'>
      {/* <h2 className="text-xl font-semibold ">Select Academic Year</h2> */}
  <select
    className="border w-full rounded p-3  focus:outline-none focus:ring-2 focus:ring-[#5C2747]"
    onChange={(e) => setSelectedAcademicYear(e.target.value)}
    defaultValue=""
  >
    <option value="" disabled>
      Select an academic year
    </option>
    <option value="2024-2025">2024-2025</option>
    <option value="2025-2026">2025-2026</option>
    <option value="2026-2027">2026-2027</option>
  </select>
      </div>




      
  {selectedAcademicYear && (
  <div className="print:hidden flex w-full  md:w-fit ">
    {/* <h2 className="text-xl font-semibold ">Select Trimester</h2> */}
    <select
      className="border rounded p-3 w-full  focus:outline-none focus:ring-2 focus:ring-[#5C2747]"
      onChange={(e) => setSelectedTrimester(e.target.value)}
      defaultValue=""
    >
      <option value="" disabled>
        Select a trimester
      </option>
      <option value="First Trimester">First Trimester</option>
      <option value="Second Trimester">Second Trimester</option>
      <option value="Third Trimester">Third Trimester</option>
    </select>
  </div>
)}
        {selectedAcademicYear && selectedTrimester && (
          <div className='print:hidden w-full md:w-fit bg-red-200  '>
          {/* <h2 className="text-xl font-semibold  print:hidden">Select a Subject</h2> */}
          <select
            className="border rounded p-3 w-full  focus:outline-none focus:ring-2 focus:ring-[#5C2747] "
            onChange={handleSubjectChange}
            defaultValue=""
          >
            <option value="" disabled>
              Select a subject
            </option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id} >
                {subject.name}
              </option>
            ))}
          </select>
          </div>
        )}
        {selectedSubjectId && teachers.length > 0 && (
        <div className=" print:hidden flex w-full md:w-fit">
          {/* <h2 className="text-xl font-semibold mb-2 print:hidden">Select a Teacher</h2> */}
          <select
            className="border rounded  p-3 w-full focus:outline-none focus:ring-2 focus:ring-[#5C2747]"
            onChange={handleTeacherChange}
            defaultValue=""
          >
            <option value="" disabled>
              Select a teacher
            </option>
            {teachers.map((teacher: Teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedTeacherId && classes.length > 0 && (
        <div className=" print:hidden w-full md:w-fit">
          {/* <h2 className="text-xl font-semibold mb-2 print:hidden">Select a Class</h2> */}
          <select
            className="border rounded  p-3 w-full focus:outline-none focus:ring-2 focus:ring-[#5C2747]"
            onChange={handleClassChange}
            defaultValue=""
          >
            <option value="" disabled>
              Select a class
            </option>
            {classes.map((classItem) => (
              <option key={classItem.id} value={classItem.class.id}>
                {classItem.class.name}
              </option>
            ))}
          </select>
        </div>
      )}

      </div>

   
{students.length > 0 && (
        <div id="certificate" className="p-2 border border-gray-300 rounded-lg overflow-scroll">
          
          <table className="min-w-full border-collapse border border-gray-200 text-sm ">
            <thead className="bg-main text-white">
              <tr>
                <th className="border p-2">No</th>
                <th className="border p-2">Name</th>
                <th className="border p-2">Attendance</th>
                <th className="border p-2">Participation</th>
                <th className="border p-2">Project</th>
                <th className="border p-2">Quiz</th>
                <th className="border p-2">Final Exam</th>
                <th className="border p-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => {
                const studentMarks = marks[student.id] || {};
                const totalMarks =
                  (studentMarks.behavior || 0) +
                  (studentMarks.participation || 0) +
                  (studentMarks.workingQuiz || 0) +
                  (studentMarks.project || 0) +
                  (studentMarks.finalExam || 0);

                return (
                  <tr key={student.id} className="hover:bg-[#d382a7]">
                    <td className="border p-2">{index + 1}</td>
                    <td className="border p-2 font-semibold">
                      <Link href={`/students/${student.id}/results`}>{student.name}</Link>
                    </td>
                    <td className="border p-2 ">
                      <input
                        type="number"
                        value={studentMarks.behavior || 0}
                        onChange={(e) =>
                          handleInputChange(student.id, 'behavior', Number(e.target.value))
                        }
                        className={getInputClass(studentMarks.behavior, 'behavior')}
                      />
                    </td>
                    <td className="border p-2">
                      <input
                        type="number"
                        value={studentMarks.participation || 0}
                        onChange={(e) =>
                          handleInputChange(student.id, 'participation', Number(e.target.value))
                        }
                        className={getInputClass(studentMarks.participation, 'participation')}
                      />
                    </td>
                    <td className="border p-2">
                      <input
                        type="number"
                        value={studentMarks.project || 0}
                        onChange={(e) =>
                          handleInputChange(student.id, 'project', Number(e.target.value))
                        }
                        className={getInputClass(studentMarks.project, 'project')}
                      />
                    </td>
                    <td className="border p-2">
                      <input
                        type="number"
                        value={studentMarks.workingQuiz || 0}
                        onChange={(e) =>
                          handleInputChange(student.id, 'workingQuiz', Number(e.target.value))
                        }
                        className={getInputClass(studentMarks.workingQuiz, 'workingQuiz')}
                      />
                    </td>
                    <td className="border p-2">
                      <input
                        type="number"
                        value={studentMarks.finalExam || 0}
                        onChange={(e) =>
                          handleInputChange(student.id, 'finalExam', Number(e.target.value))
                        }
                        className={getInputClass(studentMarks.finalExam, 'finalExam')}
                      />
                    </td>
                    <td className="border p-2">{totalMarks}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="bg-red-50 p-2 my-2  grid-cols-3 hidden md:flex md:justify-between md:Px-8 md:pr-36">
            <p className="text-lg ">Teacher: {selectedTeacherEmail}</p>
            <p className="text-lg ">Class : {classes?.find((c) => c.class.id === selectedClassId)?.class.name}</p>
            <p className="text-lg ">Signature :</p>
          </div>
          <div className="mt-2 flex justify-end print:hidden">
    <button
      className="py-2 px-4 bg-main text-white rounded mr-2"
      onClick={handleSaveMarks}
    >
      Save Marks
    </button>
    <button className="py-2 px-4 bg-main text-white rounded" onClick={handlePrintCertificate}>
      Print Certificate
    </button>
  </div>
        </div>
      )}
    </div>
  );
};;

export default AdminUI;
