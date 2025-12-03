"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { submitBerkas, FormState } from "@/lib/actions/formPengajuan/uploadBerkasSupabase";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useFormStatus } from "react-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CheckCircle2, XCircle, AlertTriangle, Loader2 } from "lucide-react";

interface UserProfile {
  id: string;
  name: string | null;
  nim: string | null;
  prodi: string | null;
  departemen: string | null;
  dosenPembimbing: string | null;
  dosenPembimbingId: string | null;
  judul?: string | null;
}

interface ProfileResult {
  success: boolean;
  data?: UserProfile;
  error?: string;
}

interface FpClientProps {
  profile: ProfileResult;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Mengunggah...
        </>
      ) : (
        "Kirim Pengajuan"
      )}
    </Button>
  );
}

export default function FpClient({ profile }: FpClientProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const initial: FormState = { success: false, message: "" };
  const [state, formAction] = useActionState(submitBerkas, initial);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"success" | "error">("success");
  const [dialogMessage, setDialogMessage] = useState("");

  const [fileError, setFileError] = useState<string | null>(null);

  useEffect(() => {
    if (state.message) {
      setDialogType(state.success ? "success" : "error");
      setDialogMessage(state.message);
      setDialogOpen(true);

      if (state.success && formRef.current) {
        formRef.current.reset();
      }
    }
  }, [state]);

  const handleDialogClose = () => {
    setDialogOpen(false);
    if (state.success) {
      router.push("/dashboard");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError(null);

    if (file) {
      if (file.type !== "application/pdf") {
        setFileError("File harus berformat PDF.");
        e.target.value = "";
        return;
      }
    }
  };

  // Error state: Profile tidak lengkap atau error lainnya
  if (!profile.success) {
    return (
      <div className="space-y-6">
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-700">
              <AlertTriangle className="h-5 w-5" />
              Profil Tidak Lengkap
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-amber-700 mb-4">
              {profile.error || "Profil Anda belum lengkap. Silakan lengkapi di halaman Profil sebelum melakukan pengajuan."}
            </p>
            <Button
              variant="outline"
              onClick={() => router.push("/profile")}
              className="border-amber-300 text-amber-700 hover:bg-amber-100"
            >
              Lengkapi Profil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const userData = profile.data!;

  return (
    <div className="space-y-6">
      {/* Profil Mahasiswa */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Data Mahasiswa</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground text-sm">Nama</Label>
            <Input defaultValue={userData.name ?? "-"} disabled className="bg-muted" />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground text-sm">NIM</Label>
            <Input defaultValue={userData.nim ?? "-"} disabled className="bg-muted" />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground text-sm">Angkatan</Label>
            <Input
              defaultValue={userData.nim ? `20${userData.nim.slice(0, 2)}` : "-"}
              disabled
              className="bg-muted"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground text-sm">Program Studi</Label>
            <Input defaultValue={userData.prodi ?? "-"} disabled className="bg-muted" />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground text-sm">Departemen</Label>
            <Input defaultValue={userData.departemen ?? "-"} disabled className="bg-muted" />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground text-sm">Dosen Pembimbing</Label>
            <Input defaultValue={userData.dosenPembimbing ?? "-"} disabled className="bg-muted" />
          </div>
        </CardContent>
      </Card>

      {/* Form Pengajuan */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Form Pengajuan Ujian</CardTitle>
        </CardHeader>
        <CardContent>
          <form ref={formRef} action={formAction} className="space-y-6">
            <input
                type="hidden"
                name="dosenPembimbingId"
                defaultValue={userData.dosenPembimbingId ?? ""}
            />


            <div className="space-y-2">
              <Label htmlFor="judul">
                Judul Tugas Akhir <span className="text-red-500">*</span>
              </Label>
              <Input
                id="judul"
                name="judul"
                placeholder="Masukkan judul tugas akhir Anda"
                defaultValue={userData.judul ?? ""}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dosenPembimbing">Dosen Pembimbing</Label>
              <Input
                id="dosenPembimbing"
                value={userData.dosenPembimbing ?? "-"}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Dosen pembimbing dipilih otomatis berdasarkan data profil Anda.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="berkas">
                Upload Berkas <span className="text-red-500">*</span>
              </Label>
              <Input
                id="berkas"
                name="berkas"
                type="file"
                accept="application/pdf,.pdf"
                required
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              {fileError && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <XCircle className="h-4 w-4" />
                  {fileError}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Format file: PDF. Pastikan berkas sudah lengkap sebelum diunggah.
              </p>
            </div>

            <div className="pt-4">
              <SubmitButton />
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Alert Dialog */}
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {dialogType === "success" ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="text-green-700">Berhasil</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-500" />
                  <span className="text-red-700">Gagal</span>
                </>
              )}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              {dialogMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleDialogClose}>
              {dialogType === "success" ? "Ke Dashboard" : "Tutup"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}