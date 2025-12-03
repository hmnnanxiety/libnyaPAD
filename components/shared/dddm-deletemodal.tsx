"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle } from "lucide-react";
import { useState } from "react";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  userName: string;
  userType: "mahasiswa" | "dosen";
}

export function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  userName,
  userType,
}: DeleteModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error("Error deleting user:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <DialogTitle className="text-center">Hapus Data</DialogTitle>
          <DialogDescription className="text-center">
            Apakah anda yakin akan menghapus data {userType} ini?
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg bg-gray-50 p-4">
          <p className="text-center text-sm font-medium text-gray-900">
            {userName}
          </p>
        </div>

        <DialogFooter className="flex-row gap-2 sm:justify-center">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menghapus...
              </>
            ) : (
              "Ya, Hapus"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}