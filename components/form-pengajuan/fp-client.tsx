"use client";

import { useFormStatus } from "react-dom";
import {
  submitBerkas,
  type FormState,
} from "@/lib/actions/formPengajuan/uploadBerkasSupabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, FileUp, Loader2, XCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { FileErrorModal } from "./fp-errormodal";

interface ProfileData {
  success: boolean;
  data?: {
    dosenPembimbingId: string | null;
    dosenPembimbing: string | null;
  };
  error?: string;
}

interface FpClientProps {
  profile: ProfileData;
}

// Komponen tombol terpisah untuk menampilkan status "pending"
function SubmitButton({ hasFile, disabled }: { hasFile: boolean; disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button 
      type="submit" 
      disabled={pending || disabled || !hasFile} 
      className="px-6"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Mengunggah...
        </>
      ) : (
        "Submit"
      )}
    </Button>
  );
}

export default function FpClient({ profile }: FpClientProps) {
  const router = useRouter();
  const initialState: FormState = { success: false, message: "" };
  const [state, formAction] = useActionState(submitBerkas, initialState);
  const [dosenPembimbingId, setDosenPembimbingId] = useState<string>("");
  const [dosenPembimbingName, setDosenPembimbingName] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // State untuk Alert Dialog
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  
  // State untuk File Error Modal
  const [showFileErrorModal, setShowFileErrorModal] = useState(false);
  const [fileErrorMessage, setFileErrorMessage] = useState("");

  // Set initial profile data
  useEffect(() => {
    if (profile.success && profile.data) {
      setDosenPembimbingId(profile.data.dosenPembimbingId || "");
      setDosenPembimbingName(profile.data.dosenPembimbing || "");
    }
  }, [profile]);

  // Handle success/error dari form submission
  useEffect(() => {
    if (state.message) {
      if (state.success) {
        setShowSuccessDialog(true);
      } else {
        setShowErrorDialog(true);
      }
    }
  }, [state]);

  const handleSuccessDialogClose = () => {
    setShowSuccessDialog(false);
    router.push("/dashboard");
  };

  const handleErrorDialogClose = () => {
    setShowErrorDialog(false);
  };

  const handleFileErrorClose = () => {
    setShowFileErrorModal(false);
    setFileErrorMessage("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      // Validasi tipe file
      if (file.type !== "application/pdf") {
        setFileErrorMessage("File yang Anda upload bukan format PDF. Silakan upload file dengan format PDF.");
        setShowFileErrorModal(true);
        e.target.value = "";
        setSelectedFile(null);
        return;
      }

      // Validasi ukuran file (10MB = 10 * 1024 * 1024 bytes)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
        setFileErrorMessage(
          `Ukuran file terlalu besar (${fileSizeMB} MB). Maksimal ukuran file adalah 10 MB.`
        );
        setShowFileErrorModal(true);
        e.target.value = "";
        setSelectedFile(null);
        return;
      }

      setSelectedFile(file);
    }
  };

  // Check jika tidak ada dosen pembimbing
  const disabledBecauseNoPembimbing = !dosenPembimbingId;

  return (
    <>
      {/* File Error Modal */}
      <FileErrorModal
        isOpen={showFileErrorModal}
        onClose={handleFileErrorClose}
        errorMessage={fileErrorMessage}
      />

      {/* Success Dialog */}
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <AlertDialogTitle>Pengajuan Berhasil!</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="pt-2">
              {state.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleSuccessDialogClose} className="w-full sm:w-auto">
              Kembali ke Dashboard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Error Dialog */}
      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-red-100 rounded-full">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <AlertDialogTitle>Pengajuan Gagal</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="pt-2">
              {state.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleErrorDialogClose} className="w-full sm:w-auto">
              Coba Lagi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="w-full">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Upload Berkas</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Alert jika tidak ada dosen pembimbing */}
            {disabledBecauseNoPembimbing && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Informasi dosen pembimbing tidak tersedia. Silakan hubungi admin untuk menentukan dosen pembimbing sebelum melakukan pengajuan.
                </AlertDescription>
              </Alert>
            )}

            <form action={formAction} className="space-y-6">
              {/* Hidden inputs */}
              <input type="hidden" name="dosenPembimbingId" value={dosenPembimbingId} />
              <input type="hidden" name="dosenPembimbingName" value={dosenPembimbingName} />

              {/* Judul Tugas Akhir */}
              <div className="space-y-2">
                <Label htmlFor="judul" className="text-sm font-medium">
                  Judul Tugas Akhir
                </Label>
                <Input
                  id="judul"
                  name="judul"
                  type="text"
                  required
                  placeholder="Masukkan Judul Tugas Akhir"
                  className="w-full"
                  disabled={disabledBecauseNoPembimbing}
                />
              </div>

              {/* Dosen Pembimbing */}
              <div className="space-y-2">
                <Label htmlFor="dosenPembimbingName" className="text-sm font-medium">
                  Dosen Pembimbing
                </Label>
                <Input
                  id="dosenPembimbingName"
                  name="dosenPembimbingNameDisplay"
                  value={dosenPembimbingName || "Tidak ada data"}
                  disabled
                  className="bg-gray-50 cursor-not-allowed"
                  aria-readonly
                />
              </div>

              {/* Upload Berkas */}
              <div className="space-y-2">
                <Label htmlFor="berkas" className="text-sm font-medium">
                  Upload Berkas
                </Label>
                <div className="flex items-center gap-4">
                  <label
                    htmlFor="berkas"
                    className={`flex items-center gap-2 px-4 py-3 bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg transition-colors ${
                      disabledBecauseNoPembimbing
                        ? "cursor-not-allowed opacity-50"
                        : "cursor-pointer hover:bg-blue-100"
                    }`}
                  >
                    <FileUp className="w-5 h-5 text-blue-500" />
                    <span className="text-sm text-blue-600 font-medium">
                      {selectedFile ? selectedFile.name : "Upload Files"}
                    </span>
                  </label>
                  {!selectedFile && <span className="text-sm text-gray-500">PDF (Max 10MB)</span>}
                </div>
                <Input
                  id="berkas"
                  name="berkas"
                  type="file"
                  accept=".pdf,application/pdf"
                  required
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={disabledBecauseNoPembimbing}
                />
                {selectedFile && (
                  <p className="text-sm text-gray-600">
                    File terpilih: <span className="font-medium">{selectedFile.name}</span>{" "}
                    ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-4">
                <SubmitButton hasFile={!!selectedFile} disabled={disabledBecauseNoPembimbing} />
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}