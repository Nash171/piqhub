'use client';

import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  isLoading = false,
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p className="mb-6 text-slate-600">{message}</p>
      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
          {cancelLabel}
        </Button>
        <Button type="button" variant="danger" onClick={onConfirm} disabled={isLoading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
