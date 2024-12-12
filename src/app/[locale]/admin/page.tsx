// app/admin/page.tsx

import { getAllSubjects } from '@/lib/actions';
import AdminUI from './AdminUI';
 // Import the Client Component

const AdminPage = async () => {
  // Fetch all teachers on the server side
  // const teachers = await getAllTeachers();
  const subjects = await getAllSubjects();
  return (
    <div className="p-4  print:p-0 print:m-0">
      
      {/* Pass teachers data to the Client Component */}
      <AdminUI subjects={subjects} />
    </div>
  );
};

export default AdminPage;
