"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const TeacherCreation = () => {
  const router = useRouter();
  
  const [teacherData, setTeacherData] = useState({
    name: '',
    email: '',
    password: '123456789',
    subjectClassAssignments: [] as { subjectId: string; classId: string }[],  // New structure to hold subject-class pairs
  });
  
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);  // Track selected subject for assignment

  useEffect(() => {
    const fetchSubjects = async () => {
      const response = await fetch('/api/subjects');
      if (response.ok) {
        const subjects = await response.json();
        setSubjects(subjects);
      } else {
        console.error('Failed to fetch subjects');
      }
    };

    const fetchClasses = async () => {
      const response = await fetch('/api/classCreation');
      if (response.ok) {
        const classes = await response.json();
        setClasses(classes);
      } else {
        console.error('Failed to fetch classes');
      }
    };

    fetchSubjects();
    fetchClasses();
  }, []);

  // Update teacherData with selected subject-class pair
  const handleAddSubjectClassPair = (classId: string) => {
    if (selectedSubject) {
      setTeacherData((prevData) => ({
        ...prevData,
        subjectClassAssignments: [
          ...prevData.subjectClassAssignments,
          { subjectId: selectedSubject, classId },
        ],
      }));
      setSelectedSubject(null);  // Reset selected subject after assignment
    }
  };

  // Handle other input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTeacherData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit form data
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch('/api/teachersCreation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(teacherData),
    });

    if (response.ok) {
      alert('Teacher created successfully!');
      router.push('/admin');
    } else {
      alert('Failed to create teacher');
    }
  };

  const returnToHome=()=>{
    router.push('/admin')
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg mt-10 relative">

<button className='absolute flex items-center justify-center right-1 top-1 text-white font-bold bg-main  px-2 rounded text-lg' onClick={returnToHome} >x</button>
      <h1 className="text-2xl font-semibold text-center mb-6">Create New Teacher</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Basic Info */}
        <div>
          <label className="block text-lg font-medium text-gray-700">Name:</label>
          <input
            type="text"
            name="name"
            value={teacherData.name}
            onChange={handleChange}
            required
            className="mt-2 p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-lg font-medium text-gray-700">Email:</label>
          <input
            type="email"
            name="email"
            value={teacherData.email}
            onChange={handleChange}
            required
            className="mt-2 p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Select Subject and Assign Class */}
        <div>
          <label className="block text-lg font-medium text-gray-700">Subjects:</label>
          <select
            onChange={(e) => setSelectedSubject(e.target.value)}
            value={selectedSubject || ""}
            className="mt-2 p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="" disabled>Select a subject to assign</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
          <p className="text-sm text-gray-500">Select a subject, then assign it to a class below.</p>
        </div>

        {/* Select Class for the Selected Subject */}
        {selectedSubject && (
          <div>
            <label className="block text-lg font-medium text-gray-700">Assign Class for Selected Subject:</label>
            <select
              onChange={(e) => handleAddSubjectClassPair(e.target.value)}
              className="mt-2 p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="" disabled>Select a class</option>
              {classes.map((classItem) => (
                <option key={classItem.id} value={classItem.id}>
                  {classItem.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Show Assigned Subject-Class Pairs */}
        <div className="mt-4">
          <h2 className="text-lg font-medium text-gray-700">Subject-Class Assignments:</h2>
          {teacherData.subjectClassAssignments.map((pair, index) => (
            <p key={index} className="text-gray-600">
              Subject ID: {pair.subjectId} - Class ID: {pair.classId}
            </p>
          ))}
        </div>

        <button
          type="submit"
          className="mt-4 w-full py-3 px-6 bg-main text-white font-semibold rounded-md shadow-lg"
        >
          Create Teacher
        </button>
      </form>
    </div>
  );
};

export default TeacherCreation;
