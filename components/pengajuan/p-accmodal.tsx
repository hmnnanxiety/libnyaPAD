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
import { CheckCircle, AlertTriangle } from "lucide-react";

interface ApproveConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  mahasiswaName: string;
  judulTA: string;
}

export function ApproveConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  mahasiswaName,
  judulTA,
}: ApproveConfirmationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <CheckCircle className="h-6 w-6 text-blue-600" />
          </div>
          <DialogTitle className="text-center text-xl">
            Konfirmasi Verifikasi Pengajuan
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            Anda akan memverifikasi dan menyetujui pengajuan ujian tugas akhir ini.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 space-y-3">
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Mahasiswa
            </p>
            <p className="text-sm font-semibold text-gray-900">
              {mahasiswaName}
            </p>
          </div>
          
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Judul Tugas Akhir
            </p>
            <p className="text-sm text-gray-900 leading-relaxed">
              {judulTA}
            </p>
          </div>

          <div className="pt-2 space-y-2 text-sm text-blue-900">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0 text-amber-600" />
              <span className="text-xs">Pastikan semua data dan berkas sudah diverifikasi dengan benar</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-600" />
              <span className="text-xs">Setelah disetujui, Anda akan diarahkan ke halaman penjadwalan</span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-row gap-2 sm:justify-center">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Batal
          </Button>
          <Button
            variant="default"
            onClick={onConfirm}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            Ya, Verifikasi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}