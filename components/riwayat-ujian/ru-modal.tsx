"use client";

import { useEffect, useState } from "react";

interface DetailUjianModalProps {
  ujianId: string;
  onClose: () => void;
}

interface UjianDetail {
  jenisUjian: string;
  tanggalUjian: string;
  waktuUjian: string;
  ruangUjian: string;
  dosenPembimbing1: string;
  dosenPembimbing2: string;
  dosenPenguji: string;
  catatan: string;
}

export default function DetailUjianModal({ ujianId, onClose }: DetailUjianModalProps) {
  const [detail, setDetail] = useState<UjianDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Add escape key listener
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  useEffect(() => {
    fetchDetailUjian();
  }, [ujianId]);

  const fetchDetailUjian = async () => {
    setLoading(true);
    try {
      // TODO: Create server action to fetch detailed ujian data
      // For now, using mock data
      setTimeout(() => {
        setDetail({
          jenisUjian: "Seminar Akhir",
          tanggalUjian: "20 September 2025",
          waktuUjian: "09:00 - 11:00 WIB",
          ruangUjian: "Ruang B-203",
          dosenPembimbing1: "Dr. Ir. Budi Santoso",
          dosenPembimbing2: "Budi Eko, M.Kom.",
          dosenPenguji: "Dr. Wijaya, S.T., M.Eng.",
          catatan: "Silakan hadir 15 menit sebelum ujian dimulai dan membawa dokumen cetak.",
        });
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error("Error fetching ujian detail:", error);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Detail Jadwal Ujian</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="py-12 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              <p className="mt-4 text-gray-600">Memuat detail...</p>
            </div>
          ) : detail ? (
            <div className="space-y-6">
              {/* Jenis Ujian */}
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Jenis Ujian
                </label>
                <p className="text-base text-gray-900 font-semibold">{detail.jenisUjian}</p>
              </div>

              {/* Row 1: Tanggal & Waktu */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Tanggal Ujian
                  </label>
                  <p className="text-base text-gray-900">{detail.tanggalUjian}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Waktu Ujian
                  </label>
                  <p className="text-base text-gray-900">{detail.waktuUjian}</p>
                </div>
              </div>

              {/* Ruang Ujian */}
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Ruang Ujian
                </label>
                <p className="text-base text-gray-900">{detail.ruangUjian}</p>
              </div>

              {/* Row 2: Pembimbing 1 & 2 */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Dosen Pembimbing 1
                  </label>
                  <p className="text-base text-gray-900">{detail.dosenPembimbing1}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Dosen Pembimbing 2
                  </label>
                  <p className="text-base text-gray-900">{detail.dosenPembimbing2}</p>
                </div>
              </div>

              {/* Dosen Penguji */}
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Dosen Penguji
                </label>
                <p className="text-base text-gray-900">{detail.dosenPenguji}</p>
              </div>

              {/* Catatan */}
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Catatan
                </label>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-base text-gray-700">{detail.catatan}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-gray-500">
              <p>Data tidak ditemukan</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}