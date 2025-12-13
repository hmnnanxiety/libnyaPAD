"use client";

import { useEffect, useState, useCallback } from "react";
import { detailJadwal, type DosenDJ, type MahasiswaDJ, type AdminDJ } from "@/lib/actions/detailJadwal/detailJadwal";
import DJAdminTable from "./dj-admintable";
import DJDosenTable from "./dj-dosentable";
import DJMhsTable from "./dj-mhstable";

interface DJClientProps {
  role: string;
}

export default function DJClient({ role }: DJClientProps) {
  const [data, setData] = useState<DosenDJ[] | MahasiswaDJ[] | AdminDJ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = useCallback(async (page: number) => {
    setLoading(true);
    setError(null);

    try {
      const filters = role === "ADMIN" ? { page, limit: 10 } : undefined;
      const result = await detailJadwal(filters);

      if (result.success && result.data) {
        setData(result.data);
        if (result.totalPages) {
          setTotalPages(result.totalPages);
        }
      } else {
        setError(result.error || "Gagal mengambil data");
      }
    } catch (err) {
      setError("Terjadi kesalahan saat mengambil data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage, fetchData]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-6 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  // Render tabel sesuai role
  if (role === "ADMIN") {
    return (
      <DJAdminTable
        data={data as AdminDJ[]}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    );
  }

  if (role === "DOSEN") {
    return (
      <DJDosenTable
        data={data as DosenDJ[]}
        loading={loading}
      />
    );
  }

  if (role === "MAHASISWA") {
    return (
      <DJMhsTable
        data={data as MahasiswaDJ[]}
        loading={loading}
      />
    );
  }

  return null;
}