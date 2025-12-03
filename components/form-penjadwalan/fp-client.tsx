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
import PenjadwalanTable from "./fp-table";

interface Pengajuan {
  id: string;
  judul: string;
  berkasUrl: string;
  status: string;
  createdAt: Date;
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

interface PenjadwalanClientProps {
  initialData: Pengajuan[];
}

export default function PenjadwalanClient({
  initialData,
}: PenjadwalanClientProps) {
  const [selectedMonth, setSelectedMonth] = useState("all");

  const filteredData = useMemo(() => {
    return initialData.filter((item) => {
      if (selectedMonth !== "all") {
        const itemDate = new Date(item.createdAt);
        if (itemDate.getMonth() !== parseInt(selectedMonth)) {
          return false;
        }
      }

      return true;
    });
  }, [initialData, selectedMonth]);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Form Penjadwalan</h1>
          <p className="mt-1 text-sm text-gray-500">
            Jadwalkan ujian tugas akhir untuk mahasiswa yang sudah diverifikasi
          </p>
        </div>

        {/* Filter Bar */}
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
      </div>

      {/* Table */}
      <PenjadwalanTable pengajuan={filteredData} />
    </div>
  );
}