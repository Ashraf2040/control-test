"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'react-toastify';
import Image from 'next/image';
import { useTrail } from '@react-three/drei';
import { useTranslations } from 'next-intl';

const StudentFullReport = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [studentName, setStudentName] = useState<string>('');
  const [studentGrade, setStudentGrade] = useState<string>(''); // New state for grade
  const [date, setDate] = useState<string>(''); // New state for date
  const [noteToParents, setNoteToParents] = useState<string>(''); // New state for note to parents
  const router = useRouter();
  const params = useParams();
const t = useTranslations("report")
  useEffect(() => {
    const fetchStudentReports = async () => {
      try {
        const response = await fetch(`/api/getStudentFullReport/${params.id}`);
        if (!response.ok) throw new Error('Failed to fetch student reports');
        const data = await response.json();
        setStudentName(data[0]?.studentName || 'Unknown Student');
        setStudentGrade(data[0]?.class?.name || 'Unknown Grade'); // Set the grade
        setDate(new Date(data[0]?.createdAt).toLocaleDateString() || 'Date Not Provided'); // Format the date
        setNoteToParents('This report offers an opportunity for better understanding of the student\'s current achievement. Please study the comments below in order that steps can be taken to bring about progress, where needed, by the end of the period.');
        setReports(data);
      } catch (error) {
        toast.error('Error fetching student report.');
      }
    };

    fetchStudentReports();
  }, [params.id]);

  const handlePrint = () => {
    window.print();
  };

  const getTerms = (subjectName: string) => {
    const arabicSubjects = ['Arabic', 'Social Arabic', 'Islamic'];
    if (arabicSubjects.includes(subjectName)) {
      return {
        subject: 'المادة',
        teacher: 'المعلم',
        status: 'مستوي الطالب',
        recommendations: 'بعض التوصيات',
        comment: 'تعليق',
        signature: 'التوقيع',
        project: 'المشروع',
        quiz: 'الاختبار الفتري',
      };
    } else {
      return {
        subject: 'Subject',
        teacher: 'Teacher',
        status: 'Status',
        recommendations: 'Recommendations',
        comment: 'Comment',
        signature: 'Signature',
        project: 'Project',
        quiz: 'Quiz',
      };
    }
  };
console.log(reports)
const sortedReports = reports.sort((a, b) => { const arabicSubjects = ['Arabic', 'Social Arabic', 'Islamic']; 
  const isAArabic = arabicSubjects.includes(a.subject.name); 
  const isBArabic = arabicSubjects.includes(b.subject.name); return isAArabic === isBArabic ? 0 : isAArabic ? 1 : -1; });
  return (
    <div className="p-6 my-24 mx-auto print:p-6 print:m-0 max-w-7xl" dir="ltr">
      {/* Add the top box with student details */}
      <div className="border-4 border-[#CFCEFF] rounded-lg p-4 shadow-lg mb-6 bg-[#EDF9FD]">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="flex items-center justify-center relative">
            <Image src="/forqan1.png" width={200} height={200} alt="Logo" className="absolute left-2 w-32" />
            <div className="font-bold">
              <p className="text-md text-center mb-4">AL FORQAN PRIVATE SCHOOL</p>
              <p className="text-md text-center mb-4">AMERICAN DIVISION</p>
            </div>
          </div>

          <div className="flex flex-col gap-2 ml-8 relative">
            <button onClick={handlePrint} className="absolute right-0 font-bold py-1 px-3 rounded print:hidden">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z"
                />
              </svg>
            </button>
            <p className="font-bold flex items-center gap-6">
              <strong className="font-extrabold ">STUDENT'S NAME:</strong> {studentName}
            </p>
            <p className="font-semibold flex items-center gap-6">
              <strong className="font-extrabold">GRADE:</strong> {studentGrade}
            </p>
            <p className="font-semibold flex items-center gap-6">
              <strong className="font-extrabold">DATE:</strong> {date}
            </p>
          </div>
        </div>
        <p className="mt-4 italic p-4">
          <strong>NOTE TO PARENTS:</strong> {noteToParents}
        </p>
      </div>

      {/* Student reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedReports?.map((report, index) => {
          const arabicSubjects = ['Arabic', 'Social Arabic', 'Islamic'];
          const isArabicSubject = arabicSubjects.includes(report.subject.name);
          const direction = isArabicSubject ? 'rtl' : 'ltr';
          const terms = getTerms(report.subject.name);
          return (
            <div key={index} className={`border border-gray-300 rounded-lg p-6 shadow-lg even:bg-[#F1F0FF] odd:bg-[#FEFCE8]`} style={{ direction }}>
              <div className="mb-4 flex items-center justify-around mx-auto relative">
                <h3 className="text-xl font-bold mb-2">{terms.subject} : {isArabicSubject ? report.subject.arabicName : report.subject.name}</h3>
                <p className="text-lg mb-2 font-bold"><strong>{terms.teacher} : </strong> {isArabicSubject ? report.teacher.arabicName : report.teacher.name}</p>
              </div>
              <p className="text-xl mb-4"><strong>{terms.status}: </strong> <span className='font-bold underline'>{isArabicSubject ?t( report.status): report.status || 'Not Provided'}</span></p>
              <p className="text-md mb-2"><strong>{terms.recommendations}:</strong> {report.recommendations?.map((rec, idx) => <li key={idx}>{rec}</li>) || 'No Recommendations'}</p>
              <p className="text-md"><strong>{terms.comment}:</strong> {report.comment || 'No Comment Provided'}</p>
              <div className='flex items-center justify-between mt-4'>
                <p className="text-md"><strong>{terms.quiz}: </strong><span className='font-bold'>{report.quizScore || 'N/A'}</span> </p>
                <p className="text-md"><strong>{terms.project}: </strong> <span className='font-bold'>{report.projectScore || 'N/A'}</span></p>
                <p className="flex items-center justify-center">
                  <span><strong>{terms.signature}: </strong></span>
                  <Image src={report.teacher.signature || ""} alt="signature" width={100} height={100} className='h-16 w-32' />
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StudentFullReport