// dj-admintable.tsx already has proper pagination implemented!
// No changes needed - it already uses the same style with:
// - ChevronLeft/ChevronRight buttons
// - Custom pagination logic (not shadcn Pagination)
// - 10 items per page
// - Ellipsis for collapsed pages

// However, let me update the pagination styling to match exactly:

"use client";

import Image from "next/image";
import { format, addHours } from "date-fns";
import { id } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AdminDJ } from "@/lib/actions/detailJadwal/getDetailsUjianForAll";

interface DJAdminTableProps {
  data: AdminDJ[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function DJAdminTable({
  data,
  loading,
  currentPage,
  totalPages,
  onPageChange,
}: DJAdminTableProps) {
  const formatDate = (date: Date | null) => {
    if (!date) return "-";
    return format(new Date(date), "dd MMMM yyyy", { locale: id });
  };

  const formatTime = (start: Date | null, end: Date | null) => {
    if (!start || !end) return "-";
    return `${format(addHours(new Date(start), 7), "HH:mm")} - ${format(
      addHours(new Date(end), 7),
      "HH:mm"
    )}`;
  };

  const formatProdi = (prodi: string | null) => {
    if (!prodi) return "-";
    return prodi.replace(/([A-Z])/g, " $1").trim();
  };

  const renderPagination = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("ellipsis");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("ellipsis");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("ellipsis");
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
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
                Pembimbing
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Penguji
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Tanggal & Jam
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Ruangan & Prodi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr>
              <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                Tidak ada data penjadwalan ditemukan
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
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
                Pembimbing
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Penguji
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Tanggal & Jam
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Ruangan & Prodi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((item) => (
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

                <td className="px-6 py-4">
                  <span className="text-sm text-gray-700">
                    {item.dosenPembimbing || "-"}
                  </span>
                </td>

                <td className="px-6 py-4">
                  {item.dosenPenguji.length > 0 ? (
                    <div className="space-y-1">
                      {item.dosenPenguji.slice(0, 2).map((penguji, idx) => (
                        <p key={idx} className="text-sm text-gray-700">
                          {penguji}
                        </p>
                      ))}
                      {item.dosenPenguji.length > 2 && (
                        <p className="text-xs text-gray-500">
                          +{item.dosenPenguji.length - 2} lainnya
                        </p>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">-</span>
                  )}
                </td>

                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-700">
                      {formatDate(item.tanggal)}
                    </p>
                    <p className="text-sm text-gray-700">
                      {formatTime(item.jamMulai, item.jamSelesai)}
                    </p>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-700">
                      {item.ruangan || "-"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatProdi(item.prodi)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Angkatan 20{item.angkatan || "-"}
                    </p>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Updated Pagination to match r-table.tsx style */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="h-9 w-9 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {renderPagination().map((page, idx) =>
            page === "ellipsis" ? (
              <span
                key={`ellipsis-${idx}`}
                className="flex h-9 w-9 items-center justify-center text-gray-600"
              >
                ...
              </span>
            ) : (
              <Button
                key={page}
                variant="ghost"
                size="icon"
                onClick={() => onPageChange(page as number)}
                className={`h-9 w-9 ${
                  page === currentPage
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
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="h-9 w-9 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}