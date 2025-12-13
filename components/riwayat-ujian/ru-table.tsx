"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface RiwayatUjianData {
  id: string;
  namaMahasiswa: string | null;
  nim: string | null;
  foto: string | null;
  judulTugasAkhir: string | null;
  tanggal: string | null;
  isDosenPembimbing: boolean;
  completed: boolean;
}

interface RiwayatUjianTableProps {
  data: RiwayatUjianData[];
}

const ITEMS_PER_PAGE = 10;

export function RiwayatUjianTable({ data }: RiwayatUjianTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedData = data.slice(startIndex, endIndex);

  const formatTanggal = (tanggal: string | null) => {
    if (!tanggal) return "-";
    const date = new Date(tanggal);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getPeran = (isDosenPembimbing: boolean) => {
    return isDosenPembimbing ? "Pembimbing" : "Penguji";
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

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="w-full">
          <thead className="bg-[#EEF7FF]">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Nama Mahasiswa
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Judul Tugas Akhir
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Tanggal Ujian
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Peran
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  Belum ada riwayat ujian.
                </td>
              </tr>
            ) : (
              paginatedData.map((item) => (
                <tr
                  key={item.id}
                  className="transition-colors hover:bg-gray-50"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 rounded-full">
                        <AvatarImage
                          src={item.foto || ""}
                          alt={item.namaMahasiswa || ""}
                        />
                        <AvatarFallback className="rounded-full bg-blue-100 text-blue-600">
                          {item.namaMahasiswa?.charAt(0).toUpperCase() || "M"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900">
                          {item.namaMahasiswa || "Nama tidak tersedia"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {item.nim || "-"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {item.judulTugasAkhir || "-"}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {formatTanggal(item.tanggal)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                        item.isDosenPembimbing
                          ? "bg-blue-100 text-blue-700"
                          : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {getPeran(item.isDosenPembimbing)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {item.completed ? (
                      <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                        Selesai
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                        Dijadwalkan
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1">
          {/* Previous Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="h-9 w-9 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Page Numbers */}
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

          {/* Next Button */}
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
  );
}