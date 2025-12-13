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
import { updateMahasiswaProfileByAdmin } from "@/lib/actions/profile/adminEditMahasiswaProfile";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RoleChangeConfirmationModal } from "./dm-rolechangemodal";

interface MahasiswaData {
  id: string;
  name: string | null;
  nim: string | null;
  email: string | null;
  image: string | null;
  role: "MAHASISWA" | "DOSEN";
  prodi: string | null;
  telepon: string | null;
  dosenPembimbingId: string | null;
}

interface EditMahasiswaModalProps {
  isOpen: boolean;
  onClose: () => void;
  mahasiswa: MahasiswaData | null;
  dosenList: Array<{ id: string; name: string | null }>;
}

export function EditMahasiswaModal({
  isOpen,
  onClose,
  mahasiswa,
  dosenList,
}: EditMahasiswaModalProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [showRoleConfirmation, setShowRoleConfirmation] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    prodi: "",
    telepon: "",
    role: "MAHASISWA" as "MAHASISWA" | "DOSEN",
    dosenPembimbingId: "",
  });

  useEffect(() => {
    if (mahasiswa) {
      setFormData({
        name: mahasiswa.name || "",
        prodi: mahasiswa.prodi || "",
        telepon: mahasiswa.telepon || "",
        role: mahasiswa.role,
        dosenPembimbingId: mahasiswa.dosenPembimbingId || "",
      });
    }
  }, [mahasiswa]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mahasiswa) return;

    // Check if role is changing from MAHASISWA to DOSEN
    if (mahasiswa.role === "MAHASISWA" && formData.role === "DOSEN") {
      setShowRoleConfirmation(true);
      return;
    }

    // If no role change or other changes, proceed directly
    await saveChanges();
  };

  const saveChanges = async () => {
    if (!mahasiswa) return;

    setIsSaving(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append("name", formData.name);
      formDataObj.append("prodi", formData.prodi);
      formDataObj.append("telepon", formData.telepon);
      formDataObj.append("role", formData.role);
      formDataObj.append("dosenPembimbingId", formData.dosenPembimbingId);

      const result = await updateMahasiswaProfileByAdmin(
        mahasiswa.id,
        formDataObj
      );

      if (result.success) {
        toast.success("Data mahasiswa berhasil diperbarui");
        router.refresh();
        onClose();
      } else {
        toast.error(result.error || "Gagal memperbarui data");
      }
    } catch (error) {
      console.error("Error updating mahasiswa:", error);
      toast.error("Terjadi kesalahan saat memperbarui data");
    } finally {
      setIsSaving(false);
      setShowRoleConfirmation(false);
    }
  };

  const handleRoleConfirm = () => {
    saveChanges();
  };

  const handleRoleConfirmClose = () => {
    setShowRoleConfirmation(false);
  };

  if (!mahasiswa) return null;

  return (
    <>
      <RoleChangeConfirmationModal
        isOpen={showRoleConfirmation}
        onClose={handleRoleConfirmClose}
        onConfirm={handleRoleConfirm}
        nama={mahasiswa.name || "User"}
        image={mahasiswa.image}
      />

      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Edit Data Mahasiswa
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 rounded-full">
                <AvatarImage
                  src={mahasiswa.image || ""}
                  alt={mahasiswa.name || ""}
                />
                <AvatarFallback className="bg-blue-100 text-lg font-semibold text-blue-600">
                  {mahasiswa.name?.charAt(0).toUpperCase() || "M"}
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
                <Label htmlFor="nim">NIM</Label>
                <Input
                  id="nim"
                  value={mahasiswa.nim || "-"}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500">
                  NIM tidak dapat diubah
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={mahasiswa.email || "-"}
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

              <div className="space-y-2">
                <Label htmlFor="role">
                  Role <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: "MAHASISWA" | "DOSEN") =>
                    setFormData({ ...formData, role: value })
                  }
                  disabled={mahasiswa.role === "DOSEN"}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MAHASISWA">Mahasiswa</SelectItem>
                    <SelectItem value="DOSEN">Dosen</SelectItem>
                  </SelectContent>
                </Select>
                {mahasiswa.role === "MAHASISWA" ? (
                  <p className="text-xs text-amber-600 font-medium">
                    Perubahan role akan mempengaruhi akses sistem user ini
                  </p>
                ) : (
                  <p className="text-xs text-gray-500">
                    Role tidak dapat diubah kembali
                  </p>
                )}
              </div>

              {formData.role === "MAHASISWA" && (
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="dosen">Dosen Pembimbing</Label>
                  <Select
                    value={formData.dosenPembimbingId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, dosenPembimbingId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih dosen pembimbing" />
                    </SelectTrigger>
                    <SelectContent>
                      {dosenList.map((dosen) => (
                        <SelectItem key={dosen.id} value={dosen.id}>
                          {dosen.name || "Nama tidak tersedia"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
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
    </>
  );
}