"use client";

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  getUjianDetails,
  assignUjian,
  getAvailableDosen,
  getAllDosen,
  getAvailableRuangan,
} from "@/lib/actions/adminAssignUjian/adminJadwalin";
import { AlertCircle, CheckCircle, Loader2, Save } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState, use } from "react";

interface UjianData {
  id: string;
  judul: string;
  status: string;
  mahasiswa: {
    id: string;
    name: string | null;
    nim: string | null;
    prodi: string | null;
  };
  dosenPembimbing: {
    id: string;
    name: string | null;
  };
  dosenPenguji: Array<{
    dosen: {
      id: string;
      name: string | null;
    };
  }>;
  tanggalUjian: Date | null;
  jamMulai: Date | null;
  jamSelesai: Date | null;
  ruangan: {
    id: string;
    nama: string;
    deskripsi: string | null;
  } | null;
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession();
  const resolvedParams = use(params);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error" | "warning";
    text: string;
    calendarLink?: string;
  } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [ujianData, setUjianData] = useState<UjianData | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    tanggalUjian: "",
    jamMulai: "",
    jamSelesai: "",
    ruanganId: "",
    dosenPenguji1: "",
    dosenPenguji2: "",
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
  const [shouldCheckAvailability, setShouldCheckAvailability] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (status === "loading") return;

      if (!session?.user) {
        setIsLoading(false);
        return;
      }

      if (session.user.role !== "ADMIN") {
        setMessage({
          type: "error",
          text: "Akses ditolak. Hanya admin yang dapat mengakses halaman ini.",
        });
        setIsLoading(false);
        return;
      }

      try {
        // Load ujian details and dosen list in parallel
        const [ujianResult, dosensResult] = await Promise.all([
          getUjianDetails(resolvedParams.id),
          getAllDosen(),
        ]);

        if (!ujianResult.success) {
          setMessage({
            type: "error",
            text: ujianResult.error || "Gagal memuat data ujian",
          });
          setIsLoading(false);
          return;
        }

        if (ujianResult.data) {
          setUjianData(ujianResult.data as UjianData);

          // Pre-fill form if data exists
          if (ujianResult.data.tanggalUjian) {
            const tanggal = new Date(ujianResult.data.tanggalUjian);
            setFormData((prev) => ({
              ...prev,
              tanggalUjian: tanggal.toISOString().split("T")[0],
            }));
          }
          if (ujianResult.data.jamMulai) {
            const jamMulai = new Date(ujianResult.data.jamMulai);
            setFormData((prev) => ({
              ...prev,
              jamMulai: `${((jamMulai.getUTCHours() + 7) % 24)
                .toString()
                .padStart(2, "0")}:${jamMulai
                .getUTCMinutes()
                .toString()
                .padStart(2, "0")}`,
            }));
          }
          if (ujianResult.data.jamSelesai) {
            const jamSelesai = new Date(ujianResult.data.jamSelesai);
            setFormData((prev) => ({
              ...prev,
              jamSelesai: `${((jamSelesai.getUTCHours() + 7) % 24)
                .toString()
                .padStart(2, "0")}:${jamSelesai
                .getUTCMinutes()
                .toString()
                .padStart(2, "0")}`,
            }));
          } else if (ujianResult.data.jamMulai) {
            // Auto-fill jam selesai to 2 hours after jam mulai if not set
            const jamMulai = new Date(ujianResult.data.jamMulai);
            jamMulai.setUTCHours(jamMulai.getUTCHours() + 2);
            setFormData((prev) => ({
              ...prev,
              jamSelesai: `${((jamMulai.getUTCHours() + 7) % 24)
                .toString()
                .padStart(2, "0")}:${jamMulai
                .getUTCMinutes()
                .toString()
                .padStart(2, "0")}`,
            }));
          }
          if (ujianResult.data.ruangan) {
            setFormData((prev) => ({
              ...prev,
              ruanganId: ujianResult.data.ruangan?.id || "",
            }));
          }
          if (ujianResult.data.dosenPenguji.length > 0) {
            setFormData((prev) => ({
              ...prev,
              dosenPenguji1: ujianResult.data.dosenPenguji[0]?.dosen.id || "",
              dosenPenguji2: ujianResult.data.dosenPenguji[1]?.dosen.id || "",
            }));
          }

          // Trigger availability check if we have all required data
          if (
            ujianResult.data.tanggalUjian &&
            ujianResult.data.jamMulai &&
            (ujianResult.data.jamSelesai || ujianResult.data.jamMulai)
          ) {
            setShouldCheckAvailability(true);
          }
        }

        if (dosensResult.success && dosensResult.data) {
          const allDosen = dosensResult.data.map(
            (d: { id: string; name: string | null }) => ({
              id: d.id,
              name: d.name || "",
            })
          );
          setDosenList(allDosen);
          setAvailableDosen(allDosen); // Initially show all
        }
      } catch (error) {
        console.error("Error loading data:", error);
        setMessage({ type: "error", text: "Gagal memuat data" });
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [session, status, resolvedParams.id]);

  // Check dosen availability when date/time changes
  useEffect(() => {
    async function checkAvailability() {
      if (
        !formData.tanggalUjian ||
        !formData.jamMulai ||
        !formData.jamSelesai
      ) {
        setAvailableDosen(dosenList);
        setAvailableRuangan([]);
        return;
      }

      setIsCheckingAvailability(true);
      try {
        const [dosenResult, ruanganResult] = await Promise.all([
          getAvailableDosen(
            formData.tanggalUjian,
            formData.jamMulai,
            formData.jamSelesai,
            resolvedParams.id
          ),
          getAvailableRuangan(
            formData.tanggalUjian,
            formData.jamMulai,
            formData.jamSelesai,
            resolvedParams.id
          ),
        ]);

        if (dosenResult.success && dosenResult.data) {
          setAvailableDosen(dosenResult.data.available);

          // Clear selected dosen if they become unavailable
          if (formData.dosenPenguji1) {
            const isPenguji1Available = dosenResult.data.available.some(
              (d) => d.id === formData.dosenPenguji1
            );
            if (!isPenguji1Available) {
              setFormData((prev) => ({ ...prev, dosenPenguji1: "" }));
              setMessage({
                type: "error",
                text: "Dosen Penguji 1 yang dipilih tidak tersedia pada waktu ini",
              });
            }
          }

          if (formData.dosenPenguji2) {
            const isPenguji2Available = dosenResult.data.available.some(
              (d) => d.id === formData.dosenPenguji2
            );
            if (!isPenguji2Available) {
              setFormData((prev) => ({ ...prev, dosenPenguji2: "" }));
              setMessage({
                type: "error",
                text: "Dosen Penguji 2 yang dipilih tidak tersedia pada waktu ini",
              });
            }
          }
        } else if (dosenResult.error) {
          setMessage({
            type: "error",
            text: dosenResult.error,
          });
        }

        if (ruanganResult.success && ruanganResult.data) {
          setAvailableRuangan(ruanganResult.data.available);

          // Clear selected ruangan if it becomes unavailable
          if (formData.ruanganId) {
            const isRuanganAvailable = ruanganResult.data.available.some(
              (r) => r.id === formData.ruanganId
            );
            if (!isRuanganAvailable) {
              setFormData((prev) => ({ ...prev, ruanganId: "" }));
              setMessage({
                type: "error",
                text: "Ruangan yang dipilih tidak tersedia pada waktu ini",
              });
            }
          }
        } else if (ruanganResult.error) {
          setMessage({
            type: "error",
            text: ruanganResult.error,
          });
        }
      } catch (error) {
        console.error("Error checking availability:", error);
      } finally {
        setIsCheckingAvailability(false);
      }
    }

    if (shouldCheckAvailability || formData.tanggalUjian) {
      checkAvailability();
      setShouldCheckAvailability(false);
    }
  }, [
    formData.tanggalUjian,
    formData.jamMulai,
    formData.jamSelesai,
    formData.dosenPenguji1,
    formData.dosenPenguji2,
    formData.ruanganId,
    dosenList,
    resolvedParams.id,
    shouldCheckAvailability,
  ]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };

      // Auto-fill jam selesai when jam mulai changes (2 hours default)
      if (field === "jamMulai" && value && !prev.jamSelesai) {
        const [hours, minutes] = value.split(":").map(Number);
        const endTime = new Date();
        endTime.setUTCHours(hours + 2, minutes);
        newData.jamSelesai = `${(endTime.getUTCHours() % 24)
          .toString()
          .padStart(2, "0")}:${endTime
          .getUTCMinutes()
          .toString()
          .padStart(2, "0")}`;
      }

      return newData;
    });

    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: [] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    setFieldErrors({});

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("ujianId", resolvedParams.id);
      formDataToSend.append("tanggalUjian", formData.tanggalUjian);
      formDataToSend.append("jamMulai", formData.jamMulai);
      formDataToSend.append("jamSelesai", formData.jamSelesai);
      formDataToSend.append("ruanganId", formData.ruanganId);
      formDataToSend.append("dosenPenguji1", formData.dosenPenguji1);
      formDataToSend.append("dosenPenguji2", formData.dosenPenguji2);

      const result = await assignUjian(formDataToSend);

      if (result.success) {
        const messageType = result.needsCalendarReauth ? "warning" : "success";
        setMessage({
          type: messageType,
          text: result.message || "Ujian berhasil dijadwalkan",
          calendarLink: result.calendarEventLink || undefined,
        });
        // Reload data after successful assignment
        const ujianResult = await getUjianDetails(resolvedParams.id);
        if (ujianResult.success && ujianResult.data) {
          setUjianData(ujianResult.data as UjianData);
        }
      } else {
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        } else {
          setMessage({
            type: "error",
            text: result.error || "Terjadi kesalahan saat menjadwalkan ujian",
          });
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setMessage({
        type: "error",
        text: "Terjadi kesalahan saat menjadwalkan ujian",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Show loading state
  if (status === "loading" || isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  // Show error if not admin
  if (!session?.user || session.user.role !== "ADMIN") {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Akses ditolak. Hanya admin yang dapat mengakses halaman ini.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Show error if ujian not found
  if (!ujianData) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Ujian tidak ditemukan.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <Card>
        <CardHeader>
          <CardTitle>Jadwalkan Ujian</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Status Messages */}
          {message && (
            <Alert
              variant={
                message.type === "error"
                  ? "destructive"
                  : message.type === "warning"
                  ? "default"
                  : "default"
              }
              className={`mb-6 ${
                message.type === "warning"
                  ? "border-yellow-500 bg-yellow-50"
                  : ""
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : message.type === "warning" ? (
                <AlertCircle className="h-4 w-4 text-yellow-600" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription
                className={message.type === "warning" ? "text-yellow-900" : ""}
              >
                {message.text}
                {message.calendarLink && (
                  <div className="mt-2">
                    <a
                      href={message.calendarLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline font-medium"
                    >
                      Lihat Event di Google Calendar →
                    </a>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Ujian Info */}
          <div className="mb-6 space-y-2 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold text-lg">Informasi Ujian</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-medium">Mahasiswa:</span>{" "}
                {ujianData.mahasiswa.name} ({ujianData.mahasiswa.nim})
              </div>
              <div>
                <span className="font-medium">Judul:</span> {ujianData.judul}
              </div>
              <div>
                <span className="font-medium">Status:</span> {ujianData.status}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Dosen Pembimbing (Read-only) */}
            <div className="space-y-2">
              <Label>Dosen Pembimbing</Label>
              <Input value={ujianData.dosenPembimbing.name || ""} disabled />
            </div>

            {/* Tanggal Ujian */}
            <div className="space-y-2">
              <Label htmlFor="tanggalUjian">Tanggal Ujian *</Label>
              <Input
                id="tanggalUjian"
                name="tanggalUjian"
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={formData.tanggalUjian}
                onChange={(e) =>
                  handleInputChange("tanggalUjian", e.target.value)
                }
                disabled={isSaving}
                required
              />
              {fieldErrors.tanggalUjian && (
                <p className="text-sm text-destructive">
                  {fieldErrors.tanggalUjian[0]}
                </p>
              )}
            </div>

            {/* Jam Mulai */}
            <div className="space-y-2">
              <Label htmlFor="jamMulai">Jam Mulai *</Label>
              <Input
                id="jamMulai"
                name="jamMulai"
                type="time"
                value={formData.jamMulai}
                onChange={(e) => handleInputChange("jamMulai", e.target.value)}
                disabled={isSaving}
                required
              />
              {fieldErrors.jamMulai && (
                <p className="text-sm text-destructive">
                  {fieldErrors.jamMulai[0]}
                </p>
              )}
            </div>

            {/* Jam Selesai */}
            <div className="space-y-2">
              <Label htmlFor="jamSelesai">
                Jam Selesai *{" "}
                {formData.jamMulai &&
                  !formData.jamSelesai &&
                  "(otomatis +2 jam)"}
              </Label>
              <Input
                id="jamSelesai"
                name="jamSelesai"
                type="time"
                value={formData.jamSelesai}
                onChange={(e) =>
                  handleInputChange("jamSelesai", e.target.value)
                }
                disabled={isSaving}
                required
              />
              {fieldErrors.jamSelesai && (
                <p className="text-sm text-destructive">
                  {fieldErrors.jamSelesai[0]}
                </p>
              )}
            </div>

            {/* Ruangan */}
            <div className="space-y-2">
              <Label htmlFor="ruanganId">
                Ruangan *
                {isCheckingAvailability && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    (Memeriksa ketersediaan...)
                  </span>
                )}
              </Label>
              <Select
                value={formData.ruanganId}
                onValueChange={(value) => handleInputChange("ruanganId", value)}
                disabled={isSaving || isCheckingAvailability}
              >
                <SelectTrigger id="ruanganId">
                  <SelectValue placeholder="Pilih Ruangan" />
                </SelectTrigger>
                <SelectContent>
                  {availableRuangan.map((ruangan) => (
                    <SelectItem key={ruangan.id} value={ruangan.id}>
                      {ruangan.nama}
                      {ruangan.deskripsi && (
                        <span className="text-xs text-muted-foreground ml-2">
                          - {ruangan.deskripsi}
                        </span>
                      )}
                    </SelectItem>
                  ))}
                  {availableRuangan.length === 0 && (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      Tidak ada ruangan tersedia pada waktu ini
                    </div>
                  )}
                </SelectContent>
              </Select>
              {fieldErrors.ruanganId && (
                <p className="text-sm text-destructive">
                  {fieldErrors.ruanganId[0]}
                </p>
              )}
            </div>

            {/* Dosen Penguji 1 */}
            <div className="space-y-2">
              <Label htmlFor="dosenPenguji1">
                Dosen Penguji 1 *
                {isCheckingAvailability && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    (Memeriksa ketersediaan...)
                  </span>
                )}
              </Label>
              <Select
                value={formData.dosenPenguji1}
                onValueChange={(value) =>
                  handleInputChange("dosenPenguji1", value)
                }
                disabled={isSaving || isCheckingAvailability}
              >
                <SelectTrigger id="dosenPenguji1">
                  <SelectValue placeholder="Pilih Dosen Penguji 1" />
                </SelectTrigger>
                <SelectContent>
                  {availableDosen
                    .filter(
                      (d) =>
                        d.id !== formData.dosenPenguji2 &&
                        d.id !== ujianData.dosenPembimbing.id
                    )
                    .map((dosen) => (
                      <SelectItem key={dosen.id} value={dosen.id}>
                        {dosen.name}
                      </SelectItem>
                    ))}
                  {availableDosen.filter(
                    (d) => d.id !== ujianData.dosenPembimbing.id
                  ).length === 0 && (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      Tidak ada dosen tersedia pada waktu ini
                    </div>
                  )}
                </SelectContent>
              </Select>
              {fieldErrors.dosenPenguji1Id && (
                <p className="text-sm text-destructive">
                  {fieldErrors.dosenPenguji1Id[0]}
                </p>
              )}
            </div>

            {/* Dosen Penguji 2 */}
            <div className="space-y-2">
              <Label htmlFor="dosenPenguji2">
                Dosen Penguji 2 *
                {isCheckingAvailability && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    (Memeriksa ketersediaan...)
                  </span>
                )}
              </Label>
              <Select
                value={formData.dosenPenguji2}
                onValueChange={(value) =>
                  handleInputChange("dosenPenguji2", value)
                }
                disabled={isSaving || isCheckingAvailability}
              >
                <SelectTrigger id="dosenPenguji2">
                  <SelectValue placeholder="Pilih Dosen Penguji 2" />
                </SelectTrigger>
                <SelectContent>
                  {availableDosen
                    .filter(
                      (d) =>
                        d.id !== formData.dosenPenguji1 &&
                        d.id !== ujianData.dosenPembimbing.id
                    )
                    .map((dosen) => (
                      <SelectItem key={dosen.id} value={dosen.id}>
                        {dosen.name}
                      </SelectItem>
                    ))}
                  {availableDosen.filter(
                    (d) => d.id !== ujianData.dosenPembimbing.id
                  ).length === 0 && (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      Tidak ada dosen tersedia pada waktu ini
                    </div>
                  )}
                </SelectContent>
              </Select>
              {fieldErrors.dosenPenguji2Id && (
                <p className="text-sm text-destructive">
                  {fieldErrors.dosenPenguji2Id[0]}
                </p>
              )}
            </div>

            <div className="pt-4">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Jadwalkan Ujian
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
