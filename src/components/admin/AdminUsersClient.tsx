'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import { UserModal } from './UserModal';

interface AdminUsersClientProps {
  users: { id: number; username: string; role: string }[];
}

export function AdminUsersClient({ users }: AdminUsersClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ id: number; username: string; role: string } | undefined>();

  function openModal(user: { id: number; username: string; role: string }) {
    setSelectedUser(user);
    setIsModalOpen(true);
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Admin: Users</h1>
        <p className="mt-2 text-slate-600">Manage player accounts, rename users, and reset passwords.</p>
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
                  Actions
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
                    <Button size="sm" variant="secondary" onClick={() => openModal(user)}>
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <UserModal
        key={`user-${selectedUser?.id ?? 'new'}`}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={selectedUser}
      />
    </div>
  );
}
