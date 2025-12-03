"use client";

import { useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "lucide-react";
import PengajuanTable from "./p-table";

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

interface PengajuanClientProps {
  initialData: Pengajuan[];
}

export default function PengajuanClient({ initialData }: PengajuanClientProps) {
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const filteredData = useMemo(() => {
    return initialData.filter((item) => {
      // Filter by month
      if (selectedMonth !== "all") {
        const itemDate = new Date(item.createdAt);
        if (itemDate.getMonth() !== parseInt(selectedMonth)) {
          return false;
        }
      }

      // Filter by status
      if (selectedStatus !== "all" && item.status !== selectedStatus) {
        return false;
      }

      return true;
    });
  }, [initialData, selectedMonth, selectedStatus]);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Verifikasi Pengajuan</h1>
          <p className="mt-1 text-sm text-gray-500">
            Kelola dan verifikasi pengajuan ujian tugas akhir mahasiswa
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Bulan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Bulan</SelectItem>
                <SelectItem value="0">Januari</SelectItem>
                <SelectItem value="1">Februari</SelectItem>
                <SelectItem value="2">Maret</SelectItem>
                <SelectItem value="3">April</SelectItem>
                <SelectItem value="4">Mei</SelectItem>
                <SelectItem value="5">Juni</SelectItem>
                <SelectItem value="6">Juli</SelectItem>
                <SelectItem value="7">Agustus</SelectItem>
                <SelectItem value="8">September</SelectItem>
                <SelectItem value="9">Oktober</SelectItem>
                <SelectItem value="10">November</SelectItem>
                <SelectItem value="11">Desember</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="MENUNGGU_VERIFIKASI">
                Menunggu Verifikasi
              </SelectItem>
              <SelectItem value="DITERIMA">Diterima</SelectItem>
              <SelectItem value="DITOLAK">Ditolak</SelectItem>
              <SelectItem value="DIJADWALKAN">Dijadwalkan</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <PengajuanTable pengajuan={filteredData} />
    </div>
  );
}