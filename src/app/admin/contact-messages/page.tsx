import { AdminCard } from "@/components/features/admin/admin-card";
import { getContactMessagesAdminData } from "@/server/actions/contact.actions";

export default async function AdminContactMessagesPage() {
  const messages = await getContactMessagesAdminData();

  return (
    <AdminCard title="הודעות יצירת קשר" description="בעתיד הודעות יישמרו ב-contactMessages ב-Firestore.">
      <table className="table">
        <thead>
          <tr>
            <th>שם</th>
            <th>פרטי קשר</th>
            <th>הודעה</th>
            <th>סטטוס</th>
          </tr>
        </thead>
        <tbody>
          {messages.map((message) => (
            <tr key={message.id}>
              <td>{message.fullName}</td>
              <td>{message.phone}<br />{message.email}</td>
              <td>{message.message}</td>
              <td>{message.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminCard>
  );
}
