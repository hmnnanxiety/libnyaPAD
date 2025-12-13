"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { updateDosenProfileByAdmin } from "@/lib/actions/profile/adminEditDosenProfile";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface DosenData {
  id: string;
  name: string | null;
  nim: string | null;
  email: string | null;
  image: string | null;
  departemen: string | null;
  telepon: string | null;
  prodi: string | null;
}

interface EditDosenModalProps {
  isOpen: boolean;
  onClose: () => void;
  dosen: DosenData | null;
}

export function EditDosenModal({
  isOpen,
  onClose,
  dosen,
}: EditDosenModalProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    prodi: "",
    departemen: "",
    telepon: "",
  });

  useEffect(() => {
    if (dosen) {
      setFormData({
        name: dosen.name || "",
        prodi: dosen.prodi || "",
        departemen: dosen.departemen || "Departemen Teknik Elektro dan Informatika",
        telepon: dosen.telepon || "",
      });
    }
  }, [dosen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dosen) return;

    setIsSaving(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append("name", formData.name);
      formDataObj.append("prodi", formData.prodi);
      formDataObj.append("departemen", formData.departemen);
      formDataObj.append("telepon", formData.telepon);

      const result = await updateDosenProfileByAdmin(dosen.id, formDataObj);

      if (result.success) {
        toast.success("Data dosen berhasil diperbarui");
        router.refresh();
        onClose();
      } else {
        toast.error(result.error || "Gagal memperbarui data");
      }
    } catch (error) {
      console.error("Error updating dosen:", error);
      toast.error("Terjadi kesalahan saat memperbarui data");
    } finally {
      setIsSaving(false);
    }
  };

  if (!dosen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Edit Data Dosen
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 rounded-full">
              <AvatarImage src={dosen.image || ""} alt={dosen.name || ""} />
              <AvatarFallback className="rounded-full bg-green-100 text-lg font-semibold text-green-600">
                {dosen.name?.charAt(0).toUpperCase() || "D"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm text-gray-500">Foto Profil</p>
              <p className="text-xs text-gray-400">
                Foto dikelola melalui akun Google
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name">
                Nama Lengkap <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Masukkan nama lengkap"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nim">NIP</Label>
              <Input
                id="nim"
                value={dosen.nim || "-"}
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500">
                NIP tidak dapat diubah
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={dosen.email || "-"}
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500">
                Email tidak dapat diubah
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prodi">Program Studi</Label>
              <Select
                value={formData.prodi}
                onValueChange={(value) =>
                  setFormData({ ...formData, prodi: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih program studi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TeknologiRekayasaPerangkatLunak">
                    Teknologi Rekayasa Perangkat Lunak
                  </SelectItem>
                  <SelectItem value="TeknologiRekayasaElektro">
                    Teknologi Rekayasa Elektro
                  </SelectItem>
                  <SelectItem value="TeknologiRekayasaInternet">
                    Teknologi Rekayasa Internet
                  </SelectItem>
                  <SelectItem value="TeknologiRekayasaInstrumentasiDanKontrol">
                    Teknologi Rekayasa Instrumentasi dan Kontrol
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="telepon">No. Telepon</Label>
              <Input
                id="telepon"
                value={formData.telepon}
                onChange={(e) =>
                  setFormData({ ...formData, telepon: e.target.value })
                }
                placeholder="08xxxxxxxxxx"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="departemen">Departemen</Label>
              <Input
                id="departemen"
                value={formData.departemen}
                onChange={(e) =>
                  setFormData({ ...formData, departemen: e.target.value })
                }
                placeholder="Departemen Teknik Elektro dan Informatika"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Simpan
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}