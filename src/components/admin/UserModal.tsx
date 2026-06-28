'use client';

import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { ClientForm } from '@/components/ClientForm';
import { updateUser } from '@/lib/actions';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: { id: number; username: string; role: string } | undefined;
}

export function UserModal({ isOpen, onClose, user }: UserModalProps) {
  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit User">
      <ClientForm action={updateUser} successMessage="User updated" onSuccess={onClose}>
        <input type="hidden" name="userId" value={user.id} />
        <div className="space-y-4">
          <div>
            <Label htmlFor="user-username">Username</Label>
            <Input
              id="user-username"
              name="username"
              required
              placeholder="Username"
              defaultValue={user.username}
            />
          </div>
          <div>
            <Label htmlFor="user-password">New Password</Label>
            <Input
              id="user-password"
              name="newPassword"
              type="password"
              placeholder="Leave blank to keep current password"
            />
          </div>
          <div>
            <Label htmlFor="user-confirm-password">Confirm New Password</Label>
            <Input
              id="user-confirm-password"
              name="confirmPassword"
              type="password"
              placeholder="Confirm new password"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Save Changes</Button>
        </div>
      </ClientForm>
    </Modal>
  );
}
