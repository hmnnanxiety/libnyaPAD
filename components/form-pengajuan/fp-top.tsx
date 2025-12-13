"use client";

import { DataProfile } from "@/lib/actions/formPengajuan/dataProfile";
import { AlertCircle, Loader2, UserX } from "lucide-react";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { Alert, AlertDescription } from "../ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";

// Helper functions
const getAngkatan = (nim: string | null): string => {
  if (!nim || nim.length < 2) return "-";
  return `20${nim.slice(0, 2)}`;
};

const formatProdi = (prodi: string | null): string => {
  if (!prodi) return "-";
  // Convert enum ke readable format
  const prodiMap: Record<string, string> = {
    TeknologiRekayasaPerangkatLunak: "Teknologi Rekayasa Perangkat Lunak",
    TeknologiRekayasaElektro: "Teknologi Rekayasa Elektro",
    TeknologiRekayasaInternet: "Teknologi Rekayasa Internet",
    TeknologiRekayasaInstrumentasiDanKontrol:
      "Teknologi Rekayasa Instrumentasi Dan Kontrol",
  };
  return prodiMap[prodi] || prodi;
};

const getSemester = (nim: string | null): string => {
  if (!nim || nim.length < 2) return "-";
  const angkatan = parseInt(nim.slice(0, 2));
  const currentYear = new Date().getFullYear() % 100; // Get last 2 digits
  const currentMonth = new Date().getMonth() + 1; // 1-12

  const yearDiff = currentYear - angkatan;
  // Jika bulan >= 8 (Agustus), berarti semester ganjil tahun ajaran baru
  const semester = currentMonth >= 8 ? yearDiff * 2 + 1 : yearDiff * 2;

  return `${semester} (${semester % 2 === 1 ? "Ganjil" : "Genap"})`;
};

const FpTop = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<{
    id: string;
    name: string | null;
    nim: string | null;
    prodi: string | null;
    departemen: string | null;
    dosenPembimbingId: string | null;
    dosenPembimbing: string | null;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showIncompleteDialog, setShowIncompleteDialog] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      if (status === "loading") return;

      if (!session?.user) {
        setIsLoading(false);
        return;
      }

      try {
        const result = await DataProfile();

        if (result.success && result.data) {
          setUserData(result.data);
        } else {
          // Jika error karena data tidak lengkap, tampilkan dialog
          if (result.error?.includes("tidak lengkap")) {
            setShowIncompleteDialog(true);
          } else {
            setError(result.error || "Gagal memuat data profil");
          }
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        setError("Terjadi kesalahan saat memuat profil");
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [session, status]);

  const handleGoToProfile = () => {
    router.push("/profile");
  };

  // Show loading state while checking authentication
  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Show message if user is not authenticated
  if (!session?.user) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Anda harus login untuk mengakses halaman ini.
        </AlertDescription>
      </Alert>
    );
  }

  // Show error message if failed to load profile
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // If no userData (data tidak lengkap), only show dialog
  if (!userData) {
    return (
      <AlertDialog
        open={showIncompleteDialog}
        onOpenChange={setShowIncompleteDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-100 rounded-full">
                <UserX className="h-6 w-6 text-amber-600" />
              </div>
              <AlertDialogTitle>Data Profil Belum Lengkap</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="pt-2">
              Anda perlu melengkapi data profil terlebih dahulu sebelum dapat
              mengajukan ujian tugas akhir. Silakan lengkapi data seperti nama,
              NIM, prodi, dan informasi lainnya.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={handleGoToProfile}
              className="w-full sm:w-auto"
            >
              Lengkapi Data Profil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <div className="w-full mb-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Data Mahasiswa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Row 1: Nama, NIM, Angkatan */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="nama"
                className="text-sm font-medium text-gray-600"
              >
                Nama
              </Label>
              <Input
                id="nama"
                value={userData.name || ""}
                disabled
                className="bg-gray-50 cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="nim"
                className="text-sm font-medium text-gray-600"
              >
                NIM / ID Mahasiswa
              </Label>
              <Input
                id="nim"
                value={userData.nim || ""}
                disabled
                className="bg-gray-50 cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="angkatan"
                className="text-sm font-medium text-gray-600"
              >
                Angkatan
              </Label>
              <Input
                id="angkatan"
                value={getAngkatan(userData.nim)}
                disabled
                className="bg-gray-50 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Row 2: Jurusan, Prodi, Semester */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="judul"
                className="text-sm font-medium text-gray-600"
              >
                Dosen Pembimbing
              </Label>
              <Input
                id="dosenPembimbing"
                value={
                  userData.dosenPembimbing ||
                  "Dosen pembimbing belum ditentukan"
                }
                disabled
                className="bg-gray-50 cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="prodi"
                className="text-sm font-medium text-gray-600"
              >
                Program Studi
              </Label>
              <Input
                id="prodi"
                value={formatProdi(userData.prodi)}
                disabled
                className="bg-gray-50 cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="semester"
                className="text-sm font-medium text-gray-600"
              >
                Semester
              </Label>
              <Input
                id="semester"
                value={getSemester(userData.nim)}
                disabled
                className="bg-gray-50 cursor-not-allowed"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FpTop;
