"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PengajuanModalVerify } from "./p-modal";

interface Pengajuan {
  id: string;
  judul: string;
  berkasUrl: string;
  status: string;
  createdAt: Date;
  tanggalUjian: Date | null;
  mahasiswa: {
    id: string;
    name: string | null;
    nim: string | null;
    prodi: string | null;
    image: string | null;
  };
  dosenPembimbing: {
    id: string;
    name: string | null;
  };
}

interface PengajuanTableProps {
  pengajuan: Pengajuan[];
}

const ITEMS_PER_PAGE = 10;

export default function PengajuanTable({ pengajuan }: PengajuanTableProps) {
  const [selectedPengajuanId, setSelectedPengajuanId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(pengajuan.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedPengajuan = pengajuan.slice(startIndex, endIndex);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      MENUNGGU_VERIFIKASI: {
        label: "Menunggu Verifikasi",
        className: "bg-yellow-100 text-yellow-700",
      },
      DITERIMA: {
        label: "Diterima",
        className: "bg-blue-100 text-blue-700",
      },
      DITOLAK: {
        label: "Ditolak",
        className: "bg-red-100 text-red-700",
      },
      DIJADWALKAN: {
        label: "Dijadwalkan",
        className: "bg-green-100 text-green-700",
      },
    };

    const statusInfo = statusMap[status] || {
      label: status,
      className: "bg-gray-100 text-gray-700",
    };

    return <Badge className={statusInfo.className}>{statusInfo.label}</Badge>;
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
    <>
      <div className="space-y-4">
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="w-full">
            <thead className="bg-blue-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Nama Mahasiswa
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Judul Tugas Akhir
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Tanggal Pengajuan
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Status Pengajuan
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedPengajuan.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Tidak ada data pengajuan
                  </td>
                </tr>
              ) : (
                paginatedPengajuan.map((item) => (
                  <tr key={item.id} className="transition-colors hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 rounded-full">
                          <AvatarImage
                            src={item.mahasiswa.image || ""}
                            alt={item.mahasiswa.name || ""}
                          />
                          <AvatarFallback className="rounded-full bg-blue-100 text-blue-600">
                            {item.mahasiswa.name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase() || "M"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900">
                            {item.mahasiswa.name || "Nama tidak tersedia"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {item.mahasiswa.nim || "-"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {item.judul}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {formatDate(item.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                          onClick={() => setSelectedPengajuanId(item.id)}
                        >
                          Detail
                        </Button>
                      </div>
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

      {selectedPengajuanId && (
        <PengajuanModalVerify
          pengajuanId={selectedPengajuanId}
          onClose={() => setSelectedPengajuanId(null)}
        />
      )}
    </>
  );
}