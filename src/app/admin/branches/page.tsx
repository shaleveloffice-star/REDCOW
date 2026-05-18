import { AdminCard } from "@/components/features/admin/admin-card";
import { StatusBadge } from "@/components/features/admin/status-badge";
import { getBranchesAdminData } from "@/server/actions/branches.actions";

export default async function AdminBranchesPage() {
  const branches = await getBranchesAdminData();

  return (
    <AdminCard title="ניהול סניפים" description="המסך מוכן להחלפת repository מ-local ל-Firestore.">
      <table className="table">
        <thead>
          <tr>
            <th>סניף</th>
            <th>כתובת</th>
            <th>טלפון</th>
            <th>סטטוס</th>
          </tr>
        </thead>
        <tbody>
          {branches.map((branch) => (
            <tr key={branch.id}>
              <td>{branch.name}</td>
              <td>{branch.address}, {branch.city}</td>
              <td>{branch.phone}</td>
              <td><StatusBadge active={branch.isActive} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminCard>
  );
}
