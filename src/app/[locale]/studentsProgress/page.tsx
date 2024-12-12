"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation'; // Import useSearchParams
import toast from 'react-hot-toast';
import 'react-toastify/dist/ReactToastify.css';
import { revalidatePath } from 'next/cache';
import { useLocale, useTranslations } from 'next-intl';
interface Student {
  id: string;
  name: string;
  class: string;
}

interface Report {
  id: string;
  status: string; // 'Done' or 'Not Yet'
}

const StudentsProgress: React.FC = () => {
  const searchParams = useSearchParams(); // Use useSearchParams hook
  const className = searchParams.get('class');
  const teacherName = searchParams.get('teacherName');
  const trimester = searchParams.get('trimester');
  const subject = searchParams.get('subject');
  console.log(className, teacherName, trimester, subject)
  const [students, setStudents] = useState<Student[]>([]);
  const [reports, setReports] = useState<Record<string, Report>>({});
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [reportFormData, setReportFormData] = useState({
    presentStatus: '',
    recommendations: [],
    comment: '',
    quizMark: '',
    projectMark: '',
    // Add comment field here
  });

  useEffect(() => {
    const fetchStudents = async () => {
      // Validate if className, subject, and trimester are not empty or undefined
      if (!className || !subject || !trimester) {
        console.log('Missing required parameters: className, subject, or trimester');
        return;
      }
  
      try {
        const url = `/api/studentsProgress?className=${className}&subject=${subject}&trimester=${trimester}&teacherName=${teacherName}`;
        console.log(`Fetching students with URL: ${url}`);
  
        const response = await fetch(url);
  
        if (!response.ok) throw new Error('Failed to fetch students.');
        const data = await response.json();
  
        console.log('Fetched students:', data);
        setStudents(data);
      } catch (error) {
        console.error(error);
        toast.error('Error fetching students.');
      }
    };
  
    fetchStudents();
  }, [className, subject, trimester, teacherName]); // Ensure dependencies are correctly set

  const handleAddReport = (student: Student) => {
    setSelectedStudent(student);
    setReportFormData({ presentStatus: '', recommendations: [], comment: '', quizMark: '', projectMark: '' }); // Reset the form
  };

  const handleSaveReport = async () => {
    if (!selectedStudent) return;
  
    try {
      const response = await fetch('/api/saveStudentReport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          report: reportFormData,
          className,
          subject,
          trimester,
          teacherName,
        }),
      });
  
      if (!response.ok) throw new Error('Failed to save report.');
  
      // Update the students state to mark the report as "Done"
      setStudents((prevStudents) =>
        prevStudents.map((student) =>
          student.id === selectedStudent.id
            ? { ...student, reportStatus: 'Done' }
            : student
        )
      );
  
      toast.success('Report saved successfully!');
      setSelectedStudent(null);
    } catch (error) {
      console.error(error);
      toast.error('Error saving the report.');
    }
  };
  
  
const locale =useLocale();
  console.log(students);
