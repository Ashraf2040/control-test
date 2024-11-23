'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

interface ClassOption {
  id: string;
  name: string;
}

const AddStudentForm: React.FC = () => {
  const [name, setName] = useState('');
  const [arabicName, setArabicName] = useState('');
  const [dob, setDob] = useState('');
  const [classId, setClassId] = useState('');
  const [nationality, setNationality] = useState('');
  const [iqamaNo, setIqamaNo] = useState('');
  const [passportNo, setPassportNo] = useState('');
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch('/api/classesStudents');
        if (!response.ok) throw new Error('Failed to fetch classes');
        const data = await response.json();
        setClasses(data);
      } catch (error) {
        console.error(error);
        toast.error('Error fetching classes.');
      }
    };

    fetchClasses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !dob || !classId) {
      toast.error('Name, date of birth, and class are required.');
      return;
    }

    try {
      const response = await fetch('/api/studentCreation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          arabicName,
          dob,
          classId,
          nationality,
          iqamaNo,
          passportNo,
        }),
      });

      if (!response.ok) throw new Error('Failed to add student');

      toast.success('Student added successfully!');
      router.push('/admin'); // Redirect to the student list page
    } catch (error) {
      console.error(error);
      toast.error('Error adding student. Please try again.');
    }
  };

  return (
    <div className="w-full md:w-3/5    mx-auto mt-20 p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-6">Add New Student</h2>
      <form onSubmit={handleSubmit} className='flex gap-8 flex-wrap w-full'>
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border p-2 rounded focus:ring focus:ring-main focus:outline-none"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="arabicName" className="block text-sm font-medium mb-1">
            Arabic Name
          </label>
          <input
            type="text"
            id="arabicName"
            value={arabicName}
            onChange={(e) => setArabicName(e.target.value)}
            className="w-full border p-2 rounded focus:ring focus:ring-main focus:outline-none"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="dob" className="block text-sm font-medium mb-1">
            Date of Birth
          </label>
          <input
            type="date"
            id="dob"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            className="w-full border p-2 rounded focus:ring focus:ring-main focus:outline-none"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="nationality" className="block text-sm font-medium mb-1">
            Nationality
          </label>
          <input
            type="text"
            id="nationality"
            value={nationality}
            onChange={(e) => setNationality(e.target.value)}
            className="w-full border p-2 rounded focus:ring focus:ring-main focus:outline-none"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="iqamaNo" className="block text-sm font-medium mb-1">
            Iqama Number
          </label>
          <input
            type="text"
            id="iqamaNo"
            value={iqamaNo}
            onChange={(e) => setIqamaNo(e.target.value)}
            className="w-full border p-2 rounded focus:ring focus:ring-main focus:outline-none"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="passportNo" className="block text-sm font-medium mb-1">
            Passport Number
          </label>
          <input
            type="text"
            id="passportNo"
            value={passportNo}
            onChange={(e) => setPassportNo(e.target.value)}
            className="w-full border p-2 rounded focus:ring focus:ring-main focus:outline-none"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="classId" className="block text-sm font-medium mb-1">
            Class
          </label>
          <select
            id="classId"
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            className="w-full border p-2 rounded focus:ring focus:ring-main focus:outline-none"
            required
          >
            <option value="" disabled>
              Select a class
            </option>
            {classes.map((classOption) => (
              <option key={classOption.id} value={classOption.id}>
                {classOption.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-main text-white p-2 rounded font-semibold hover:bg-main-dark transition"
        >
          Add Student
        </button>
      </form>
    </div>
  );
};

export default AddStudentForm;
