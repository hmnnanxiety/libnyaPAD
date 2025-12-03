"use client";

import Image from "next/image";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AdminJadwalData } from "@/lib/actions/detailJadwal/adminJadwal";

interface DpTableProps {
  data: AdminJadwalData[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function DpTable({ 
  data, 
  loading, 
  currentPage, 
  totalPages, 
  onPageChange 

}: DpTableProps) {
  const formatDate = (date: Date | null) => {
    if (!date) return "-";
    return format(new Date(date), "dd MMMM yyyy", { locale: id });
  };

  const formatTime = (start: Date | null, end: Date | null) => {
    if (!start || !end) return "-";
    return `${format(new Date(start), "HH:mm")} - ${format(new Date(end), "HH:mm")}`;
  };

  const formatProdi = (prodi: string | null) => {
    if (!prodi) return "-";
    return prodi.replace(/([A-Z])/g, " $1").trim();
  };

  const handlePageChange = (page: number) => {
    onPageChange(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getPageNumbers = () => {
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
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-lg border p-4"
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
      <div className="rounded-lg bg-white p-12 text-center shadow">
        <p className="text-gray-500">Tidak ada data penjadwalan ditemukan</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table View (1280px+) */}
      <div className="hidden xl:block">
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="w-full">
            <thead className="bg-blue-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Mahasiswa
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Judul TA
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Dosen
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Tanggal
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Jam & Ruangan
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Prodi & Angkatan
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.map(item => (
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
                          <div className="flex h-full items-center justify-center text-sm font-medium text-gray-600">
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
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-900">
                        {item.dosenPembimbing || "-"}
                      </p>
                      {item.dosenPenguji.length > 0 && (
                        <p className="text-xs text-gray-600">
                          Penguji: {item.dosenPenguji.slice(0, 2).join(", ")}
                          {item.dosenPenguji.length > 2 && ` +${item.dosenPenguji.length - 2}`}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {formatDate(item.tanggal)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-700">
                        {formatTime(item.jamMulai, item.jamSelesai)}
                      </p>
                      <p className="text-xs text-gray-600">
                        {item.ruangan || "-"}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <p className="text-xs text-gray-600">
                        {formatProdi(item.prodi)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Angkatan {item.angkatan ? "20" + item.angkatan : "-"}
                      </p>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Large Tablet/Desktop Layout (1024px - 1279px) */}
      <div className="hidden lg:block xl:hidden">
        <div className="space-y-3">
          {data.map(item => (
            <div
              key={item.id}
              className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
            >
              <div className="grid grid-cols-2 gap-4">
                {/* Left Column */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-gray-200">
                      {item.foto ? (
                        <Image
                          src={item.foto}
                          alt={item.namaMahasiswa || "Mahasiswa"}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm font-medium text-gray-600">
                          {item.namaMahasiswa?.charAt(0) || "M"}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-gray-900">
                        {item.namaMahasiswa || "-"}
                      </p>
                      <p className="truncate text-sm text-gray-500">
                        {item.nim || "-"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-500">Judul Tugas Akhir</p>
                    <p className="mt-1 line-clamp-2 text-sm text-gray-900">
                      {item.judulTugasAkhir || "-"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700">
                      {formatProdi(item.prodi)}
                    </span>
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                      Angkatan {item.angkatan ? "20" + item.angkatan : "-"}
                    </span>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-3">
                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-xs font-medium text-gray-500">Jadwal</p>
                    <p className="mt-1 text-sm font-medium text-gray-900">
                      {formatDate(item.tanggal)}
                    </p>
                    <p className="mt-0.5 text-sm text-gray-700">
                      {formatTime(item.jamMulai, item.jamSelesai)}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-600">
                      {item.ruangan || "-"}
                    </p>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-xs font-medium text-gray-500">Dosen Pembimbing</p>
                    <p className="mt-1 text-sm text-gray-900">
                      {item.dosenPembimbing || "-"}
                    </p>
                    
                    {item.dosenPenguji.length > 0 && (
                      <>
                        <p className="mt-2 text-xs font-medium text-gray-500">Dosen Penguji</p>
                        <p className="mt-1 text-sm text-gray-900">
                          {item.dosenPenguji.join(", ")}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tablet Layout (768px - 1023px) */}
      <div className="hidden md:block lg:hidden">
        <div className="space-y-3">
          {data.map(item => (
            <div
              key={item.id}
              className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition hover:shadow-md"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-gray-200">
                      {item.foto ? (
                        <Image
                          src={item.foto}
                          alt={item.namaMahasiswa || "Mahasiswa"}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs font-medium text-gray-600">
                          {item.namaMahasiswa?.charAt(0) || "M"}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {item.namaMahasiswa || "-"}
                      </p>
                      <p className="truncate text-xs text-gray-500">
                        {item.nim || "-"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                      {formatProdi(item.prodi)}
                    </span>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                      {item.angkatan || "-"}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-500">Judul TA</p>
                    <p className="mt-1 line-clamp-2 text-xs text-gray-900">
                      {item.judulTugasAkhir || "-"}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="rounded-lg bg-gray-50 p-2">
                    <p className="text-xs font-medium text-gray-900">
                      {formatDate(item.tanggal)}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-700">
                      {formatTime(item.jamMulai, item.jamSelesai)}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-600">
                      {item.ruangan || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-500">Pembimbing</p>
                    <p className="mt-1 text-xs text-gray-900">
                      {item.dosenPembimbing || "-"}
                    </p>
                    
                    {item.dosenPenguji.length > 0 && (
                      <>
                        <p className="mt-1.5 text-xs font-medium text-gray-500">Penguji</p>
                        <p className="mt-0.5 text-xs text-gray-900">
                          {item.dosenPenguji.slice(0, 2).join(", ")}
                          {item.dosenPenguji.length > 2 && ` +${item.dosenPenguji.length - 2}`}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Layout (< 768px) */}
      <div className="block md:hidden">
        <div className="space-y-3">
          {data.map(item => (
            <div
              key={item.id}
              className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition hover:shadow-md"
            >
              <div className="space-y-3">
                {/* Header: Mahasiswa Info */}
                <div className="flex items-start gap-2.5">
                  <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-gray-200 sm:h-14 sm:w-14">
                    {item.foto ? (
                      <Image
                        src={item.foto}
                        alt={item.namaMahasiswa || "Mahasiswa"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm font-medium text-gray-600 sm:text-base">
                        {item.namaMahasiswa?.charAt(0) || "M"}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold text-gray-900 sm:text-base">
                      {item.namaMahasiswa || "-"}
                    </h3>
                    <p className="truncate text-xs text-gray-500 sm:text-sm">
                      {item.nim || "-"}
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700 sm:text-xs">
                        {formatProdi(item.prodi)}
                      </span>
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-700 sm:text-xs">
                        Angkatan {item.angkatan || "-"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Judul TA */}
                <div className="rounded-lg bg-blue-50/50 p-2.5 sm:p-3">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-gray-500 sm:text-xs">
                    Judul Tugas Akhir
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-gray-900 sm:text-sm">
                    {item.judulTugasAkhir || "-"}
                  </p>
                </div>

                {/* Schedule Info Grid */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div className="rounded-lg bg-gray-50 p-2 sm:p-2.5">
                    <p className="text-[10px] font-medium text-gray-500 sm:text-xs">Tanggal</p>
                    <p className="mt-1 text-xs font-medium text-gray-900 sm:text-sm">
                      {formatDate(item.tanggal)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-2 sm:p-2.5">
                    <p className="text-[10px] font-medium text-gray-500 sm:text-xs">Waktu</p>
                    <p className="mt-1 text-xs font-medium text-gray-900 sm:text-sm">
                      {formatTime(item.jamMulai, item.jamSelesai)}
                    </p>
                  </div>
                </div>

                {/* Ruangan */}
                <div className="rounded-lg bg-gray-50 p-2 sm:p-2.5">
                  <p className="text-[10px] font-medium text-gray-500 sm:text-xs">Ruangan</p>
                  <p className="mt-1 text-xs font-medium text-gray-900 sm:text-sm">
                    {item.ruangan || "-"}
                  </p>
                </div>

                {/* Dosen */}
                <div className="space-y-2">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wide text-gray-500 sm:text-xs">
                      Dosen Pembimbing
                    </p>
                    <p className="mt-1 text-xs text-gray-900 sm:text-sm">
                      {item.dosenPembimbing || "-"}
                    </p>
                  </div>
                  
                  {item.dosenPenguji.length > 0 && (
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wide text-gray-500 sm:text-xs">
                        Dosen Penguji
                      </p>
                      <p className="mt-1 text-xs text-gray-900 sm:text-sm">
                        {item.dosenPenguji.join(", ")}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination - Consistent Style */}
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

          {getPageNumbers().map((page, idx) =>
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
                onClick={() => handlePageChange(page as number)}
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
            onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
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