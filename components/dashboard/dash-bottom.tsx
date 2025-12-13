"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Eye, ChevronLeft, ChevronRight } from "lucide-react";
import BAModal from "@/components/berita-acara/ba-modal";

interface AdminExamItem {
  id: string;
  namaMahasiswa: string | null;
  nim: string | null;
  foto: string | null;
  judulTugasAkhir: string | null;
  tanggal: Date | null;
  jamMulai: Date | null;
  jamSelesai: Date | null;
  ruangan: string | null;
  dosenPembimbing: string | null;
  dosenPenguji: string[];
  prodi: string | null;
  angkatan: string | null;
  dosenPenguji1: string | null;
  dosenPenguji2: string | null;
}

interface DosenExamItem {
  id: string;
  namaMahasiswa: string | null;
  nim: string | null;
  foto: string | null;
  judul: string | null;
  tanggal: Date | null;
  jamMulai: Date | null;
  jamSelesai: Date | null;
  ruangan: string | null;
  isDosenPembimbing: boolean;
  prodi: string | null;
  angkatan: string | null;
}

interface MahasiswaExamItem {
  id: string;
  judul: string | null;
  tanggal: Date | null;
  jamMulai: Date | null;
  jamSelesai: Date | null;
  ruangan: string | null;
}

interface BottomData {
  data?: (AdminExamItem | DosenExamItem | MahasiswaExamItem)[];
}

interface BottomSectionProps {
  role: string;
  bottomData: BottomData;
}

export function BottomSection({ role, bottomData }: BottomSectionProps) {
  if (role === "ADMIN") {
    return <AdminBottomSection bottomData={bottomData} />;
  } else if (role === "DOSEN") {
    return <DosenBottomSection bottomData={bottomData} />;
  } else if (role === "MAHASISWA") {
    return <MahasiswaBottomSection bottomData={bottomData} />;
  }
  return null;
}

// Helper functions
const formatDate = (date: Date | null) => {
  if (!date) return "-";
  try {
    return format(new Date(date), "dd MMMM yyyy", { locale: id });
  } catch {
    return "-";
  }
};

const formatTime = (start: Date | string | null, end: Date | string | null) => {
  if (!start || !end) return "-";
  try {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${format(startDate, "HH:mm")} - ${format(endDate, "HH:mm")}`;
  } catch {
    return "-";
  }
};

// const formatProdi = (prodi: string | null) => {
//   if (!prodi) return "-";
//   return prodi.replace(/([A-Z])/g, " $1").trim();
// };

const ITEMS_PER_PAGE = 5;

// Admin View
function AdminBottomSection({ bottomData }: { bottomData: BottomData }) {
  const [currentPage, setCurrentPage] = useState(1);
  const examData = (bottomData?.data || []) as AdminExamItem[];
  
  const totalPages = Math.ceil(examData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const displayData = examData.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
    <Card className="border-none shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Detail Jadwal Ujian
          </CardTitle>
          <Link href="/daftar-penjadwalan">
            <Button variant="link" className="text-blue-600">
              Lihat Semua
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-blue-50">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Nama Mahasiswa
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Tanggal Ujian
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Ruang Ujian
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Dosen Pembimbing
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Penguji 1
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Penguji 2
                </th>
              </tr>
            </thead>
            <tbody>
              {displayData.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    Tidak ada jadwal ujian
                  </td>
                </tr>
              ) : (
                displayData.map((item: AdminExamItem) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-full bg-gray-200">
                          <AvatarImage src={item.foto || ""} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-400 to-cyan-400 text-white">
                            {item.namaMahasiswa?.[0] || "M"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">
                            {item.namaMahasiswa || "-"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.nim || "-"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {formatDate(item.tanggal)}
                    </td>
                    <td className="px-4 py-3 text-sm">{item.ruangan || "-"}</td>
                    <td className="px-4 py-3 text-sm">
                      {item.dosenPembimbing || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {item.dosenPenguji1 || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {item.dosenPenguji2 || "-"}
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
      </CardContent>
    </Card>
  );
}

// Dosen View
function DosenBottomSection({ bottomData }: { bottomData: BottomData }) {
  const [selectedUjianId, setSelectedUjianId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const examData = (bottomData?.data || []) as DosenExamItem[];
  
  const totalPages = Math.ceil(examData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const displayData = examData.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              Detail Jadwal
            </CardTitle>
            <Link href="/detail-jadwal">
              <Button variant="link" className="text-blue-600">
                Lihat Semua
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-blue-50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    Nama Mahasiswa
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    Judul Tugas Akhir
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    Tanggal
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    Jam Ujian
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    Ruangan
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    Peran
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      Tidak ada jadwal ujian
                    </td>
                  </tr>
                ) : (
                  displayData.map((item: DosenExamItem) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-full bg-gray-200">
                            <AvatarImage src={item.foto || ""} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-400 to-cyan-400 text-white">
                              {item.namaMahasiswa?.[0] || "M"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">
                              {item.namaMahasiswa || "-"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {item.nim || "-"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm max-w-xs truncate">
                        {item.judul || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {formatDate(item.tanggal)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {formatTime(item.jamMulai, item.jamSelesai)}
                      </td>
                      <td className="px-4 py-3 text-sm">{item.ruangan || "-"}</td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className={
                            item.isDosenPembimbing
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-purple-50 text-purple-700 border-purple-200"
                          }
                        >
                          {item.isDosenPembimbing ? "Pembimbing" : "Penguji"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedUjianId(item.id)}
                          className="text-blue-600"
                        >
                          Detail
                        </Button>
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
        </CardContent>
      </Card>

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

// Mahasiswa View
function MahasiswaBottomSection({ bottomData }: { bottomData: BottomData }) {
  const [selectedUjianId, setSelectedUjianId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const examData = (bottomData?.data || []) as MahasiswaExamItem[];
  
  const totalPages = Math.ceil(examData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const displayData = examData.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              Detail Jadwal
            </CardTitle>
            <Link href="/detail-jadwal">
              <Button variant="link" className="text-blue-600">
                Lihat Semua
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-blue-50">
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">
                    No
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    Judul Tugas Akhir
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    Tanggal Ujian
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    Jam Ujian
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    Ruangan Ujian
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      Belum ada jadwal ujian
                    </td>
                  </tr>
                ) : (
                  displayData.map((item: MahasiswaExamItem, index: number) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 text-center">
                        <span className="font-medium text-gray-900">
                          {startIndex + index + 1}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm max-w-md">
                        <span className="line-clamp-2">
                          {item.judul || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {formatDate(item.tanggal)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {formatTime(item.jamMulai, item.jamSelesai)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {item.ruangan || "-"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedUjianId(item.id)}
                            className="h-8 w-8 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                            title="Lihat Detail"
                          >
                            <Eye className="h-4 w-4" />
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
        </CardContent>
      </Card>

      {selectedUjianId && (
        <BAModal
          ujianId={selectedUjianId}
          userRole="MAHASISWA"
          onClose={() => setSelectedUjianId(null)}
        />
      )}
    </>
  );
}