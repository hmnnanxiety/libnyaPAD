"use client";

import { useState } from "react";
import { format, addHours } from "date-fns";
import { id } from "date-fns/locale";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MahasiswaDJ } from "@/lib/actions/detailJadwal/getDetailsUjianForAll";
import BAModal from "@/components/berita-acara/ba-modal";

interface DJMhsTableProps {
  data: MahasiswaDJ[];
  loading: boolean;
}

export default function DJMhsTable({ data, loading }: DJMhsTableProps) {
  const [selectedUjianId, setSelectedUjianId] = useState<string | null>(null);

  const formatDate = (date: Date | null) => {
    if (!date) return "-";
    return format(new Date(date), "dd MMMM yyyy", { locale: id });
  };

  const formatTime = (start: Date | null, end: Date | null) => {
    if (!start || !end) return "-";
    return `${format(addHours(new Date(start), 7), "HH:mm")} - ${format(
      addHours(new Date(end), 7),
      "HH:mm"
    )} WIB`;
  };

  if (loading) {
    return (
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="animate-pulse p-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="mb-4 rounded-lg border p-4">
              <div className="space-y-2">
                <div className="h-4 w-2/3 rounded bg-gray-200" />
                <div className="h-3 w-1/3 rounded bg-gray-200" />
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
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                No
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Judul Tugas Akhir
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Tanggal Ujian
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Jam Ujian
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Ruangan Ujian
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr>
              <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                Tidak ada jadwal ujian Anda saat ini
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="w-full">
          <thead className="border-b bg-blue-50">
            <tr>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                No
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Judul Tugas Akhir
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Tanggal Ujian
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Jam Ujian
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Ruangan Ujian
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((item, idx) => (
              <tr key={item.id} className="transition-colors hover:bg-gray-50">
                <td className="px-6 py-4 text-center">
                  <span className="font-medium text-gray-900">
                    {idx + 1}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <span className="text-sm text-gray-700 line-clamp-2">
                    {item.judul || "-"}
                  </span>
                </td>

                <td className="px-6 py-4 text-sm text-gray-700">
                  {formatDate(item.tanggal)}
                </td>

                <td className="px-6 py-4 text-sm text-gray-700">
                  {formatTime(item.jamMulai, item.jamSelesai)}
                </td>

                <td className="px-6 py-4 text-sm text-gray-700">
                  {item.ruangan || "-"}
                </td>

                <td className="px-6 py-4">
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
            ))}
          </tbody>
        </table>
      </div>

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