"use client";

import { useEffect, useState ,useRef} from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import SignatureCanvas from 'react-signature-canvas';
import { useLocale, useTranslations } from 'next-intl';
const TeacherCreation = () => {
  const router = useRouter();

  const [teacherData, setTeacherData] = useState({
    name: '',
    email: '',
    password: '123456789',
    academicYear: '',  // Changed to use select box
    subjectClassAssignments: [] as { subjectId: string; classId: string }[],  
    school: '' , 
    signature: null,
    arabicName: '',
  });

  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [academicYears, setAcademicYears] = useState<string[]>([]);  // Will store the generated academic year ranges
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);  // Track selected subject for assignment
  const [selectedClass, setSelectedClass] = useState<string | null>(null); // Track selected class for assignment

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

    // Generate academic years dynamically
    const generateAcademicYears = (startYear: number, numYears: number) => {
      let years = [];
      for (let i = 0; i < numYears; i++) {
        const yearStart = startYear + i;
        const yearEnd = startYear + i + 1;
        years.push(`${yearStart}-${yearEnd}`);
      }
      return years;
    };

    // Example: Generate 10 years starting from 2024
    const years = generateAcademicYears(2024, 10); 
    setAcademicYears(years);

  }, []);

  // Update teacherData with selected subject-class pair
  const handleAddSubjectClassPair = () => {
    if (selectedSubject && selectedClass) {
      setTeacherData((prevData) => ({
        ...prevData,
        subjectClassAssignments: [
          ...prevData.subjectClassAssignments,
          { subjectId: selectedSubject, classId: selectedClass },
        ],
      }));
      setSelectedSubject(null);  // Reset selected subject after assignment
      setSelectedClass(null); // Reset selected class after assignment
    }
  };

  // Handle other input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      toast.success('Teacher created successfully!');
      router.push('/admin');
    } else {
      toast.error('Failed to create teacher');
    }
  };

  const returnToHome = () => {
    router.push('/admin');
  };
  // const handleSignatureUpload = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     const reader = new FileReader();
  //     reader.onload = () => {
  //       setTeacherData((prev) => ({ ...prev, signature: reader.result }));
  //     };
  //     reader.readAsDataURL(file); // Convert image to Base64 string
  //   }
  // };
  const signatureRef = useRef<SignatureCanvas | null>(null);
  const handleClearSignature = () => {
    signatureRef.current.clear();
    setTeacherData((prev) => ({ ...prev, signature: '' }));
  };

  const handleSaveSignature = () => {
    const signature = signatureRef.current.toDataURL(); // Capture as Base64 string
    setTeacherData((prev) => ({ ...prev, signature }));
  };

  // const handleSubmitSignature = async (e) => {
  //   e.preventDefault();
  //   // Add your submit logic here
  //   console.log('Submitted Data:', teacherData);
  // };

  const t = useTranslations('teacherCreation');
  const locale=useLocale();
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg my-10 relative">
      <button className={`absolute flex items-center ${locale === 'ar' ? 'left-1' : 'right-1'}  top-1 text-white font-bold bg-main px-2 rounded-full text-lg`} onClick={returnToHome}>x</button>
      <h1 className="text-2xl font-semibold text-center mb-6">{t('Create New Teacher')}</h1>
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Basic Info */}
        <div>
          <label className="block text-lg font-medium text-gray-700">{t('name')} :</label>
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
          <label className="block text-lg font-medium text-gray-700">{t('Arabic Name')} :</label>
          <input
            type="text"
            name="arabicName"
            value={teacherData.arabicName}
            onChange={handleChange}
            required
            className="mt-2 p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-lg font-medium text-gray-700">{t('Email')} :</label>
          <input
            type="email"
            name="email"
            value={teacherData.email}
            onChange={handleChange}
            required
            className="mt-2 p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Academic Year Select */}
        <div>
          <label className="block text-lg font-medium text-gray-700">{t('Academic Year')}:</label>
          <select
            name="academicYear"
            value={teacherData.academicYear}
            onChange={handleChange}
            required
            className="mt-2 p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="" disabled>{t('selectAcademicYear')}</option>
            {academicYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* Select School */}
        <div>
          <label className="block text-lg font-medium text-gray-700">{t('school')}</label>
          <select
            name="school"
            value={teacherData.school}
            onChange={handleChange}
            required
            className="mt-2 p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="" disabled>{locale==="en"?"Select School":"اختر المدرسة"}</option>
            <option value="Alforqan School">{locale==="en"?"Alforqan School":"الفرقان الأمريكي بالحمراء"}</option>
            <option value="Albatool Khaldia 1">{locale==="en"?"Albatool Khaldia 1":"البتول خالدية 1"}</option>
            <option value="Albatool Khaldia 2">{locale==="en"?"Albatool Khaldia 2":"البتول خالدية 2"}</option>
            <option value="Albatool Khaldia 3">{locale==="en"?"Albatool Khaldia 3":"البتول خالدية 3"}</option>
          </select>
        </div>

        {/* Select Subject and Assign Class */}
        <div>
          <label className="block text-lg font-medium text-gray-700">{t('Subject')}:</label>
          <select
            onChange={(e) => setSelectedSubject(e.target.value)}
            value={selectedSubject || ""}
            className="mt-2 p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="" disabled>{t('Subject Class Assignments')}</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {locale==="en"?subject.name:subject.arabicName}
              </option>
            ))}
          </select>
        </div>

        {/* Select Class for the Selected Subject */}
        {selectedSubject && (
          <div>
            <label className="block text-lg font-medium text-gray-700">{locale==="en"?"Assign Class for Selected Subject :":"إختر الفصل للمادة المحددة"}</label>
            <select
              onChange={(e) => setSelectedClass(e.target.value)}
              value={selectedClass || ""}
              className="mt-2 p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="" disabled>{locale==="en"?"Select Class":"أختر الفصل"}</option>
              {classes.map((classItem) => (
                <option key={classItem.id} value={classItem.id}>
                  {classItem.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleAddSubjectClassPair}
              className="mt-2 p-3 bg-blue-500 text-white rounded-md"
            >
              {locale==="en"?"Add Subject-Class Pair":"اضافة رابط مادة-فصل"}
            </button>
          </div>
          
        )}

        {/* Show Assigned Subject-Class Pairs */}
        <div className="mt-4">
          <h2 className="text-lg font-medium text-gray-700">{t('Subject Class Assignments')} :</h2>
          {teacherData.subjectClassAssignments.map((pair, index) => (
            <p key={index} className="text-gray-600">
              {t('Subject ID')}: {pair.subjectId} - {t('Class ID')}: {pair.classId}
            </p>
          ))}
        </div>
        <div>
        <label className="block text-lg font-medium text-gray-700">{locale==="en"?"Signature :":"توقيع المعلم :"}</label>
        <SignatureCanvas
          ref={signatureRef}
          penColor="black"
          canvasProps={{
            className: 'border border-gray-300 rounded-md w-full h-40',
          }}
        />
        <div className={`mt-2 flex gap-4 items-center justify-end`}>
          <button
            type="button"
            onClick={handleSaveSignature}
            className="p-3 bg-blue-500 text-white rounded-md"
          >
            {locale==="en"?"Save Signature":"حفظ التوقيع"}
          </button>
          <button
            type="button"
            onClick={handleClearSignature}
            className="p-3 bg-red-500 text-white rounded-md"
          >
            {locale==="en"?"Clear Signature":"حذف التوقيع"}
          </button>
        </div>
      </div>
        <button
          type="submit"
          className="mt-4 w-full py-3 px-6 bg-main text-white font-semibold rounded-md shadow-lg"
        >
        {locale==="en"?"Create Teacher":"تسجيل المعلم"}
        </button>
      </form>
    </div>
  );
};

export default TeacherCreation;
