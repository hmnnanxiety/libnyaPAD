"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  FileText,
  Users,
  BookOpen,
} from "lucide-react";
import {
  getUjianForReview,
  acceptUjian,
  rejectUjian,
} from "@/lib/actions/adminAssignUjian/adminTerimaTolakUjian";
import { useRouter } from "next/navigation";
import { ApproveConfirmationModal } from "./p-accmodal";

interface PengajuanData {
  mahasiswa: {
    name: string | null;
    nim: string | null;
    prodi?: string | null;
  };
  judul: string;
  berkasUrl?: string;
  status: string;
}

interface PengajuanModalVerifyProps {
  pengajuanId: string;
  onClose: () => void;
}

export function PengajuanModalVerify({
  pengajuanId,
  onClose,
}: PengajuanModalVerifyProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [data, setData] = useState<PengajuanData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [showApproveConfirmation, setShowApproveConfirmation] = useState(false);
  const [komentarAdmin, setKomentarAdmin] = useState("");

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);

      try {
        const result = await getUjianForReview(pengajuanId);

        if (result.success && result.data) {
          setData(result.data);
        } else {
          setError(result.error || "Gagal memuat data");
        }
      } catch {
        setError("Terjadi kesalahan saat memuat data");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [pengajuanId]);

  const handleAcceptClick = () => {
    setShowApproveConfirmation(true);
  };

  const handleAcceptConfirm = async () => {
    setShowApproveConfirmation(false);
    setIsProcessing(true);
    setMessage(null);

    try {
      const result = await acceptUjian(pengajuanId);

      if (result.success) {
        setMessage({
          type: "success",
          text: result.message || "Pengajuan diterima",
        });

        setTimeout(() => {
          router.push("/form-penjadwalan");
          router.refresh();
          onClose();
        }, 1500);
      } else {
        setMessage({
          type: "error",
          text: result.error || "Gagal menerima pengajuan",
        });
      }
    } catch {
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
      const result = await rejectUjian(pengajuanId, komentarAdmin);

      if (result.success) {
        setMessage({
          type: "success",
          text: result.message || "Pengajuan ditolak",
        });

        setTimeout(() => {
          router.refresh();
          onClose();
        }, 1500);
      } else {
        setMessage({
          type: "error",
          text: result.error || "Gagal menolak pengajuan",
        });
      }
    } catch {
      setMessage({
        type: "error",
        text: "Terjadi kesalahan saat menolak pengajuan",
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
    <>
      <ApproveConfirmationModal
        isOpen={showApproveConfirmation}
        onClose={() => setShowApproveConfirmation(false)}
        onConfirm={handleAcceptConfirm}
        mahasiswaName={data?.mahasiswa.name || "-"}
        judulTA={data?.judul || "-"}
      />

      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col sm:sm:max-w-3xl">
          <DialogHeader className="flex-shrink-0 pb-4 border-b">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <FileText className="h-6 w-6 text-blue-600" />
              Verifikasi Pengajuan
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
            <>
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
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                        Nama Mahasiswa
                      </p>
                      <p className="text-base font-semibold text-gray-900">
                        {data?.mahasiswa.name || "-"}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-4">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                          NIM / ID Mahasiswa
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

                {/* Berkas */}
                {data?.berkasUrl && (
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
                          <p className="text-sm text-gray-600 mt-0.5 truncate max-w-xs">
                            {data.berkasUrl.split("/").pop()}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="default"
                        asChild
                        className="flex-shrink-0 hover:bg-blue-200"
                      >
                        <a
                          href={data.berkasUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </a>
                      </Button>
                    </div>
                  </div>
                )}

                {/* Reject Form (Collapsible) */}
                {showRejectForm && (
                  <div className="bg-red-50 rounded-xl p-5 border border-red-200 space-y-3">
                    <Label htmlFor="komentar" className="text-sm font-semibold text-gray-900">
                      Komentar / Alasan Penolakan (Opsional)
                    </Label>
                    <textarea
                      id="komentar"
                      value={komentarAdmin}
                      onChange={(e) => setKomentarAdmin(e.target.value)}
                      placeholder="Masukkan alasan penolakan..."
                      rows={4}
                      disabled={isProcessing}
                      className="flex w-full rounded-md border border-red-300 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                    />
                  </div>
                )}

                {/* Status Warning */}
                {data?.status && data.status !== "MENUNGGU_VERIFIKASI" && (
                  <Alert className="bg-amber-50 border-amber-200">
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                    <AlertDescription>
                      <p className="font-semibold text-gray-900 mb-1.5 text-sm">
                        Status Pengajuan
                      </p>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        Pengajuan ini sudah diproses dengan status: <span className="font-semibold">{data.status}</span>
                      </p>
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Action Buttons - Fixed at bottom */}
              <div className="flex-shrink-0 px-6 py-4 border-t bg-gray-50">
                {!showRejectForm ? (
                  <div className="flex gap-3">
                    <Button
                      className="flex-1 bg-blue-600 hover:bg-blue-700 h-11"
                      onClick={handleAcceptClick}
                      disabled={
                        isProcessing || data?.status !== "MENUNGGU_VERIFIKASI"
                      }
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Memproses...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Verifikasi
                        </>
                      )}
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1 h-11"
                      onClick={() => setShowRejectForm(true)}
                      disabled={
                        isProcessing || data?.status !== "MENUNGGU_VERIFIKASI"
                      }
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Tolak
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <Button
                      variant="destructive"
                      className="flex-1 h-11"
                      onClick={handleReject}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Memproses...
                        </>
                      ) : (
                        <>
                          <XCircle className="mr-2 h-4 w-4" />
                          Konfirmasi Penolakan
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 h-11"
                      onClick={() => {
                        setShowRejectForm(false);
                        setKomentarAdmin("");
                      }}
                      disabled={isProcessing}
                    >
                      Batal
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}