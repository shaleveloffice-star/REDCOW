import { AdminCard } from "@/components/features/admin/admin-card";
import { getCareerApplicationsAdminData } from "@/server/actions/careers.actions";

export default async function AdminCareerApplicationsPage() {
  const applications = await getCareerApplicationsAdminData();

  return (
    <AdminCard title="ניהול קורות חיים" description="פניות דרושים מוכנות ל-careerApplications בעתיד.">
      <table className="table">
        <thead>
          <tr>
            <th>שם</th>
            <th>תפקיד מבוקש</th>
            <th>פרטי קשר</th>
            <th>סטטוס</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((application) => (
            <tr key={application.id}>
              <td>{application.fullName}</td>
              <td>{application.desiredRole}</td>
              <td>{application.phone}<br />{application.email}</td>
              <td>{application.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminCard>
  );
}
