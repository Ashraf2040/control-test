import PrintButton from '@/app/_components/PrintButton';
import { getStudentWithMarks } from '@/lib/actions';
import Image from 'next/image';
import React, { Suspense } from 'react';

export default async function StudentResultsPage({ params }: { params: { id: string } }) {
  const studentId = params.id;
  const studentData = await getStudentWithMarks(studentId);

  if (!studentData) {
    return <p>Student not found.</p>;
  }

  const { name, class: classData, marks} = studentData;

  const marksToView = marks.filter((mark) => mark.trimester === "First Trimester");
  console.log(studentData)
   console.log(marksToView)
  // Check if the student has an unpaid expense
  // if (expenses === "unpaid") {
  //   return (
  //     <div className="flex items-center justify-center h-screen">
  //     <div className="bg-white p-6 rounded shadow-lg text-center">
  //       <h1 className="text-2xl font-bold text-red-500">
  //         Ther Is A Financial Issue
  //       </h1>
  //       <p className='mt-4 font-semibold'>Please contact the admin for further assistance.</p>
  //     </div>
  //   </div>
  //   );
  // }

  // Calculate the total marks and average
  const totalMarksSum = marksToView.reduce((sum, mark) => sum + mark.totalMarks, 0);
  const numberOfSubjects = marksToView.length;
  const averagePercentage = (totalMarksSum / (numberOfSubjects * 100)) * 100;

  

  const calculateGrade = (totalMarks: number) => {
    if (totalMarks >= 96) return "A+";
    if (totalMarks >= 93) return "A";
    if (totalMarks >= 89) return "A-";
    if (totalMarks >= 86) return "B+";
    if (totalMarks >= 83) return "B";
    if (totalMarks >= 79) return "B-";
    if (totalMarks >= 76) return "C+";
    if (totalMarks >= 73) return "C";
    if (totalMarks >= 69) return "C-";
    if (totalMarks >= 66) return "D+";
    if (totalMarks >= 63) return "D";
    if (totalMarks >= 60) return "D-";
    return "Below B-";
  };
  const getDynamicHeaders = (subjectName: string) => {
    if (subjectName === 'Arabic' || subjectName === 'Social Arabic') {
      return ['participation', 'behavior', 'project', 'classActivities', 'workingQuiz', 'finalExam'];
    }
  
    if (subjectName === 'Islamic') {
      return ['participation', 'behavior', 'reading', 'memorizing', 'oralTest', 'workingQuiz', 'finalExam'];
    }
  
    return ['participation', 'behavior', 'workingQuiz', 'finalExam', 'project'];
  };
  const headerNameMapping = {
    workingQuiz: "Quiz",
    finalExam: "Exam",
    behavior: "Homework",
    classActivities: "Class Activities",
    project: "Project",
    participation: "Participation",
  };
  const getDisplayHeader = (header: string) => {
    return headerNameMapping[header] || header; // Default to the original name if not mapped
  };
  const groupedMarks = marksToView.reduce((groups, mark) => {
    const headers = getDynamicHeaders(mark.subject.name).join(); // Join headers to create a unique group key
    if (!groups[headers]) {
      groups[headers] = [];
    }
    groups[headers].push(mark);
    return groups;
  }, {});
  return (
    <div className="report-card relative ">
      <header className="report-header flex-col pt-24 flex items-center justify-center relative">
        <h1 className="text-5xl font-bold">
          <span className="text-extrabold text-3xl underline">1st</span> Trimester Result Notification For The Academic Year <span className="text-[#e16262]">2024/2025</span>
        </h1>
        <div className='absolute right-0 print:hidden'>
          <PrintButton />
        </div>
      </header>

      <Suspense fallback={<p>Loading table data...</p>}>
        <div>
          <table className="student-table w-full border-2 border-main mb-2">
            <thead className="px-2 relative">
              <tr className="grid grid-cols-6  even:bg-[#e0e0e0] mb-1">
                <td className="col-span-1 bg-main text-white border-main font-semibold px-2">Student Name :</td>
                <td className="col-span-2 font-semibold px-2">{name}</td>
                <td className="col-span-2 font-semibold px-2 text-right">{name}</td>
                <td dir='rtl' className="col-span-1 bg-main text-white border-main font-semibold px-2 text-right">اسم الطالب :</td>
              </tr>
              <tr className="grid grid-cols-6 even:bg-[#e0e0e0] mb-1">
                <td className="col-span-1 bg-main text-white font-semibold px-2">Nationality :</td>
                <td className="col-span-2 font-semibold px-2">Saudi</td>
                <td className="col-span-2 font-semibold px-2 text-right">سعودي</td>
                <td dir='rtl' className="col-span-1 bg-main text-white font-semibold px-2 ">الجنسية :</td>
              </tr>
              <tr className="grid grid-cols-6 even:bg-[#e0e0e0] mb-1">
                <td className="col-span-1 bg-main text-white font-semibold px-2">Birth Date :</td>
                <td className="col-span-2 font-semibold px-2">12/12/2013</td>
                <td className="col-span-2 font-semibold px-2 text-right">2013/12/12</td>
                <td dir='rtl' className="col-span-1 bg-main text-white font-semibold px-2 text-right">تاريخ الميلاد :</td>
              </tr>
              <tr className="grid grid-cols-6 even:bg-[#e0e0e0] mb-1">
                <td className="col-span-1 bg-main text-white font-semibold px-2">ID / Iqama No :</td>
                <td className="col-span-2 font-semibold px-2">123456789</td>
                <td className="col-span-2 font-semibold px-2 text-right">123456789</td>
                <td dir='rtl' className="col-span-1 bg-main text-white font-semibold px-2 text-right">رقم الهوية / الاقامة :</td>
              </tr>
              <tr className="grid grid-cols-6 even:bg-[#e0e0e0] ">
                <td className="col-span-1 bg-main text-white font-semibold px-2">Passport No :</td>
                <td className="col-span-2 font-semibold px-2">0001200000</td>
                <td className="col-span-2 font-semibold px-2 text-right">0001200000</td>
                <td dir='rtl' className="col-span-1 bg-main text-white font-semibold px-2 text-right">رقم الجواز :</td>
              </tr>
              <div className='h-full w-1 bg-main absolute top-0 right-[50%]'></div>
            </thead>
          </table>

          <div className='overflow-x-auto'>
  {Object.entries(groupedMarks).map(([headerKey, subjects]) => {
    const headers = headerKey.split(','); // Reconstruct headers array
    return (
      <div key={headerKey} className="overflow-x-auto sm:overflow-visible ">
        <table
  className={`marks-table w-full text-center border-collapse border border-gray-300 ${
    headers.length > 5 ? "table-fixed" : "px-1"
  }`}
>
  <thead>
    <tr>
      <th className="border border-gray-300 px-1 py-1 w-[12%]">Subject</th>
      {headers.map((header) => (
        <th
          key={header}
          className={`border border-gray-300 px-1 py-1 ${
            headers.length > 5 ? "w-1/12" : "w-[10%]"
          }`}
        >
          {getDisplayHeader(header)} {/* Use mapped header name here */}
        </th>
      ))}
      <th className="border border-gray-300 px-2 py-1 w-1/12">Total</th>
      <th className="border border-gray-300 px-2 py-1 w-1/12">Grade</th>
    </tr>
  </thead>
  <tbody>
    {subjects.map((mark) => (
      <tr key={mark.id || mark.subject.name}>
        <td className="border border-gray-300 px-2 py-1">{mark.subject.name}</td>
        {headers.map((header) => (
          <td key={header} className="border border-gray-300 px-2 py-1">
            {mark[header] || "-"} {/* Directly access mark[header] */}
          </td>
        ))}
        <td className="border border-gray-300 px-2 py-1">{mark.totalMarks}</td>
        <td className="border border-gray-300 px-2 py-1">{calculateGrade(mark.totalMarks)}</td>
      </tr>
    ))}
  </tbody>
</table>
      </div>
    );
  })}
</div>

        </div>
      </Suspense>

      <div className="MEDAL w-2/5 flex gap-8 items-center justify-center mx-auto">
        <div className="flex flex-col gap-3 items-center justify-center">
          <p className="text-xl">Average</p>
          <Image src="/1medal.png" alt="Medal" width={100} height={100} className='relative' />
          <p className='absolute font-semibold text-red-900'>{averagePercentage.toFixed(1)}%</p>
        </div>
        <div className="flex gap-3 flex-col items-center justify-center">
          <p className="text-xl">Total</p>
          <Image src="/1medal.png" alt="Medal" width={100} height={100} className='relative' />
          <p className='absolute font-semibold text-red-900'>{totalMarksSum}</p>
        </div>
      </div>

      <table className="w-full min-h-fit border-main border-2">
        <thead>
          <tr className="grid grid-cols-4">
            <th className="col-span-1 border-2 border-main py-4">Grade Scale</th>
            <th className="col-span-2 border-2 py-4 border-main">
              <p>This document is not the final result but a notification of the Trimester grades.</p>
              <p>* Any alteration or addition to this document is prohibited. *</p>
            </th>
            <th className="col-span-1 border-2 py-4 border-main">
              <p>School Principal</p>
              <p>Mr. Abdulla Shaker Alghamdy</p>
              <p>.............................</p>
            </th>
          </tr>
        </thead>
      </table>
    </div>
  );
}
