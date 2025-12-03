"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import {
  getUjianForReview,
  acceptUjian,
  rejectUjian,
} from "@/lib/actions/adminAssignUjian/adminTerimaTolakUjian";
import {
  AlertCircle,
  CheckCircle,
  Loader2,
  CheckSquare,
  XSquare,
  Download,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";

interface UjianData {
  id: string;
  judul: string;
  berkasUrl: string;
  status: string;
  createdAt: Date;
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
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const resolvedParams = use(params);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [ujianData, setUjianData] = useState<UjianData | null>(null);
  const [komentarAdmin, setKomentarAdmin] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

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
        const ujianResult = await getUjianForReview(resolvedParams.id);

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

  const handleAccept = async () => {
    setIsProcessing(true);
    setMessage(null);

    try {
      const result = await acceptUjian(resolvedParams.id);

      if (result.success) {
        setMessage({
          type: "success",
          text: result.message || "Pengajuan diterima",
        });

        // Redirect to admin-assign page after a short delay
        if (result.redirectTo) {
          setTimeout(() => {
            router.push(result.redirectTo!);
          }, 1500);
        }
      } else {
        setMessage({
          type: "error",
          text: result.error || "Terjadi kesalahan saat menerima pengajuan",
        });
      }
    } catch (error) {
      console.error("Error accepting ujian:", error);
      setMessage({
        type: "error",
        text: "Terjadi kesalahan saat menerima pengajuan",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    setIsProcessing(true);
    setMessage(null);

    try {
      const result = await rejectUjian(resolvedParams.id, komentarAdmin);

      if (result.success) {
        setMessage({
          type: "success",
          text: result.message || "Pengajuan ditolak",
        });
        setShowRejectForm(false);

        // Reload data to show updated status
        const ujianResult = await getUjianForReview(resolvedParams.id);
        if (ujianResult.success && ujianResult.data) {
          setUjianData(ujianResult.data as UjianData);
        }
      } else {
        setMessage({
          type: "error",
          text: result.error || "Terjadi kesalahan saat menolak pengajuan",
        });
      }
    } catch (error) {
      console.error("Error rejecting ujian:", error);
      setMessage({
        type: "error",
        text: "Terjadi kesalahan saat menolak pengajuan",
      });
    } finally {
      setIsProcessing(false);
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
          <CardTitle>Review Pengajuan Ujian</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Status Messages */}
          {message && (
            <Alert
              variant={message.type === "error" ? "destructive" : "default"}
              className="mb-6"
            >
              {message.type === "success" ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          {/* Ujian Details */}
          <div className="space-y-6">
            {/* Mahasiswa Info */}
            <div className="p-4 bg-muted rounded-lg space-y-3">
              <h3 className="font-semibold text-lg">Informasi Mahasiswa</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Nama:
                  </span>
                  <p className="font-medium">{ujianData.mahasiswa.name}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    NIM:
                  </span>
                  <p className="font-medium">{ujianData.mahasiswa.nim}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Program Studi:
                  </span>
                  <p className="font-medium">{ujianData.mahasiswa.prodi}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Status:
                  </span>
                  <p className="font-medium">{ujianData.status}</p>
                </div>
              </div>
            </div>

            {/* Judul Tugas Akhir */}
            <div>
              <Label className="text-base">Judul Tugas Akhir</Label>
              <p className="mt-2 p-3 bg-muted rounded-md">{ujianData.judul}</p>
            </div>

            {/* Dosen Pembimbing */}
            <div>
              <Label className="text-base">Dosen Pembimbing</Label>
              <p className="mt-2 p-3 bg-muted rounded-md">
                {ujianData.dosenPembimbing.name}
              </p>
            </div>

            {/* Berkas Download Link */}
            <div>
              <Label className="text-base">Berkas Ujian</Label>
              <div className="mt-2">
                <Button variant="outline" className="w-full md:w-auto" asChild>
                  <a
                    href={ujianData.berkasUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Berkas
                  </a>
                </Button>
              </div>
            </div>

            {/* Reject Form (conditional) */}
            {showRejectForm && (
              <div className="space-y-2">
                <Label htmlFor="komentarAdmin">
                  Komentar / Alasan Penolakan (Opsional)
                </Label>
                <textarea
                  id="komentarAdmin"
                  value={komentarAdmin}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setKomentarAdmin(e.target.value)
                  }
                  placeholder="Masukkan alasan penolakan..."
                  rows={4}
                  disabled={isProcessing}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col md:flex-row gap-3 pt-4">
              {!showRejectForm ? (
                <>
                  <Button
                    onClick={handleAccept}
                    disabled={
                      isProcessing || ujianData.status !== "MENUNGGU_VERIFIKASI"
                    }
                    className="flex-1"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      <>
                        <CheckSquare className="mr-2 h-4 w-4" />
                        Verifikasi
                      </>
                    )}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setShowRejectForm(true)}
                    disabled={
                      isProcessing || ujianData.status !== "MENUNGGU_VERIFIKASI"
                    }
                    className="flex-1"
                  >
                    <XSquare className="mr-2 h-4 w-4" />
                    Tolak
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="destructive"
                    onClick={handleReject}
                    disabled={isProcessing}
                    className="flex-1"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      <>
                        <XSquare className="mr-2 h-4 w-4" />
                        Konfirmasi Penolakan
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowRejectForm(false);
                      setKomentarAdmin("");
                    }}
                    disabled={isProcessing}
                    className="flex-1"
                  >
                    Batal
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
