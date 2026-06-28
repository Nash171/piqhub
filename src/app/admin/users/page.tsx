import { getAllUsers } from '@/lib/queries';
import { AdminUsersClient } from '@/components/admin/AdminUsersClient';

export default async function AdminUsersPage() {
  const users = await getAllUsers();

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <AdminUsersClient users={users} />
    </div>
  );
}
