"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  AlertCircle,
  FileText,
  Download,
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle,
  BookOpen,
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { getUjianDetailsForAll } from "@/lib/actions/detailJadwal/detailJadwal";

interface BAModalProps {
  ujianId: string;
  userRole: "MAHASISWA" | "DOSEN" | "ADMIN";
  onClose: () => void;
}

interface UjianDetail {
  id: string;
  judul: string | null;
  berkasUrl: string | null;
  status: string;
  tanggalUjian: Date | null;
  jamMulai: Date | null;
  jamSelesai: Date | null;
  ruangan: {
    nama: string;
  } | null;
  mahasiswa: {
    name: string | null;
    nim: string | null;
    prodi: string | null;
  };
  dosenPembimbing: {
    name: string | null;
  } | null;
  dosenPenguji: Array<{
    dosen: {
      name: string | null;
    };
  }>;
}

export default function BAModal({ ujianId, userRole, onClose }: BAModalProps) {
  const [data, setData] = useState<UjianDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await getUjianDetailsForAll(ujianId);

        if (result.success && result.data) {
          setData(result.data as UjianDetail);
        } else {
          setError(result.error || "Gagal mengambil data");
        }
      } catch (err) {
        setError("Terjadi kesalahan saat mengambil data");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [ujianId]);

  const formatDate = (date: Date | null) => {
    if (!date) return "-";
    try {
      return format(new Date(date), "dd MMMM yyyy", { locale: id });
    } catch {
      return "-";
    }
  };

  const formatTime = (start: Date | null, end: Date | null) => {
    if (!start || !end) return "-";
    try {
      return `${format(new Date(start), "HH:mm")} - ${format(
        new Date(end),
        "HH:mm"
      )} WIB`;
    } catch {
      return "-";
    }
  };

  const formatProdi = (prodi: string | null) => {
    if (!prodi) return "-";
    return prodi.replace(/([A-Z])/g, " $1").trim();
  };

  const handleDownload = () => {
    if (data?.berkasUrl) {
      window.open(data.berkasUrl, "_blank");
    }
  };

  const getModalTitle = () => {
    if (userRole === "MAHASISWA") return "Detail Jadwal Ujian";
    if (userRole === "DOSEN") return "Berita Acara";
    return "Detail Jadwal & Berita Acara";
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col sm:max-w-3xl">
        <DialogHeader className="flex-shrink-0 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileText className="h-6 w-6 text-blue-600" />
            {getModalTitle()}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          </div>
        ) : error || !data ? (
          <Alert variant="destructive" className="m-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error || "Data tidak ditemukan"}
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
              {/* Data Mahasiswa - For DOSEN and ADMIN */}
              {(userRole === "DOSEN" || userRole === "ADMIN") && (
                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-5 border border-blue-200">
                  <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    Data Mahasiswa
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                        Nama Mahasiswa
                      </p>
                      <p className="text-base font-semibold text-gray-900">
                        {data.mahasiswa?.name || "-"}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-4">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                          NIM
                        </p>
                        <p className="text-base font-semibold text-gray-900">
                          {data.mahasiswa?.nim || "-"}
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-4">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                          Program Studi
                        </p>
                        <p className="text-base font-semibold text-gray-900">
                          {formatProdi(data.mahasiswa?.prodi)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Judul Tugas Akhir */}
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <BookOpen className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                      Judul Tugas Akhir
                    </p>
                    <p className="text-base font-medium text-gray-900 leading-relaxed">
                      {data.judul || "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Informasi Jadwal */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-5 border border-gray-200">
                <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gray-600" />
                  Informasi Jadwal
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-4 bg-white rounded-lg p-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Tanggal Ujian
                      </p>
                      <p className="text-base font-semibold text-gray-900 mt-1">
                        {formatDate(data.tanggalUjian)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 bg-white rounded-lg p-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <Clock className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Waktu Ujian
                      </p>
                      <p className="text-base font-semibold text-gray-900 mt-1">
                        {formatTime(data.jamMulai, data.jamSelesai)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 bg-white rounded-lg p-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-purple-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Ruang Ujian
                      </p>
                      <p className="text-base font-semibold text-gray-900 mt-1">
                        {data.ruangan?.nama || "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tim Penguji */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-5 border border-gray-200">
                <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-gray-600" />
                  Tim Penguji
                </h3>
                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                      Dosen Pembimbing 1
                    </p>
                    <p className="text-base font-semibold text-gray-900">
                      {data.dosenPembimbing?.name || "-"}
                    </p>
                  </div>

                  {data.dosenPenguji && data.dosenPenguji.length > 0 && (
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                        Dosen Penguji
                      </p>
                      <div className="space-y-2">
                        {data.dosenPenguji.map((penguji, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-3 py-2"
                          >
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                              <span className="text-sm font-semibold text-gray-600">
                                {idx + 1}
                              </span>
                            </div>
                            <p className="text-base font-medium text-gray-900">
                              {penguji.dosen?.name || "-"}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Berkas Download - For DOSEN and ADMIN */}
              {(userRole === "DOSEN" || userRole === "ADMIN") &&
                data.berkasUrl && (
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-5 border border-blue-200">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
                          <FileText className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="text-base font-semibold text-gray-900">
                            Dokumen Tugas Akhir
                          </p>
                          <p className="text-sm text-gray-600 mt-0.5">
                            File PDF tersedia untuk diunduh
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={handleDownload}
                        className="bg-blue-600 hover:bg-blue-700 flex-shrink-0"
                        size="default"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                )}

              {/* Catatan - Only for MAHASISWA
              {userRole === "MAHASISWA" && (
                <Alert className="bg-amber-50 border-amber-200">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                  <AlertDescription>
                    <p className="font-semibold text-gray-900 mb-1.5 text-sm">
                      Catatan Penting
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Silakan hadir 15 menit sebelum ujian dimulai dan membawa
                      dokumen cetak yang diperlukan.
                    </p>
                  </AlertDescription>
                </Alert>
              )} */}

              {/* Info Admin - Only for ADMIN */}
              {userRole === "ADMIN" && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <AlertDescription>
                    <p className="font-semibold text-gray-900 mb-1.5 text-sm">
                      Info Admin
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Anda dapat memverifikasi kelengkapan data ujian dari
                      tampilan ini. Pastikan semua informasi sudah sesuai dengan
                      dokumen yang diajukan.
                    </p>
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Action Button - Fixed at bottom */}
            <div className="flex-shrink-0 px-6 py-4 border-t bg-gray-50">
              <Button
                variant="outline"
                className="w-full"
                onClick={onClose}
                size="lg"
              >
                Tutup
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}