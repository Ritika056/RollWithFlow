"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";

import { ActionButton } from "@/components/ui/ActionButton";

export function Modal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-deck-950/76 p-4 backdrop-blur-md">
      <div className="glass max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-white/9 bg-deck-925/82 px-5 py-4 backdrop-blur-xl">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <ActionButton variant="ghost" onClick={onClose} aria-label="Close modal" className="size-9 p-0">
            <X size={18} />
          </ActionButton>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
