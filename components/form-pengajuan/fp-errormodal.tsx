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
import { AlertTriangle } from "lucide-react";

interface FileErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  errorMessage: string;
}

export function FileErrorModal({
  isOpen,
  onClose,
  errorMessage,
}: FileErrorModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <DialogTitle className="text-center">Upload Gagal</DialogTitle>
          <DialogDescription className="text-center">
            {errorMessage}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="sm:justify-center">
          <Button
            variant="default"
            onClick={onClose}
            className="flex-1 sm:flex-none"
          >
            Kembali
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}