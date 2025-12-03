"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export interface AdminJadwalData {
  id: string;
  namaMahasiswa: string | null;
  nim: string | null;
  foto: string | null;
  judulTugasAkhir: string | null;
  tanggal: Date | null;
  jamMulai: Date | null;
  jamSelesai: Date | null;
  ruangan: string | null;
  prodi: string | null;
  angkatan: string | null;
  dosenPembimbing: string | null;
  dosenPenguji: string[];
}

interface FilterOptions {
  startDate?: Date;
  endDate?: Date;
  prodi?: string;
  angkatan?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export async function getAdminJadwal(filters?: FilterOptions) {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false as const,
      error: "Anda harus login untuk mengakses halaman ini",
    };
  }

  if (session.user.role !== "ADMIN") {
    return {
      success: false as const,
      error: "Halaman ini hanya dapat diakses oleh Admin Prodi",
    };
  }

  try {
    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: any = {
      status: "DIJADWALKAN",
    };

    if (filters?.startDate || filters?.endDate) {
      whereClause.tanggalUjian = {};
      if (filters.startDate) {
        whereClause.tanggalUjian.gte = filters.startDate;
      }
      if (filters.endDate) {
        whereClause.tanggalUjian.lte = filters.endDate;
      }
    }

    if (filters?.prodi) {
      whereClause.mahasiswa = {
        prodi: filters.prodi,
      };
    }

    if (filters?.search) {
      whereClause.OR = [
        {
          mahasiswa: {
            name: { contains: filters.search, mode: "insensitive" },
          },
        },
        {
          mahasiswa: { nim: { contains: filters.search, mode: "insensitive" } },
        },
      ];
    }

    // Get data
    const adminData = await prisma.ujian.findMany({
      where: whereClause,
      select: {
        id: true,
        mahasiswa: {
          select: {
            name: true,
            nim: true,
            image: true,
            prodi: true,
          },
        },
        judul: true,
        tanggalUjian: true,
        jamMulai: true,
        jamSelesai: true,
        ruangan: {
          select: {
            nama: true,
          },
        },
        dosenPembimbing: {
          select: {
            name: true,
          },
        },
        dosenPenguji: {
          select: {
            dosen: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        tanggalUjian: "asc",
      },
    });

    const data = adminData.map((item) => {
      const angkatan = item.mahasiswa?.nim?.substring(0, 2) || null;

      return {
        id: item.id,
        namaMahasiswa: item.mahasiswa?.name || null,
        nim: item.mahasiswa?.nim || null,
        foto: item.mahasiswa?.image || null,
        judulTugasAkhir: item.judul || null,
        tanggal: item.tanggalUjian ?? null,
        jamMulai: item.jamMulai ?? null,
        jamSelesai: item.jamSelesai ?? null,
        ruangan: item.ruangan?.nama || null,
        prodi: item.mahasiswa?.prodi || null,
        angkatan,
        dosenPembimbing: item.dosenPembimbing?.name || null,
        dosenPenguji: item.dosenPenguji.map((dp) => dp.dosen.name || ""),
      };
    }) as AdminJadwalData[];

    return {
      success: true as const,
      data,
    };
  } catch (error) {
    console.error("Error in getAdminJadwal:", error);
    return {
      success: false as const,
      error: "Terjadi kesalahan saat mengambil data jadwal",
    };
  }
}
