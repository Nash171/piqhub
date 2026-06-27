import { getAllUsers } from '@/lib/queries';
import { resetUserPassword } from '@/lib/actions';
import { ClientForm } from '@/components/ClientForm';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Button } from '@/components/ui/Button';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default async function AdminUsersPage() {
  const users = await getAllUsers();

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Admin: Users</h1>
        <p className="mt-2 text-slate-600">Manage player accounts and reset passwords.</p>
      </div>

      <Card>
        <CardTitle className="mb-1">Manage Users</CardTitle>
        <CardDescription className="mb-5">
          {users.length} total user{users.length === 1 ? '' : 's'} registered.
        </CardDescription>
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Username
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Reset Password
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">{user.id}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{user.username}</td>
                  <td className="px-4 py-3">
                    <Badge variant={user.role === 'admin' ? 'slate' : 'gray'}>{user.role}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    {user.role !== 'admin' && (
                      <ClientForm action={resetUserPassword} successMessage="Password reset">
                        <div className="flex flex-wrap items-center gap-2">
                          <input type="hidden" name="userId" value={user.id} />
                          <Input
                            name="newPassword"
                            type="password"
                            placeholder="New password"
                            required
                            className="w-48"
                          />
                          <Button type="submit" size="sm" variant="secondary">
                            Reset
                          </Button>
                        </div>
                      </ClientForm>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
