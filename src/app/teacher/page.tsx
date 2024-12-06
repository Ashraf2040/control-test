'use client';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Class, Student, Teacher } from '@prisma/client';
import toast, { Toaster } from 'react-hot-toast';
import Countdown from '../_components/CountDown';
import CountdownWrapper from '../_components/CountdownWrapper';
import { useRouter } from 'next/navigation';

interface Mark {
  id: string;
  participation?: number;
  behavior?: number;
  workingQuiz?: number;
  project?: number;
  finalExam?: number;
  reading?: number;
  memorizing?: number;
  oralTest?: number;
  classActivities?: number;
  totalMarks?: number;
}

interface StudentWithMarks extends Student {
  marks: Mark[];
  markId: string;
}

const TeacherPage: React.FC = () => {
  const { user } = useUser();
  const [academicYear, setAcademicYear] = useState<string>('');
  const [trimester, setTrimester] = useState<string>('');
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<StudentWithMarks[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [isCountdownFinished, setIsCountdownFinished] = useState(false);
  
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [fetchedClasses, setFetchedClasses] = useState<Class[]>([]);
  const [marks, setMarks] = useState<Record<string, Mark>>({});
  const [teacherDetails, setTeacherDetails] = useState<Teacher | null>(null);

  const getMaxValues = (subject: string) => {
    switch (subject.toLowerCase()) {
      case 'arabic':
        return {
          participation: 10,
          behavior: 5,
          project: 10,
          classActivities: 15,
          workingQuiz: 20,
          finalExam: 40,
          reading: 0,
          memorizing: 0,
          oralTest: 0,
        };
      case 'social arabic':
        return {
          participation: 10,
          behavior: 10,
          project: 10,
          classActivities: 10,
          workingQuiz: 20,
          finalExam: 40,
          reading: 0,
          memorizing: 0,
          oralTest: 0,
        };
      case 'islamic':
        return {
          participation: 10,
          behavior: 10,
          reading: 10,
          memorizing: 10,
          oralTest: 5,
          workingQuiz: 15,
          finalExam: 40,
          classActivities: 0,
        };
      default:
        return {
          participation: 15,
          behavior: 15,
          workingQuiz: 15,
          finalExam: 35,
          project: 20,
          reading: 0,
          memorizing: 0,
          oralTest: 0,
          classActivities: 0,
        };
    }
  };
  

  const academicYears = [ '2024-2025', '2025-2026'];
  const trimesters = ['First Trimester', 'Second Trimester', 'Third Trimester'];

  const router = useRouter();
  console.log(fetchedClasses)
  const navigateToProgressReport = () => {
    // Validate required fields
    if (!selectedClassId || !selectedSubject || !academicYear || !trimester) {
      toast.error('Please select all required fields to proceed.');
      return;
    }
  
    // Extract values
    const className =fetchedClasses?.find((c) => c.class.id === selectedClassId)?.class.name

    console.log(className)

    const teacherName = teacherDetails?.name || '';
    const subjectName =currentTeacher?.subjects[0]?.subject.name
  
    // Construct URL with query parameters
    const queryParams = new URLSearchParams({
      class: className || '',
      teacherName: teacherName || '',
      trimester: trimester || '',
      subject: subjectName || '',
    });
  
    // Navigate to the new page
    router.push(`/studentsProgress?${queryParams.toString()}`);
  };
  
  
  

  useEffect(() => {
    const fetchTeacherDetails = async () => {
      if (!user) return;
      try {
        const response = await fetch(`/api/teachers?teacherId=${user.id}`);
        if (!response.ok) throw new Error('Failed to fetch teacher details');
        const teacherData = await response.json();
        setTeacherDetails(teacherData);

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

  const filteredClasses = fetchedClasses?.filter((classItem) =>
    classItem.class.subjects.some((subject) => subject.subjectId === selectedSubject)
  );
console.log(trimester)
  const fetchClasses = async (teacherId: string) => {
    try {
      const response = await fetch(`/api/classes?teacherId=${teacherId}`);
      const data = await response.json();
      setFetchedClasses(data);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error('Error fetching classes.');
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchClasses(user.id);
    }
  }, [user?.id]);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedClassId || !selectedSubject || !academicYear || !trimester || !user?.id) return;
    
      try {
        const response = await fetch(
          `/api/students?classId=${selectedClassId}&subjectId=${selectedSubject}&academicYear=${academicYear}&trimester=${trimester}&teacherId=${user.id}`
        );
    
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
            reading: studentMark.reading || 0,
            memorizing: studentMark.memorizing || 0,
            oralTest: studentMark.oralTest || 0,
            classActivities: studentMark.classActivities || 0,
          };
        });
        setMarks(initialMarks);
      } catch (error) {
        console.error(error);
        toast.error('Error fetching students.');
      }
    };
    
    fetchStudents();
  }, [selectedClassId, selectedSubject, academicYear, trimester, user?.id]); // Add user?.id as a dependency
  

  const handleClassChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedClassId(event.target.value);
  };
  const currentTeacher = teacherDetails;
  const handleSubjectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSubject(event.target.value);
  };
  const handleMarkChange = (studentId: string, field: keyof Mark, value: string) => {
    const maxValuesForSubject = getMaxValues(selectedSubject); // Get the max values based on selected subject
    const maxValue = maxValuesForSubject[field] || 0;
  
    const newValue = value ? Number(value) : undefined;
  
    if (newValue !== undefined && newValue > maxValue) {
      // If the value exceeds maxValue, show a toast error and don't update the mark
      toast.error(`Max value for ${field} is ${maxValue}`);
      return;
    }
  
    setMarks((prevMarks) => ({
      ...prevMarks,
      [studentId]: {
        ...(prevMarks[studentId] || {}),
        [field]: newValue,
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
      (studentMarks.finalExam || 0)+
      (studentMarks.reading || 0) +
      (studentMarks.memorizing || 0) +
      (studentMarks.oralTest || 0) +
      (studentMarks.classActivities || 0)
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
              reading: studentMarks.reading,
              memorizing: studentMarks.memorizing,
              oralTest: studentMarks.oralTest,
              classActivities: studentMarks.classActivities,
              academicYear,
              trimester,
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
   console.log(currentTeacher)
   const fillAllMarks = (field: keyof Mark) => {
    const subjectFetched = currentTeacher?.subjects[0]?.subject.name
    const maxValuesForSubject = getMaxValues(subjectFetched); // Get the max values based on selected subject
    const maxValue = maxValuesForSubject[field];  // Use maxValuesForSubject to get the max value for the field
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
  




console.log(students)
const handleCountdownEnd = () => {
  setIsCountdownFinished(true); // Update state when the countdown ends
  toast.error('Marks Modification closed. Please contact the admin!');
};

if (isCountdownFinished) {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="bg-white p-6 rounded shadow-lg text-center">
        <h1 className="text-2xl font-bold text-red-500">
          Marks Modification Closed
        </h1>
        <p>Please contact the admin for further assistance.</p>
      </div>
    </div>
  );
}

const tableHeaders = () => {
  if (currentTeacher?.subjects.some((subject) => subject.subject.name.toLowerCase() === 'arabic' || subject.subject.name.toLowerCase() === 'social arabic')) {
    return ['participation', 'behavior', 'project', 'classActivities', 'workingQuiz', 'finalExam'];
  } else if (currentTeacher?.subjects.some((subject) => subject.subject.name.toLowerCase() === 'islamic')) {
    return ['participation', 'behavior', 'reading', 'memorizing', 'oralTest', 'workingQuiz', 'finalExam'];
  } else {
    return ['participation', 'behavior', 'workingQuiz','project', 'finalExam', ];
  }
};

  return (
    <div className="mx-auto pt-24 p-6 min-h-screen">
      <Toaster position="top-right" />
      <div className='flex items-center justify-between mx-auto shadow-lg mb-4 px-4 flex-wrap'>
      <h1 className="text-lg py-2 font-bold bg-main md:w-fit w-full text-center text-white md:py-1 px-4 my-6 rounded-md">Hello, {teacherDetails?.name}</h1>
      <p className=' md:text-xl font-bold text-main mb-2'>Subject : <span className='text-red-500'>{currentTeacher?.subjects[0]?.subject.name}</span></p>
      <h2 className='mb-2'>
        
      <CountdownWrapper onCountdownEnd={handleCountdownEnd} />
      </h2>
      </div>
     <div className='flex my-4 justify-center text-main font-semibold gap-4 md:gap-8 lg:gap-12  items-center flex-wrap'>
     
      <div className=" w-full md:w-fit">
        {/* <label htmlFor="academicYear" className="block text-lg">Select Academic Year:</label> */}
        <select
          id="academicYear"
          value={academicYear}
          onChange={(e) => setAcademicYear(e.target.value)}
          className="border p-2 rounded w-full"
        >
          <option value="">-- Select Academic Year --</option>
          {academicYears.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <div className="w-full md:w-fit">
      
        <select
          id="trimester"
          value={trimester}
          onChange={(e) => setTrimester(e.target.value)}
          className="border p-2 rounded w-full"
        >
          <option value="">-- Select Trimester --</option>
          {trimesters.map((trimesterOption) => (
            <option key={trimesterOption} value={trimesterOption}>
              {trimesterOption}
            </option>
          ))}
        </select>
      </div>

      {currentTeacher?.subjects.length > 1 && (
        <div className=" hidden ">
          <label htmlFor="subjectSelect" className="block my-2 text-xl font-medium ">
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
        <div className="w-full md:w-fit">
         
          <select
            id="classSelect"
            value={selectedClassId}
            onChange={handleClassChange}
            className="border  p-2 rounded w-full  "
          >
            <option value="">-- Select a Class --</option>
            {currentTeacher.classes.map((classItem) => (
              <option key={classItem.class.id} value={classItem.class.id}>
                {classItem.class.name}
              </option>
            ))}
          </select>
        </div>
      )}
     </div>

      {students.length > 0 && (
        <div className="overflow-x-scroll">
         <div className='flex items-center justify-between'>
         <h2 className="md:text-xl text-main font-bold my-4">Students in Class</h2>  <button
        onClick={navigateToProgressReport}
        className="bg-main hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
      >
        Students Progress Report
      </button>
         </div>
          <table className="min-w-full bg-white shadow-lg rounded-lg border">
          <thead className="bg-gray-200">
  <tr>
    <th className="p-3 text-center text-black">NO</th>
    <th className="p-3 text-center text-black">Name</th>
    {tableHeaders().map((field) => (
      <th key={field} className="p-3 text-center text-black">
        {/* Conditional display names for workingQuiz and finalExam */}
        {field === 'workingQuiz' ? 'Quiz' : field === 'finalExam' ? 'Exam' : field === 'behavior' ? 'Homework' : field.charAt(0).toUpperCase() + field.slice(1)}
        
        <div className='mt-1 text-main'>
        <button
          onClick={() => fillAllMarks(field as keyof Mark)}
          className="ml-2  hover:bg-gray-400 text-[14px] underline font-bold py-1 px-2 rounded ">
          Fill
        </button>
        <button
          onClick={() => resetAllMarks(field as keyof Mark)}
          className="ml-2  hover:bg-gray-400 underline text-[14px] font-bold py-1 px-2 rounded "
        >
          Reset 
        </button>
        </div>
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
                  {tableHeaders().map((field) => (
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
