"use client";

import { useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DosenDJ } from "@/lib/actions/detailJadwal/getDetailsUjianForAll";
import BAModal from "@/components/berita-acara/ba-modal";
import { toZonedTime, format as formatTz } from "date-fns-tz";

interface DJDosenTableProps {
  data: DosenDJ[];
  loading: boolean;
}

const ITEMS_PER_PAGE = 10;

export default function DJDosenTable({ data, loading }: DJDosenTableProps) {
  const [selectedUjianId, setSelectedUjianId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedData = data.slice(startIndex, endIndex);

  const formatDate = (date: Date | null) => {
    if (!date) return "-";
    return format(new Date(date), "dd MMMM yyyy", { locale: id });
  };

  const formatTime = (
    start: Date | string | null,
    end: Date | string | null
  ) => {
    if (!start || !end) return "-";

    const timeZone = "Asia/Jakarta";

    const startDate = toZonedTime(new Date(start), timeZone);
    const endDate = toZonedTime(new Date(end), timeZone);

    return `${formatTz(startDate, "HH:mm", { timeZone })} - ${formatTz(
      endDate,
      "HH:mm",
      { timeZone }
    )}`;
  };

  const formatProdi = (prodi: string | null) => {
    if (!prodi) return "-";
    return prodi.replace(/([A-Z])/g, " $1").trim();
  };

  const getPeranLabel = (isPembimbing: boolean) => {
    return isPembimbing ? "Pembimbing" : "Penguji";
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("ellipsis");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("ellipsis");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (loading) {
    return (
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="animate-pulse p-6">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="mb-4 flex items-center gap-4 rounded-lg border p-4"
            >
              <div className="h-12 w-12 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 rounded bg-gray-200" />
                <div className="h-3 w-1/2 rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="w-full">
          <thead className="border-b bg-blue-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Mahasiswa
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Judul TA
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Tanggal
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Jam & Ruangan
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Peran & Prodi
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr>
              <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                Tidak ada jadwal ujian ditemukan
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="w-full">
            <thead className="border-b bg-blue-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Mahasiswa
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Judul TA
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Tanggal
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Jam & Ruangan
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Peran & Prodi
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedData.map((item) => (
                <tr key={item.id} className="transition-colors hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-gray-200">
                        {item.foto ? (
                          <Image
                            src={item.foto}
                            alt={item.namaMahasiswa || "Mahasiswa"}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-blue-100 text-sm font-medium text-blue-600">
                            {item.namaMahasiswa?.charAt(0) || "M"}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {item.namaMahasiswa || "-"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {item.nim || "-"}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-700 line-clamp-2">
                      {item.judulTugasAkhir || "-"}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-700">
                    {formatDate(item.tanggal)}
                  </td>

                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-700">
                        {formatTime(item.jamMulai, item.jamSelesai)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {item.ruangan || "-"}
                      </p>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <p
                        className={`text-sm font-medium ${
                          item.isDosenPembimbing
                            ? "text-blue-600"
                            : "text-green-600"
                        }`}
                      >
                        {getPeranLabel(item.isDosenPembimbing)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatProdi(item.prodi)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Angkatan {"20" + item.angkatan || "-"}
                      </p>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedUjianId(item.id)}
                        className="h-8 w-8 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                        title="Lihat Berita Acara"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-9 w-9 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {getPageNumbers().map((page, index) =>
              page === "ellipsis" ? (
                <span
                  key={`ellipsis-${index}`}
                  className="flex h-9 w-9 items-center justify-center text-gray-600"
                >
                  ...
                </span>
              ) : (
                <Button
                  key={page}
                  variant="ghost"
                  size="icon"
                  onClick={() => handlePageChange(page as number)}
                  className={`h-9 w-9 ${
                    currentPage === page
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {page}
                </Button>
              )
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                currentPage < totalPages && handlePageChange(currentPage + 1)
              }
              disabled={currentPage === totalPages}
              className="h-9 w-9 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {selectedUjianId && (
        <BAModal
          ujianId={selectedUjianId}
          userRole="DOSEN"
          onClose={() => setSelectedUjianId(null)}
        />
      )}
    </>
  );
}