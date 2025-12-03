"use client";

import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import DpTable from "./rnl-table";
import { getAdminJadwal, type AdminJadwalData } from "@/lib/actions/detailJadwal/adminJadwal";

export default function DaftarPenjadwalanClient() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AdminJadwalData[]>([]);
  const [filteredData, setFilteredData] = useState<AdminJadwalData[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await getAdminJadwal();
      setData(result.success && result.data ? result.data : []);
    } catch {
      setData([]);
    }
    setLoading(false);
  };

  // Apply filters
  useEffect(() => {
    let filtered = [...data];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.namaMahasiswa?.toLowerCase().includes(q) ||
          item.nim?.toLowerCase().includes(q) ||
          item.judulTugasAkhir?.toLowerCase().includes(q)
      );
    }

    setFilteredData(filtered);
    setCurrentPage(1); // Reset ke halaman 1 setiap filter berubah
  }, [data, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const clearSearch = () => setSearchQuery("");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Riwayat dan Laporan</h1>

        {/* Search Bar */}
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama, NIM, atau judul TA..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-10 text-sm focus:ring-2 focus:ring-blue-500/20"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Empty Search Result */}
      {!loading && searchQuery && filteredData.length === 0 && (
        <div className="rounded-md border p-8 text-center">
          <p className="text-gray-500">Tidak ada hasil ditemukan</p>
        </div>
      )}

      {/* Table */}
      {(!searchQuery || filteredData.length > 0) && (
        <DpTable
          data={paginatedData}
          loading={loading}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