const t = useTranslations('Progress');
  return (
    <div className="mx-auto pt-24 p-6 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-center">
     {t('studentsProgressReport')}  -  {className}
      </h1>
      <table className="min-w-full bg-white shadow-lg rounded-lg border">
        <thead className="bg-gray-200">
          <tr>
            <th className={`p-3 ${locale==="en" ? 'text-left':'text-right'}`}>{t('no')} </th>
            <th className={`p-3 ${locale==="en" ? 'text-left':'text-right'}`}> {t('name')}</th>
            <th className={`p-3 ${locale==="en" ? 'text-left':'text-right'}`}>{t('class')}</th>
            <th className={`p-3 ${locale==="en" ? 'text-left':'text-right'}`}>{t('trimester')}</th>
            <th className={`p-3 ${locale==="en" ? 'text-left':'text-right'}`}>{t('report')}</th>
          </tr>
        </thead>
        <tbody>
        {students.map((student, index) => (
  <tr key={student.id} className="even:bg-gray-200 odd:bg-gray-100">
    <td className={`p-3 ${locale==="en" ? 'text-left':'text-right'}`}>{index + 1}</td>
    <td className={`p-3 ${locale==="en" ? 'text-left':'text-right'}`}>{ locale==="en" ? student.name : student.arabicName}</td> {/* Render the name of the student */}
    <td className={`p-3 ${locale==="en" ? 'text-left':'text-right'}`}>{student.class?.name}</td> {/* Assuming class is an object */}
    <td className={`p-3 ${locale==="en" ? 'text-left':'text-right'}`}>
      
      {t(`${trimester}`)}
      
      
      </td>
    <td className={`p-3 ${locale==="en" ? 'text-left':'text-right'}`}>
  {student.reportStatus === 'Done' ? (
    <h1 className=" text-green-700 font-bold ">{t('done')}</h1>
  ) : (
    <button
      onClick={() => handleAddReport(student)}
      className="bg-main hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
    >
     {t('addReport')}
    </button>
  )}
</td>
  </tr>
))}

        </tbody>
      </table>

      {selectedStudent && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center ">
          <div className="bg-white p-6 rounded shadow-lg w-2/5">
            <h2 className="text-xl font-bold mb-4">
              {locale==="en" ? 'Add Report for' : 'إضافة تقرير لـ'} {locale==="en" ? selectedStudent.name : selectedStudent.arabicName}</h2>
            <form>
              <div>
                <label className="block font-bold mb-2">{t('presentStatus')}:</label>
                <select
                  value={reportFormData.presentStatus}
                  onChange={(e) =>
                    setReportFormData((prev) => ({
                      ...prev,
                      presentStatus: e.target.value,
                    }))
                  }
                  className="w-full border p-2 rounded"
                >
                  <option value="">{t('select')}</option>
                  <option value="Excellent">{t('excellent')}</option>
                  <option value="Good">{t('good')}</option>
                  <option value="Average">{t('average')}</option>
                  <option value="Below Average">{t('belowAverage')}</option>
                </select>
              </div>

              <div className="mt-4 ">
                <label className="block font-bold mb-2">{t('recommendations')}:</label>
                <div className='flex  flex-wrap items-center justify-between'>
                  {[`${t('continuedGoodWork')}`, `${t('betterWrittenWork')}`, `${t('moreSeriousApproach')}`, `${t('increasedPreparationAndStudy')}`, `${t('increasedClassParticipation')}`, `${t('additionalHelpNeeded')}`].map((rec) => (
                    <div key={rec} className="mb-2 ">
                      <label>
                        <input
                          type="checkbox"
                          value={rec}
                          checked={reportFormData.recommendations.includes(rec)}
                          onChange={(e) => {
                            const newRecs = e.target.checked
                              ? [...reportFormData.recommendations, rec]
                              : reportFormData.recommendations.filter((r) => r !== rec);
                            setReportFormData((prev) => ({
                              ...prev,
                              recommendations: newRecs,
                            }));
                          }}
                          className={locale==="en" ? 'mr-2' : 'ml-2'}
                        />
                        {rec}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add comment textarea */}
              <div className="mt-4">
                <label className="block font-bold mb-2">{t('comment')}:</label>
                <textarea
                  value={reportFormData.comment}
                  onChange={(e) =>
                    setReportFormData((prev) => ({
                      ...prev,
                      comment: e.target.value,
                    }))
                  }
                  className="w-full border p-2 rounded"
                  rows={4}
                  placeholder={locale==="en" ? 'add comment' : 'كتابة تعليق'}
                />
              </div>
  <div className='flex gap-4 '>
  <div className="mt-4">
                <label className="block font-bold mb-2">{t('quizMark')} :</label>
                <input
                  type="number"
                  value={reportFormData.quizMark}
                  onChange={(e) =>
                    setReportFormData((prev) => ({
                      ...prev,
                      quizMark: e.target.value,
                    }))
                  }
                  className="w-full border p-2 rounded"
                  placeholder={locale==="en" ? 'Enter quiz mark' : 'درجة الاختبار'}
                />
   </div>
   <div className="mt-4">
                <label className="block font-bold mb-2">{t('projectMark')} :</label>
                <input
                  type="number"
                  value={reportFormData.projectMark}
                  onChange={(e) =>
                    setReportFormData((prev) => ({
                      ...prev,
                      projectMark: e.target.value,
                    }))
                  }
                  className="w-full border p-2 rounded"
                  placeholder={locale==="en" ? 'Enter project mark' : 'درجة المشروع'}
                />
   </div>
  </div>
              <button
                type="button"
                onClick={handleSaveReport}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-4"
              >
                {t('saveReport')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsProgress;
