'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Toaster } from 'react-hot-toast';
import 'react-toastify/dist/ReactToastify.css';

const StudentsReportPage = () => {
  const [studentsReports, setStudentsReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [classes, setClasses] = useState([]);
  const [filter, setFilter] = useState({ name: '', classId: '' });
  const router = useRouter();

  // Fetch reports and classes on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all student reports
        const reportsResponse = await fetch('/api/getAllStudentReports');
        if (!reportsResponse.ok) throw new Error('Failed to fetch reports');
        const reportsData = await reportsResponse.json();
        setStudentsReports(reportsData);
        setFilteredReports(reportsData);

        // Fetch all classes
        const classesResponse = await fetch('/api/getAllClasses');
        if (!classesResponse.ok) throw new Error('Failed to fetch classes');
        const classesData = await classesResponse.json();
        setClasses(classesData);
      } catch (error) {
        toast.error(error.message || 'An error occurred while fetching data.');
      }
    };

    fetchData();
  }, []);

  // Update filtered reports when filters change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
  
    // Update the filter state
    setFilter((prevFilter) => {
      const updatedFilter = { ...prevFilter, [name]: value };
  
      // Filter the reports
      const filtered = studentsReports.filter((report) => {
        const matchesName =
          !updatedFilter.name ||
          (report.name &&
            report.name.toLowerCase().includes(updatedFilter.name.toLowerCase()));
        const matchesClass =
          !updatedFilter.classId || report.class.id === updatedFilter.classId;
  
        return matchesName && matchesClass;
      });
  
      // Update the filtered reports state
      setFilteredReports(filtered);
  
      return updatedFilter;
    });
  };
  
console.log(filteredReports);
console.log(classes);
  // Navigate to the report details page
  const handleViewReport = (studentId : string) => {
    if (studentId) router.push(`/studentsReport/${studentId}`);
  };

  // Open the print preview for the report
  const handlePrintReport = (reportId: string) => {
    if (reportId) window.open(`/api/printStudentReport/${reportId}`, '_blank');
  };

  return (
    <div className="p-6 my-24">
      <Toaster position="top-right" />
      <h1 className="text-2xl font-semibold mb-6 text-center text-main">Students Reports</h1>

      {/* Filter Section */}
      <div className="flex gap-4 mb-6 flex-wrap items-center">
        <input
          type="text"
          name="name"
          value={filter.name}
          onChange={handleFilterChange}
          placeholder="Search by Name"
          className="border p-2 rounded w-[60%] md:w-1/3"
        />
        <select
          name="classId"
          value={filter.classId}
          onChange={handleFilterChange}
          className="border p-2 rounded w-1/3"
        >
          <option value="">All Classes</option>
          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.name}
            </option>
          ))}
        </select>
      </div>

      {/* Students Reports Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead className="bg-gray-200 text-sm">
            <tr>
              <th className="border p-4">No</th>
              <th className="border p-4">Student Name</th>
              <th className="border p-4">Class</th>
              <th className="border p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.map((report, index) => (
              <tr
                key={report.id}
                className="even:bg-gray-50 hover:bg-gray-100 transition duration-300"
              >
                <td className="border p-4">{index + 1}</td>
                <td className="border p-4">{report?.name || 'No Student Assigned'}</td>
                <td className="border p-4">
                  {classes?.find((cls) => cls.id === report.class.id)?.name || 'Unknown Class'}
                </td>
                <td className="border p-4 flex gap-2 justify-center">
                  <button
                    onClick={() => handleViewReport(report.id)}
                    className="text-main hover:underline transition duration-200"
                    
                  >
                    View
                  </button>
                  {/* <button
                    onClick={() => handlePrintReport(report.id)}
                    className="text-main hover:underline transition duration-200"
                  >
                    Print
                  </button> */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentsReportPage;
