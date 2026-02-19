"use client";

import { useEffect, useRef } from "react";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Подтвердить",
  cancelLabel = "Отмена",
  variant = "default",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [open]);

  const handleConfirm = () => {
    onConfirm();
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    <dialog
      ref={ref}
      onCancel={onCancel}
      className="rounded-2xl p-0 w-full max-w-md shadow-card-hover border border-slate-200/80 dark:border-slate-700/60 bg-white dark:bg-slate-900 backdrop:bg-black/40 backdrop-blur-sm"
    >
      <div className="p-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
        <p className="mt-2 text-slate-600 dark:text-slate-400 text-sm">{message}</p>
        <div className="mt-6 flex gap-3 justify-end">
          <button
            type="button"
            onClick={handleCancel}
            className="px-5 py-2.5 btn-secondary font-semibold"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={
              variant === "danger"
                ? "px-5 py-2.5 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 active:scale-[0.98] transition-all duration-200"
                : "btn-primary"
            }
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
