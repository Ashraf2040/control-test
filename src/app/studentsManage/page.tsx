'use client';
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Toaster } from "react-hot-toast";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";

const StudentPage = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    arabicName: "",
    classId: "",
    nationality: "",
    dateOfBirth: "",
    iqamaNo: "",
    passportNo: "",
    expenses: "paid",
  });
  const [classes, setClasses] = useState<any[]>([]);
  const [filter, setFilter] = useState({ name: "", classId: "" });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch all students
    const fetchStudents = async () => {
      try {
        const response = await fetch("/api/allStudents");
        if (!response.ok) throw new Error("Failed to fetch students");
        const data: Student[] = await response.json();
        setStudents(data);
        setFilteredStudents(data);
      } catch (error) {
        toast.error("Error fetching student data.");
      }
    };

    // Fetch all classes
    const fetchClasses = async () => {
      try {
        const response = await fetch("/api/getAllClasses");
        if (!response.ok) throw new Error("Failed to fetch classes");
        const data = await response.json();
        setClasses(data);
      } catch (error) {
        toast.error("Error fetching classes.");
      }
    };

    fetchStudents();
    fetchClasses();
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Update filter state
    setFilter((prevFilter) => {
      const newFilter = { ...prevFilter, [name]: value };

      // When the name filter is cleared, reset to show all students
      if (name === 'name' && value === '') {
        setFilteredStudents(students);
      } else {
        // Apply filtering logic based on both name and classId
        setFilteredStudents(
          students.filter((student) => {
            const matchesName = student.name.toLowerCase().includes(newFilter.name.toLowerCase());
            const matchesClass = newFilter.classId === "" || student.classId === newFilter.classId;
            return matchesName && matchesClass;
          })
        );
      }
      return newFilter;
    });
  };

  const router = useRouter();
  const handleSettingsClick = (student: Student) => {
    setSelectedStudent(student);
    setFormData({
      name: student.name,
      arabicName: student.arabicName || "",
      classId: student.classId,
      nationality: student.nationality || "",
      dateOfBirth: student.dateOfBirth ? student.dateOfBirth.split("T")[0] : "",
      iqamaNo: student.iqamaNo || "",
      passportNo: student.passportNo || "",
      expenses: student.expenses || "paid",
    });
    setIsFormOpen(true);
  };

  const handleSave = async () => {
    if (!selectedStudent) return;
    setLoading(true);

    try {
      // Migrate marks if class is changed
      if (formData.classId !== selectedStudent.classId) {
        // Send request to backend to migrate marks to the new class
        await fetch("/api/migrateMarks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentId: selectedStudent.id,
            oldClassId: selectedStudent.classId,
            newClassId: formData.classId,
          }),
        });
      }

      const response = await fetch(`/api/updateStudent`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedStudent.id, ...formData }),
      });

      if (!response.ok) throw new Error("Failed to update student data");
      toast.success("Student updated successfully");
      setIsFormOpen(false);

      setStudents(
        students.map((student) =>
          student.id === selectedStudent.id ? { ...student, ...formData } : student
        )
      );
    } catch (error) {
      toast.error("Error updating student.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 my-24 ">
      <Toaster position="top-right" />
      <h1 className="text-2xl font-semibold mb-6 text-center text-main">Students Management</h1>

      {/* Filter Section */}
      <div className="flex gap-4 mb-6  flex-wrap items-center ">
        <input
          type="text"
          placeholder="Search by Name"
          name="name"
          value={filter.name}
          onChange={handleFilterChange}
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
        <div className="lg:right-20 lg:absolute gap-5 flex justify-between items-center">
        <button
          className="text-white    md:max-w-fit bg-main text-center rounded px-4 py-2 font-semibold "
          onClick={() => router.push('/createStudents')}
        >
          Create New Student
        </button>
        <button
          className="text-white md:max-w-fit bg-main text-center rounded px-4 py-2 font-semibold "
          onClick={() => router.push('/bulkUpload')}
        >
         Import  Full Sheet
        </button>
        </div>
      </div>

      {/* Student Table */}
      <div className="overflow-x-scroll">
      <table className="min-w-full border-collapse border border-gray-300 ">
        <thead className="bg-gray-200 text-sm ">
          <tr>
            <th className="border p-4">Name</th>
            <th className="border p-4">Arabic Name</th>
            <th className="border p-4">Class</th>
            <th className="border p-4">Nationality</th>
            <th className="border p-4">Date of Birth</th>
            <th className="border p-4">Iqama No</th>
            <th className="border p-4">Passport No</th>
            <th className="border p-4">Expenses</th>
            <th className="border p-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredStudents.map((student) => (
            <tr key={student.id} className="even:bg-gray-50 hover:bg-gray-100 transition duration-300">
              <td className="border p-4">{student.name}</td>
              <td className="border p-4">{student.arabicName}</td>
              <td className="border p-4">{classes.find((cls) => cls.id === student.classId)?.name}</td>
              <td className="border p-4">{student.nationality}</td>
              <td className="border p-4">{student.dateOfBirth?.split("T")[0]}</td>
              <td className="border p-4">{student.iqamaNo}</td>
              <td className="border p-4">{student.passportNo}</td>
              <td className="border p-4">{student.expenses}</td>
              <td className="border p-4 text-center">
                <button
                  onClick={() => handleSettingsClick(student)}
                  className="text-main hover:underline transition duration-200"
                >
                  ⚙️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      

      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-3/5 shadow-xl">
            <h2 className="text-xl font-semibold mb-4">Edit Student Data</h2>
            <div className="space-y-4">
              <input
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Name"
                className="w-full border p-3 rounded-md text-lg"
              />
              <select
                name="classId"
                value={formData.classId}
                onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                className="w-full border p-3 rounded-md text-lg"
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
              <select
                name="expenses"
                value={formData.expenses}
                onChange={(e) => setFormData({ ...formData, expenses: e.target.value })}
                className="w-full border p-3 rounded-md text-lg"
              >
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </div>
            <div className="mt-4 flex justify-end gap-4">
              <button onClick={() => setIsFormOpen(false)} className="bg-gray-200 px-6 py-2 rounded-md">
                Cancel
              </button>
              <button onClick={handleSave} className="bg-main text-white px-6 py-2 rounded-md">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentPage;
