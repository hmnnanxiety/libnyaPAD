// src/components/dashboard/dash-pengajuan.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { PengajuanModalVerify } from "@/components/pengajuan/p-modal";

interface Mahasiswa {
  name?: string;
  nim?: string;
  image?: string;
}

interface PengajuanItem {
  id: string;
  mahasiswa?: Mahasiswa;
  judul?: string;
  createdAt: Date;
  status: string;
}

interface PengajuanData {
  data?: PengajuanItem[];
}

interface PengajuanSectionProps {
  pengajuanData: PengajuanData;
}

export function PengajuanSection({ pengajuanData }: PengajuanSectionProps) {
  const [selectedPengajuanId, setSelectedPengajuanId] = useState<string | null>(
    null
  );
  const pengajuanList = pengajuanData?.data || [];

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
        className: "bg-yellow-100 text-yellow-700 border-yellow-200",
      },
      DITERIMA: {
        label: "Diterima",
        className: "bg-blue-100 text-blue-700 border-blue-200",
      },
      DITOLAK: {
        label: "Ditolak",
        className: "bg-red-100 text-red-700 border-red-200",
      },
      DIJADWALKAN: {
        label: "Dijadwalkan",
        className: "bg-green-100 text-green-700 border-green-200",
      },
    };

    const statusInfo = statusMap[status] || {
      label: status,
      className: "bg-gray-100 text-gray-700 border-gray-200",
    };

    return (
      <Badge variant="outline" className={statusInfo.className}>
        {statusInfo.label}
      </Badge>
    );
  };

  return (
    <>
      <Card className="border-none shadow-sm h-full flex flex-col overflow-hidden">
        <CardHeader className="pb-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              Pengajuan Terbaru
            </CardTitle>
            <Link href="/pengajuan">
              <Button variant="link" className="text-blue-600">
                Lihat Semua
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto pr-2">
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
            <table className="w-full">
              <thead className="sticky top-0 bg-white z-10">
                <tr className="border-b bg-blue-50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    Nama Mahasiswa
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    Judul Tugas Akhir
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    Tanggal Pengajuan
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    Status
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {pengajuanList.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      Tidak ada pengajuan
                    </td>
                  </tr>
                ) : (
                  pengajuanList.map((item: PengajuanItem) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-full bg-gray-200">
                            <AvatarImage src={item.mahasiswa?.image || ""} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-400 to-cyan-400 text-white">
                              {item.mahasiswa?.name
                                ?.split(" ")
                                .map((n: string) => n[0])
                                .join("")
                                .toUpperCase() || "M"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">
                              {item.mahasiswa?.name || "N/A"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {item.mahasiswa?.nim || "-"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm max-w-xs truncate">
                        {item.judul || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {formatDate(item.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600"
                          onClick={() => setSelectedPengajuanId(item.id)}
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
        </CardContent>
      </Card>

      {/* Modal for verification */}
      {selectedPengajuanId && (
        <PengajuanModalVerify
          pengajuanId={selectedPengajuanId}
          onClose={() => setSelectedPengajuanId(null)}
        />
      )}
    </>
  );
}