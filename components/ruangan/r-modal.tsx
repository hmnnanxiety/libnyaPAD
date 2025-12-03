import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle, Loader2, AlertTriangle } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface Ruangan {
  id: string;
  nama: string;
  deskripsi: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface RuanganModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (formData: FormData) => void;
  onConfirm?: () => void;
  editingRuangan?: Ruangan | null;
  isPending: boolean;
  mode?: "form" | "delete";
}

export function RuanganModal({
  isOpen,
  onClose,
  onSubmit,
  onConfirm,
  editingRuangan,
  isPending,
  mode = "form",
}: RuanganModalProps) {
  const [formData, setFormData] = useState({
    nama: "",
    deskripsi: "",
  });

  useEffect(() => {
    if (editingRuangan) {
      setFormData({
        nama: editingRuangan.nama,
        deskripsi: editingRuangan.deskripsi || "",
      });
    } else {
      setFormData({
        nama: "",
        deskripsi: "",
      });
    }
  }, [editingRuangan, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      const formDataObj = new FormData();
      formDataObj.append("nama", formData.nama);
      formDataObj.append("deskripsi", formData.deskripsi);
      onSubmit(formDataObj);
    }
  };

  if (mode === "delete") {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden">
          
          <DialogHeader>
            <VisuallyHidden>
              <DialogTitle>Konfirmasi Penghapusan</DialogTitle>
            </VisuallyHidden>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center p-6 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>

            <h2 className="mb-2 text-xl font-bold text-gray-900">
              Hapus Data
            </h2>

            <p className="mb-6 text-sm text-gray-600">
              Apakah anda yakin akan menghapus data ini?
            </p>

            <div className="flex w-full gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isPending}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={onConfirm}
                disabled={isPending}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                Ya, Hapus
              </Button>
            </div>
          </div>

        </DialogContent>
      </Dialog>
    );
  }

  // Form Modal (Create/Edit)
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {editingRuangan ? "Edit Ruangan" : "Tambah Ruangan Baru"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nama Ruangan */}
          <div className="space-y-2">
            <Label htmlFor="nama" className="text-sm text-muted-foreground">
              Nama Ruangan
            </Label>
            <Input
              id="nama"
              value={formData.nama}
              onChange={(e) =>
                setFormData({ ...formData, nama: e.target.value })
              }
              placeholder="Contoh: HU207, Lab Komputer A"
              required
              disabled={isPending}
            />
          </div>

          {/* Deskripsi */}
          <div className="space-y-2">
            <Label htmlFor="deskripsi" className="text-sm text-muted-foreground">
              Deskripsi (Opsional)
            </Label>
            <textarea
              id="deskripsi"
              value={formData.deskripsi}
              onChange={(e) =>
                setFormData({ ...formData, deskripsi: e.target.value })
              }
              placeholder="Contoh: Lantai 2, Gedung Utara"
              rows={3}
              disabled={isPending}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isPending || !formData.nama.trim()}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  {editingRuangan ? "Perbarui Ruangan" : "Simpan Ruangan"}
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={isPending}
            >
              Batal
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}