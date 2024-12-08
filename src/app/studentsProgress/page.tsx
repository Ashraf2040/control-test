"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation'; // Import useSearchParams
import toast from 'react-hot-toast';
import 'react-toastify/dist/ReactToastify.css';
import { revalidatePath } from 'next/cache';
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
  
  

  console.log(students);

  return (
    <div className="mx-auto pt-24 p-6 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-center">
        Students Progress Report - {className}
      </h1>
      <table className="min-w-full bg-white shadow-lg rounded-lg border">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-3 text-left">No</th>
            <th className="p-3 text-left">Student Name</th>
            <th className="p-3 text-left">Class</th>
            <th className="p-3 text-left">Trimester</th>
            <th className="p-3 text-left">Report</th>
          </tr>
        </thead>
        <tbody>
        {students.map((student, index) => (
  <tr key={student.id} className="even:bg-gray-200 odd:bg-gray-100">
    <td className="p-3">{index + 1}</td>
    <td className="p-3">{student.name}</td> {/* Render the name of the student */}
    <td className="p-3">{student.class?.name}</td> {/* Assuming class is an object */}
    <td className="p-3">{trimester}</td>
    <td className="p-3">
  {student.reportStatus === 'Done' ? (
    <h1 className=" text-green-700 font-bold ">Done</h1>
  ) : (
    <button
      onClick={() => handleAddReport(student)}
      className="bg-main hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
    >
      Add Report
    </button>
  )}
</td>
  </tr>
))}

        </tbody>
      </table>

      {selectedStudent && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-xl font-bold mb-4">Add Report for {selectedStudent.name}</h2>
            <form>
              <div>
                <label className="block font-bold mb-2">Present Status:</label>
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
                  <option value="">-- Select --</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Average">Average</option>
                  <option value="Below Average">Below Average</option>
                </select>
              </div>

              <div className="mt-4">
                <label className="block font-bold mb-2">Recommendations:</label>
                <div>
                  {['Continued Good Work', 'Better Written Work', 'More Serious Approach', 'Increased Preparation and Study', 'Increased Class Participation', 'Additional Help Needed'].map((rec) => (
                    <div key={rec} className="mb-2">
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
                          className="mr-2"
                        />
                        {rec}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add comment textarea */}
              <div className="mt-4">
                <label className="block font-bold mb-2">Comment:</label>
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
                  placeholder="Add a comment"
                />
              </div>
  <div className='flex gap-4 text-center'>
  <div className="mt-4">
                <label className="block font-bold mb-2">Quiz Mark:</label>
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
                  placeholder="Enter quiz mark"
                />
   </div>
   <div className="mt-4">
                <label className="block font-bold mb-2">Project Mark :</label>
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
                  placeholder="Enter quiz mark"
                />
   </div>
  </div>
              <button
                type="button"
                onClick={handleSaveReport}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-4"
              >
                Save Report
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsProgress;
