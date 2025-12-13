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
import { AlertTriangle, CheckCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface RoleChangeConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  nama: string;
  image: string | null;
}

export function RoleChangeConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  nama,
  image,
}: RoleChangeConfirmationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
            <AlertTriangle className="h-7 w-7 text-amber-600" />
          </div>
          <DialogTitle className="text-center text-2xl">
            Konfirmasi Perubahan Role
          </DialogTitle>
          <DialogDescription className="text-center pt-2 text-base">
            Anda akan mengubah role pengguna berikut:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* User Info Card */}
          <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 rounded-full">
                <AvatarImage
                  src={image || ""}
                  alt={nama}
                />
                <AvatarFallback className="bg-blue-100 text-base font-semibold text-blue-600">
                  {nama?.charAt(0).toUpperCase() || "M"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{nama}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-medium px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                    MAHASISWA
                  </span>
                  <span className="text-gray-400">→</span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded bg-green-100 text-green-700">
                    DOSEN
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Warning Box */}
          <div className="rounded-lg bg-red-50 border-2 border-red-200 p-4">
            <div className="flex gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="font-bold text-red-900">
                Perubahan Permanen!
              </p>
            </div>
            <p className="text-sm text-red-800 ml-7">
              Perubahan ini <strong>TIDAK DAPAT DIBATALKAN</strong> melalui sistem setelah disimpan.
            </p>
          </div>

          {/* Checklist */}
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
            <p className="font-semibold text-gray-900 mb-3">
              Pastikan hal berikut sudah benar:
            </p>
            <div className="space-y-2.5">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600 mt-0.5" />
                <span className="text-sm text-gray-700">
                  User ini adalah <strong>dosen</strong> dengan email domain <strong>@mail.ugm.ac.id</strong>
                </span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600 mt-0.5" />
                <span className="text-sm text-gray-700">
                  Data dan identitas sudah <strong>diverifikasi dengan benar</strong>
                </span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600 mt-0.5" />
                <span className="text-sm text-gray-700">
                  User memahami perubahan <strong>hak akses</strong> yang akan terjadi
                </span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:flex-1"
          >
            Batal
          </Button>
          <Button
            onClick={onConfirm}
            className="w-full sm:flex-1 bg-blue-600 hover:bg-amber-700 text-white"
          >
            Ya, Ubah ke Dosen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}