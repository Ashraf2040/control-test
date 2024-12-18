'use client';

import { useRef, useState, useEffect } from 'react';
import { Class, Student, Subject } from '@prisma/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getTeachersProgress } from '@/lib/actions';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useLocale, useTranslations } from 'next-intl';

interface AdminUIProps {
  subjects: Subject[];
}

interface Teacher {
  id: string;
  email: string;
  name: string;
  arabicName: string;
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
  reading?: number;
  memorizing?: number;
  oralTest?: number;
  classActivities?: number;
}

const headerToDataKeyMap: { [key: string]: keyof LocalStudent } = {
  
  'Class Activities': 'classActivities',
  'Quiz': 'workingQuiz', // Changed from 'Working Quiz' to 'Quiz'
  'Exam': 'finalExam', // Changed from 'Final Exam' to 'Exam'
  'Participation': 'participation',
  'Homework': 'behavior', // Changed from 'Behavior' to 'Homework'
  'Project': 'project',
  'Reading': 'reading',
  'Memorizing': 'memorizing',
  'Oral Test': 'oralTest',
};

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
  const getMaxValues = (subject: string) => {
    switch (subject.toLowerCase()) {
      case '8':
      case '6':
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
      case '7':
        return {
          participation: 10,
          behavior: 10,
          reading: 10,
          memorizing: 10,
          oralTest: 5,
          workingQuiz: 15,
          finalExam: 40,
          project: 0,
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

  const getInputClass = (value: number | undefined, field: keyof LocalStudent) => {
    const maxValues = getMaxValues(selectedSubjectId || '');
    const maxValue = maxValues[field];
    const isBelowThreshold = (value || 0) < maxValue * 0.66;
    return `w-full text-center ${isBelowThreshold ? 'bg-red-100' : ''}`;
  };
  const fetchClasses = async (teacherId: string) => {
    const res = await fetch(`/api/classesByAdmin?teacherId=${teacherId}&subjectId=${selectedSubjectId}`);
    if (!res.ok) throw new Error('Failed to fetch classes');
    const data = await res.json();
    console.log(data);
    return data;
  };

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
          classActivities: mark.classActivities || 0,
          reading: mark.reading || 0,
          memorizing: mark.memorizing || 0,
          oralTest: mark.oralTest || 0,
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
    if (selectedTeacher && locale === 'en') {
      setSelectedTeacherEmail(selectedTeacher.name);
      console.log(selectedTeacher);
    }else if (selectedTeacher && locale === 'ar'){
      setSelectedTeacherEmail(selectedTeacher.arabicName)
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

  const getDynamicHeaders = () => {
    if (!selectedSubjectId) return [];
  
    if (selectedSubjectId === '8' || selectedSubjectId === '6') {
      return ['Participation', 'Homework', 'Project', 'Class Activities', 'Quiz', 'Exam'];
    }
  
    if (selectedSubjectId === '7') {
      return ['Participation', 'Homework', 'Reading', 'Memorizing', 'Oral Test', 'Quiz', 'Exam'];
    }
  
    return ['Participation', 'Homework', 'Quiz', 'Exam', 'Project'];
  };

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

  const dynamicHeaders = getDynamicHeaders()
   const t= useTranslations('admin');
  console.log(students);

  const locale = useLocale();
  return (
    <div className="w-full mx-auto p-6 pt-24 bg-white rounded-lg shadow-lg">
      <div className='flex justify-between items-center mb-3 flex-wrap print:hidden gap-2 '>
      {/* <h1  className="text-white w-full md:max-w-fit bg-main text-center rounded px-4 py-2 font-semibold mb-2">Admin Dashboard
      </h1> */}
      <h1  className="text-main w-full md:max-w-fit md:text-xl  text-center rounded px-4 py-2 font-bold mb-2">{ locale=== 'en' ? t("1st"):"" } {t('Trimester Data Entray')} { locale=== 'ar' ? t("1st"):"" } <span className='text-[#e16262]'> 
          (2024-2025)</span> 
      </h1>

      <div className='flex flex-wrap  gap-2 w-full md:w-fit'>
        
        <button
        className="text-white w-full md:max-w-fit bg-main text-center rounded px-4 py-2 font-semibold mb-2"
        onClick={() => router.push('/teacherCreation')}
      >
        {t('Create Teacher')}
      </button>
      <button
  className="text-white w-full md:max-w-fit bg-main text-center rounded px-4 py-2 font-semibold mb-2"
  onClick={() => router.push('/teacherProgress')}
>
  {t('Teacher Management')}
</button>

<button
  className="text-white w-full md:max-w-fit bg-main text-center rounded px-4 py-2 font-semibold mb-2"
  onClick={() => router.push('/studentsManage')}
>
 {t('Student Management')}
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

      <div className="my-6 mx-auto   text-main font-semibold px-1 md:px-8 py-2  print:hidden flex w-fit gap-2 md:gap-12 lg:gap-20 flex-wrap justify-center items-center  ">
      <div className='flex w-full md:w-fit bg-main rounded  gap-2 items-center justify-center'>
      {/* <h2 className="text-xl font-semibold ">Select Academic Year</h2> */}
  <select
    className="border w-full rounded p-3  focus:outline-none focus:ring-2 focus:ring-[#5C2747]"
    onChange={(e) => setSelectedAcademicYear(e.target.value)}
    defaultValue=""
  >
    <option value="" disabled>
     {t('selectAcademicYear')}
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
      className="border rounded p-3 w-full md:w-fit  focus:outline-none focus:ring-2 focus:ring-[#5C2747]"
      onChange={(e) => setSelectedTrimester(e.target.value)}
      defaultValue=""
    >
      <option value="" disabled className='max-w-fit'>
        {t('selectTrimester')}
      </option>
      <option value="First Trimester">{t('First Trimester')}</option>
      <option value="Second Trimester">{t('Second Trimester')}</option>
      <option value="Third Trimester">{t('Third Trimester')}</option>
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
             {t('selectSubject')}
            </option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id} >
                {locale === 'en' ? subject.name : subject.arabicName}
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
             {t('selectTeacher')}
            </option>
            {teachers.map((teacher: Teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {locale === 'en' ? teacher.name :teacher.arabicName}
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
             {t('selectClass')}
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
          
          <table className="min-w-full border-collapse border border-gray-200 text-sm">
  <thead className="bg-main text-white">
    <tr>
      <th className="border p-2">{t('no')}</th>
      <th className="border p-2">{t('name')}</th>
      {dynamicHeaders.map((header) => (
        <th key={header} className="border p-2">
          {t(`${header}`)}
        </th>
      ))}
      <th className="border p-2">{t('total')}</th>
    </tr>
  </thead>
  <tbody>
    {students.map((student, index) => (
      <tr key={student.id} className=" text-gray-700 even:bg-gray-100">
        <td className="border text-center p-2 bg-transparent">{index + 1}</td>
        <td className="border text-center font-semibold p-2 bg-transparent">
        <Link href={`/students/${student.id}/results`}>{locale === 'en' ? student.name : student.arabicName}</Link>
        
        
        </td>
        {dynamicHeaders.map((header) => {
          const field = headerToDataKeyMap[header];
          const maxValue = getMaxValues(selectedSubjectId ?? '')[field] || 0;
          const markValue = marks[student.id]?.[field] ?? 0;

          return (
            <td key={header} className="border text-center p-2 bg-transparent">
              <input
                type="number"
                value={markValue}
                onChange={(e) =>
                  handleInputChange(student.id, field, Number(e.target.value) || 0)
                }
                max={maxValue}
                className={`${
                  markValue < maxValue * 0.66 ? 'bg-red-200' : 'bg-transparent'
                } w-full text-center `}
              />
            </td>
          );
        })}
        <td className="border text-center p-2">
          {Object.values(marks[student.id] || {}).reduce(
            (acc, value) => acc + (value || 0),
            0
          )}
        </td>
      </tr>
    ))}
  </tbody>
</table>

          <div className={`bg-gray-100 p-2 my-2 font-semibold grid-cols-3 hidden md:flex md:justify-between md:Px-8 ${locale === 'en' ? 'md:pr-36 lg:pr-64' : 'md:pl-36 lg:pl-64'}`}>
            <p className="text-lg ">{locale === 'en' ? 'Teacher: ' : 'اسم المعلم :'} {selectedTeacherEmail}</p>
            <p className="text-lg ">{locale === 'en' ? 'Class : ' : 'الفصل :'}  {classes?.find((c) => c.class.id === selectedClassId)?.class.name}</p>
            <p className="text-lg ">{locale === 'en' ? 'Signature : ' : 'التوقيع :'}  </p>
          </div>
          <div className="mt-2 flex gap-4 justify-end print:hidden">
    <button
      className="py-2 px-4 bg-main text-white rounded mr-2"
      onClick={handleSaveMarks}
    >
      {locale === 'en' ? 'Save Marks' :'حفظ الدرجات'}
    </button>
    <button className="py-2 px-4 bg-main text-white rounded" onClick={handlePrintCertificate}>
      {locale==='en' ? 'Print ' : 'طباعة'}
    </button>
  </div>
        </div>
      )}
    </div>
  );
};;

export default AdminUI;
