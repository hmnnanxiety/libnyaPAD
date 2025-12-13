import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

interface Ruangan {
  id: string;
  nama: string;
  deskripsi: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface RuanganTableProps {
  ruanganList: Ruangan[];
  onEdit: (ruangan: Ruangan) => void;
  onDelete: (id: string) => void;
  isPending: boolean;
}

const ITEMS_PER_PAGE = 10;

export function RuanganTable({
  ruanganList,
  onEdit,
  onDelete,
  isPending,
}: RuanganTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(ruanganList.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedRuangan = ruanganList.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getPageNumbers = () => {
    const pages = [];
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

  if (ruanganList.length === 0) {
    return (
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="px-6 py-4 text-sm font-semibold text-gray-700">
                Nama Ruangan
              </TableHead>
              <TableHead className="px-6 py-4 text-sm font-semibold text-gray-700">
                Deskripsi
              </TableHead>
              <TableHead className="px-6 py-4 text-sm font-semibold text-gray-700">
                Dibuat
              </TableHead>
              <TableHead className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={4} className="px-6 py-8 text-center text-gray-500">
                Belum ada ruangan. Klik Tambah Ruangan untuk menambahkan ruangan baru
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-blue-50">
            <TableRow>
              <TableHead className="px-6 py-4 text-sm font-semibold text-gray-700">
                Nama Ruangan
              </TableHead>
              <TableHead className="px-6 py-4 text-sm font-semibold text-gray-700">
                Deskripsi
              </TableHead>
              <TableHead className="px-6 py-4 text-sm font-semibold text-gray-700">
                Dibuat
              </TableHead>
              <TableHead className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedRuangan.map((ruangan) => (
              <TableRow
                key={ruangan.id}
                className="transition-colors hover:bg-gray-50"
              >
                <TableCell className="px-6 py-4">
                  <span className="font-medium text-gray-900">
                    {ruangan.nama}
                  </span>
                </TableCell>
                <TableCell className="px-6 py-4">
                  <span className="text-sm text-gray-700">
                    {ruangan.deskripsi || "-"}
                  </span>
                </TableCell>
                <TableCell className="px-6 py-4">
                  <span className="text-sm text-gray-700">
                    {new Date(ruangan.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </TableCell>
                <TableCell className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(ruangan)}
                      disabled={isPending}
                      className="h-8 w-8 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(ruangan.id)}
                      disabled={isPending}
                      className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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