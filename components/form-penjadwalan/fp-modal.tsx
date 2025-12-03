"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  Calendar as CalendarIcon,
  Clock,
  Users,
  MapPin,
  BookOpen,
} from "lucide-react";
import {
  getUjianDetails,
  assignUjian,
  getAllDosen,
  getAvailableDosen,
  getAvailableRuangan,
  getAllRuangan,
} from "@/lib/actions/adminAssignUjian/adminJadwalin";
import { useRouter } from "next/navigation";

interface UjianData {
  mahasiswa: {
    name: string | null;
    nim: string | null;
    prodi: string | null;
  };
  judul: string | null;
  dosenPembimbing: {
    id: string;
    name: string | null;
  };
}

interface PenjadwalanModalProps {
  pengajuanId: string;
  onClose: () => void;
}

export function PenjadwalanModal({
  pengajuanId,
  onClose,
}: PenjadwalanModalProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [data, setData] = useState<UjianData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const [formData, setFormData] = useState({
    tanggalUjian: "",
    jamMulai: "",
    jamSelesai: "",
    ruanganId: "",
    dosenPenguji1: "",
    dosenPenguji2: "",
    catatan: "",
  });

  const [dosenList, setDosenList] = useState<
    Array<{ id: string; name: string | null }>
  >([]);
  const [availableDosen, setAvailableDosen] = useState<
    Array<{ id: string; name: string | null }>
  >([]);
  const [availableRuangan, setAvailableRuangan] = useState<
    Array<{ id: string; nama: string; deskripsi: string | null }>
  >([]);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [jamSelesaiManuallySet, setJamSelesaiManuallySet] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);

      try {
        const [ujianResult, dosenResult, ruanganResult] = await Promise.all([
          getUjianDetails(pengajuanId),
          getAllDosen(),
          getAllRuangan(),
        ]);

        if (ujianResult.success && ujianResult.data) {
          setData(ujianResult.data);
        } else {
          setError(ujianResult.error || "Gagal memuat data");
        }

        if (dosenResult.success && dosenResult.data) {
          const allDosen = dosenResult.data.map(
            (d: { id: string; name: string | null }) => ({
              id: d.id,
              name: d.name || "",
            })
          );
          setDosenList(allDosen);
          setAvailableDosen(allDosen);
        }

        if (ruanganResult.success && ruanganResult.data) {
          setAvailableRuangan(ruanganResult.data);
        }
      } catch {
        setError("Terjadi kesalahan saat memuat data");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [pengajuanId]);

  useEffect(() => {
    async function checkAvailability() {
      if (
        !formData.tanggalUjian ||
        !formData.jamMulai ||
        !formData.jamSelesai
      ) {
        setAvailableDosen(dosenList);
        return;
      }

      setIsCheckingAvailability(true);
      try {
        const [dosenResult, ruanganResult] = await Promise.all([
          getAvailableDosen(
            formData.tanggalUjian,
            formData.jamMulai,
            formData.jamSelesai,
            pengajuanId
          ),
          getAvailableRuangan(
            formData.tanggalUjian,
            formData.jamMulai,
            formData.jamSelesai,
            pengajuanId
          ),
        ]);

        if (dosenResult.success && dosenResult.data) {
          setAvailableDosen(dosenResult.data.available);

          if (formData.dosenPenguji1) {
            const isPenguji1Available = dosenResult.data.available.some(
              (d) => d.id === formData.dosenPenguji1
            );
            if (!isPenguji1Available) {
              setFormData((prev) => ({ ...prev, dosenPenguji1: "" }));
            }
          }

          if (formData.dosenPenguji2) {
            const isPenguji2Available = dosenResult.data.available.some(
              (d) => d.id === formData.dosenPenguji2
            );
            if (!isPenguji2Available) {
              setFormData((prev) => ({ ...prev, dosenPenguji2: "" }));
            }
          }
        }

        if (ruanganResult.success && ruanganResult.data) {
          setAvailableRuangan(ruanganResult.data.available);

          if (formData.ruanganId) {
            const isRuanganAvailable = ruanganResult.data.available.some(
              (r) => r.id === formData.ruanganId
            );
            if (!isRuanganAvailable) {
              setFormData((prev) => ({ ...prev, ruanganId: "" }));
            }
          }
        }
      } catch {
        console.error("Error checking availability");
      } finally {
        setIsCheckingAvailability(false);
      }
    }

    checkAvailability();
  }, [
    formData.tanggalUjian,
    formData.jamMulai,
    formData.jamSelesai,
    formData.dosenPenguji1,
    formData.dosenPenguji2,
    formData.ruanganId,
    dosenList,
    pengajuanId,
  ]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };

      if (field === "jamMulai" && value && !jamSelesaiManuallySet) {
        const [hours, minutes] = value.split(":").map(Number);
        const endTime = new Date();
        endTime.setHours(hours + 2, minutes);
        newData.jamSelesai = endTime.toTimeString().slice(0, 5);
      }

      return newData;
    });

    if (field === "jamSelesai") {
      setJamSelesaiManuallySet(true);
    }

    if (field === "jamMulai") {
      setJamSelesaiManuallySet(false);
    }

    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: [] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setMessage(null);
    setFieldErrors({});

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("ujianId", pengajuanId);
      formDataToSend.append("tanggalUjian", formData.tanggalUjian);
      formDataToSend.append("jamMulai", formData.jamMulai);
      formDataToSend.append("jamSelesai", formData.jamSelesai);
      formDataToSend.append("ruanganId", formData.ruanganId);
      formDataToSend.append("dosenPenguji1", formData.dosenPenguji1);
      formDataToSend.append("dosenPenguji2", formData.dosenPenguji2);

      const result = await assignUjian(formDataToSend);

      if (result.success) {
        setMessage({
          type: "success",
          text: result.message || "Ujian berhasil dijadwalkan",
        });

        setTimeout(() => {
          router.refresh();
          onClose();
        }, 1500);
      } else {
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        } else {
          setMessage({
            type: "error",
            text: result.error || "Gagal menjadwalkan ujian",
          });
        }
      }
    } catch {
      setMessage({
        type: "error",
        text: "Terjadi kesalahan saat menjadwalkan ujian",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatProdi = (prodi: string | null | undefined) => {
    if (!prodi) return "-";
    return prodi.replace(/([A-Z])/g, " $1").trim();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col sm:sm:max-w-4xl">
        <DialogHeader className="flex-shrink-0 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <CalendarIcon className="h-6 w-6 text-blue-600" />
            Penjadwalan Ujian
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          </div>
        ) : error ? (
          <Alert variant="destructive" className="m-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
              {message && (
                <Alert
                  variant={message.type === "error" ? "destructive" : "default"}
                  className={message.type === "success" ? "bg-green-50 border-green-200" : ""}
                >
                  {message.type === "success" ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertDescription className={message.type === "success" ? "text-green-800" : ""}>
                    {message.text}
                  </AlertDescription>
                </Alert>
              )}

              {/* Data Mahasiswa */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-5 border border-blue-200">
                <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Data Mahasiswa
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Nama Mahasiswa
                    </p>
                    <p className="text-base font-semibold text-gray-900">
                      {data?.mahasiswa.name || "-"}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      NIM
                    </p>
                    <p className="text-base font-semibold text-gray-900">
                      {data?.mahasiswa.nim || "-"}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Program Studi
                    </p>
                    <p className="text-base font-semibold text-gray-900">
                      {formatProdi(data?.mahasiswa.prodi)}
                    </p>
                  </div>
                </div>
              </div>

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
                      {data?.judul || "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Jadwal Ujian Section */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-5 border border-gray-200">
                <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-gray-600" />
                  Jadwal Ujian
                </h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="tanggalUjian"
                        className="text-xs font-medium text-gray-700 uppercase tracking-wide"
                      >
                        Tanggal
                      </Label>
                      <Input
                        id="tanggalUjian"
                        type="date"
                        min={new Date().toISOString().split("T")[0]}
                        value={formData.tanggalUjian}
                        onChange={(e) =>
                          handleInputChange("tanggalUjian", e.target.value)
                        }
                        disabled={isProcessing}
                        required
                        className="h-11"
                      />
                      {fieldErrors.tanggalUjian && (
                        <p className="text-xs text-red-600 mt-1">
                          {fieldErrors.tanggalUjian[0]}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="jamMulai"
                        className="text-xs font-medium text-gray-700 uppercase tracking-wide"
                      >
                        Jam Mulai
                      </Label>
                      <Input
                        id="jamMulai"
                        type="time"
                        value={formData.jamMulai}
                        onChange={(e) =>
                          handleInputChange("jamMulai", e.target.value)
                        }
                        disabled={isProcessing}
                        required
                        className="h-11"
                      />
                      {fieldErrors.jamMulai && (
                        <p className="text-xs text-red-600 mt-1">
                          {fieldErrors.jamMulai[0]}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="jamSelesai"
                        className="text-xs font-medium text-gray-700 uppercase tracking-wide"
                      >
                        Jam Selesai
                      </Label>
                      <Input
                        id="jamSelesai"
                        type="time"
                        value={formData.jamSelesai}
                        onChange={(e) =>
                          handleInputChange("jamSelesai", e.target.value)
                        }
                        disabled={isProcessing}
                        required
                        className="h-11"
                      />
                      {fieldErrors.jamSelesai && (
                        <p className="text-xs text-red-600 mt-1">
                          {fieldErrors.jamSelesai[0]}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="ruanganId"
                      className="text-xs font-medium text-gray-700 uppercase tracking-wide flex items-center gap-2"
                    >
                      <MapPin className="h-3.5 w-3.5" />
                      Ruangan
                      {isCheckingAvailability && (
                        <span className="text-xs font-normal text-blue-600 normal-case">
                          (Memeriksa ketersediaan...)
                        </span>
                      )}
                    </Label>
                    <Select
                      value={formData.ruanganId}
                      onValueChange={(value) =>
                        handleInputChange("ruanganId", value)
                      }
                      disabled={isProcessing || isCheckingAvailability}
                    >
                      <SelectTrigger id="ruanganId" className="h-11">
                        <SelectValue placeholder="Pilih Ruangan" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableRuangan.length > 0 ? (
                          availableRuangan.map((ruangan) => (
                            <SelectItem key={ruangan.id} value={ruangan.id}>
                              <span className="font-medium">{ruangan.nama}</span>
                              {ruangan.deskripsi && (
                                <span className="text-xs text-muted-foreground ml-2">
                                  - {ruangan.deskripsi}
                                </span>
                              )}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="px-2 py-1.5 text-sm text-muted-foreground">
                            {isCheckingAvailability
                              ? "Memeriksa ketersediaan..."
                              : formData.tanggalUjian &&
                                formData.jamMulai &&
                                formData.jamSelesai
                              ? "Tidak ada ruangan tersedia"
                              : "Pilih tanggal dan waktu terlebih dahulu"}
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    {fieldErrors.ruanganId && (
                      <p className="text-xs text-red-600 mt-1">
                        {fieldErrors.ruanganId[0]}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Tim Penguji Section */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-5 border border-gray-200">
                <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-gray-600" />
                  Tim Penguji
                </h3>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                      Pembimbing 1
                    </Label>
                    <Input
                      value={data?.dosenPembimbing.name || ""}
                      disabled
                      className="bg-gray-100 h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="dosenPenguji1"
                      className="text-xs font-medium text-gray-700 uppercase tracking-wide"
                    >
                      Pembimbing 2
                      {isCheckingAvailability && (
                        <span className="ml-2 text-xs font-normal text-blue-600 normal-case">
                          (Memeriksa...)
                        </span>
                      )}
                    </Label>
                    <Select
                      value={formData.dosenPenguji1}
                      onValueChange={(value) =>
                        handleInputChange("dosenPenguji1", value)
                      }
                      disabled={isProcessing || isCheckingAvailability}
                    >
                      <SelectTrigger id="dosenPenguji1" className="h-11">
                        <SelectValue placeholder="Pilih Pembimbing 2" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableDosen
                          .filter(
                            (d) =>
                              d.id !== formData.dosenPenguji2 &&
                              d.id !== data?.dosenPembimbing.id
                          )
                          .map((dosen) => (
                            <SelectItem key={dosen.id} value={dosen.id}>
                              {dosen.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    {fieldErrors.dosenPenguji1Id && (
                      <p className="text-xs text-red-600 mt-1">
                        {fieldErrors.dosenPenguji1Id[0]}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="dosenPenguji2"
                      className="text-xs font-medium text-gray-700 uppercase tracking-wide"
                    >
                      Penguji
                      {isCheckingAvailability && (
                        <span className="ml-2 text-xs font-normal text-blue-600 normal-case">
                          (Memeriksa...)
                        </span>
                      )}
                    </Label>
                    <Select
                      value={formData.dosenPenguji2}
                      onValueChange={(value) =>
                        handleInputChange("dosenPenguji2", value)
                      }
                      disabled={isProcessing || isCheckingAvailability}
                    >
                      <SelectTrigger id="dosenPenguji2" className="h-11">
                        <SelectValue placeholder="Pilih Penguji" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableDosen
                          .filter(
                            (d) =>
                              d.id !== formData.dosenPenguji1 &&
                              d.id !== data?.dosenPembimbing.id
                          )
                          .map((dosen) => (
                            <SelectItem key={dosen.id} value={dosen.id}>
                              {dosen.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    {fieldErrors.dosenPenguji2Id && (
                      <p className="text-xs text-red-600 mt-1">
                        {fieldErrors.dosenPenguji2Id[0]}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Catatan */}
              <div className="space-y-2">
                <Label htmlFor="catatan" className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                  Catatan (Opsional)
                </Label>
                <textarea
                  id="catatan"
                  value={formData.catatan}
                  onChange={(e) => handleInputChange("catatan", e.target.value)}
                  placeholder="Silakan hadir 15 menit sebelum ujian dimulai dan membawa dokumen cetak."
                  rows={3}
                  disabled={isProcessing}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                />
              </div>
            </div>

            {/* Action Buttons - Fixed at bottom */}
            <div className="flex-shrink-0 px-6 py-4 border-t bg-gray-50 flex gap-3">
              <Button
                type="submit"
                disabled={isProcessing}
                className="flex-1 bg-blue-600 hover:bg-blue-700 h-11"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Jadwalkan Ujian
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-11"
                onClick={onClose}
                disabled={isProcessing}
              >
                Batal
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}