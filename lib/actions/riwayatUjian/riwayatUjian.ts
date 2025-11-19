"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface dosenRU {
  id: string;
  namaMahasiswa: string | null;
  nim: string | null;
  foto: string | null;
  judulTugasAkhir: string | null;
  tanggal: string | null;
  isDosenPembimbing: boolean;
  completed: boolean;
}

interface adminRU {
  id: string;
  namaMahasiswa: string | null;
  nim: string | null;
  foto: string | null;
  judulTugasAkhir: string | null;
  tanggal: string | null;
  ruangan: string | null;
  dosenPembimbing: string | null;
  dosenPenguji1: string | null;
  dosenPenguji2: string | null;
}

interface PaginationParams {
  page?: number;
  limit?: number;
  month?: number; // 1-12
  year?: number;
  peran?: "semua" | "pembimbing" | "penguji";
}

export async function riwayatUjian(params: PaginationParams = {}) {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      success: false,
      error: "Anda harus login untuk mengakses riwayat ujian",
    };
  }

  if (session?.user?.role !== "DOSEN" && session?.user?.role !== "ADMIN") {
    return {
      success: false,
      error: "Hanya dosen dan admin yang dapat mengakses riwayat ujian",
    };
  }

  try {
    const { page = 1, limit = 10, month, year, peran = "semua" } = params;
    const skip = (page - 1) * limit;
    const userId = session.user.id;
    const role = String(session.user.role || "").toUpperCase();
    let data: dosenRU[] | adminRU[] = [];

    // Build date filter
    const dateFilter: any = {};
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      dateFilter.tanggalUjian = {
        gte: startDate,
        lte: endDate,
      };
    } else if (year) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59);
      dateFilter.tanggalUjian = {
        gte: startDate,
        lte: endDate,
      };
    }

    switch (role) {
      case "DOSEN": {
        let whereClause: any = {
          OR: [
            { dosenPembimbingId: userId },
            { dosenPenguji: { some: { dosenId: userId } } },
          ],
          ...dateFilter,
        };

        if (peran === "pembimbing") {
          whereClause = {
            dosenPembimbingId: userId,
            ...dateFilter,
          };
        } else if (peran === "penguji") {
          whereClause = {
            dosenPenguji: { some: { dosenId: userId } },
            ...dateFilter,
          };
        }

        const totalCount = await prisma.ujian.count({
          where: whereClause,
        });

        const dosenData = await prisma.ujian.findMany({
          where: whereClause,
          select: {
            id: true,
            mahasiswa: {
              select: {
                name: true,
                nim: true,
                image: true,
              },
            },
            judul: true,
            tanggalUjian: true,
            ruangan: true,
            dosenPembimbingId: true,
          },
          orderBy: {
            tanggalUjian: "desc",
          },
          skip,
          take: limit,
        });

        data = dosenData.map((item) => {
          const now = new Date();
          const examDate = item.tanggalUjian
            ? new Date(item.tanggalUjian)
            : null;
          const completed = examDate ? examDate < now : false;

          return {
            id: item.id,
            namaMahasiswa: item.mahasiswa?.name || null,
            nim: item.mahasiswa?.nim || null,
            foto: item.mahasiswa?.image || null,
            judulTugasAkhir: item.judul || null,
            tanggal: item.tanggalUjian?.toISOString() || null,
            isDosenPembimbing: item.dosenPembimbingId === userId,
            completed,
          };
        });

        return {
          success: true,
          data,
          pagination: {
            page,
            limit,
            total: totalCount,
            totalPages: Math.ceil(totalCount / limit),
            hasMore: skip + dosenData.length < totalCount,
          },
        };
      }
      case "ADMIN": {
        const whereClause = {
          ...dateFilter,
        };

        // Get total count
        const totalCount = await prisma.ujian.count({
          where: whereClause,
        });

        const ujianData = await prisma.ujian.findMany({
          where: whereClause,
          select: {
            id: true,
            mahasiswa: {
              select: {
                name: true,
                nim: true,
                image: true,
              },
            },
            judul: true,
            tanggalUjian: true,
            ruangan: true,
            dosenPembimbing: {
              select: {
                name: true,
              },
            },
            dosenPenguji: {
              take: 2,
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
            tanggalUjian: "desc",
          },
          skip,
          take: limit,
        });

        data = ujianData.map((item) => ({
          id: item.id,
          namaMahasiswa: item.mahasiswa?.name || null,
          nim: item.mahasiswa?.nim || null,
          foto: item.mahasiswa?.image || null,
          judulTugasAkhir: item.judul || null,
          tanggal: item.tanggalUjian?.toISOString() || null,
          ruangan: item.ruangan || null,
          dosenPembimbing: item.dosenPembimbing?.name || null,
          dosenPenguji1: item.dosenPenguji?.[0]?.dosen?.name || null,
          dosenPenguji2: item.dosenPenguji?.[1]?.dosen?.name || null,
        }));

        return {
          success: true,
          data,
          pagination: {
            page,
            limit,
            total: totalCount,
            totalPages: Math.ceil(totalCount / limit),
            hasMore: skip + ujianData.length < totalCount,
          },
        };
      }
    }

    return {
      success: false,
      error: "Role tidak valid",
    };
  } catch (error) {
    console.error("Error fetching riwayat ujian:", error);
    return {
      success: false,
      error: "Terjadi kesalahan saat mengambil riwayat ujian",
    };
  }
}
