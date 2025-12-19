"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StatusUjian, Prisma } from "@/generated/prisma";

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
  month?: number;
  year?: number;
  peran?: "semua" | "pembimbing" | "penguji";
  status?: "semua" | "selesai" | "dijadwalkan";
}

// Auto update ujian DIJADWALKAN → SELESAI kalau sudah lewat
async function updateExpiredExams() {
  try {
    const now = new Date();

    const expiredExams = await prisma.ujian.findMany({
      where: {
        status: StatusUjian.DIJADWALKAN,
        tanggalUjian: { lt: now },
      },
      select: { id: true, jamSelesai: true },
    });

    const examsToUpdate = expiredExams.filter((exam) => {
      if (!exam.jamSelesai) return true;
      return new Date(exam.jamSelesai) < now;
    });

    if (examsToUpdate.length > 0) {
      await prisma.ujian.updateMany({
        where: {
          id: { in: examsToUpdate.map((x) => x.id) },
        },
        data: {
          status: StatusUjian.SELESAI,
        },
      });
    }
  } catch (err) {
    console.error("❌ Error updating expired exams:", err);
  }
}

export async function riwayatUjian(params: PaginationParams = {}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Anda harus login untuk mengakses riwayat ujian" };
  }

  if (session.user.role !== "DOSEN" && session.user.role !== "ADMIN") {
    return { success: false, error: "Hanya dosen dan admin yang dapat mengakses riwayat ujian" };
  }

  try {
    await updateExpiredExams();

    const { 
      page = 1, 
      limit = 10, 
      month, 
      year, 
      peran = "semua",
      status = "semua" 
    } = params;
    const skip = (page - 1) * limit;

    const userId = session.user.id;
    const role = session.user.role.toUpperCase();

    const dateFilter: Partial<Pick<Prisma.UjianWhereInput, 'tanggalUjian'>> = {};
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      dateFilter.tanggalUjian = { gte: startDate, lte: endDate };
    } else if (year) {
      dateFilter.tanggalUjian = {
        gte: new Date(year, 0, 1),
        lte: new Date(year, 11, 31, 23, 59, 59),
      };
    }

    // Status filter
    const statusCondition: Partial<Pick<Prisma.UjianWhereInput, 'status'>> = {};
    if (status === "selesai") {
      statusCondition.status = StatusUjian.SELESAI;
    } else if (status === "dijadwalkan") {
      statusCondition.status = StatusUjian.DIJADWALKAN;
    }
    // If "semua", no status filter is applied

    // ====================
    //       DOSEN
    // ====================
    if (role === "DOSEN") {
      let whereClause: Prisma.UjianWhereInput = {
        OR: [
          { dosenPembimbingId: userId },
          { dosenPenguji: { some: { dosenId: userId } } },
        ],
        ...statusCondition,
        ...dateFilter,
      };

      if (peran === "pembimbing") {
        whereClause = { 
          dosenPembimbingId: userId, 
          ...statusCondition,
          ...dateFilter 
        };
      } else if (peran === "penguji") {
        whereClause = { 
          dosenPenguji: { some: { dosenId: userId } }, 
          ...statusCondition,
          ...dateFilter 
        };
      }

      const totalCount = await prisma.ujian.count({ where: whereClause });

      const dosenData = await prisma.ujian.findMany({
        where: whereClause,
        select: {
          id: true,
          mahasiswa: { select: { name: true, nim: true, image: true } },
          judul: true,
          tanggalUjian: true,
          dosenPembimbingId: true,
          status: true,
        },
        orderBy: { tanggalUjian: "desc" },
        skip,
        take: limit,
      });

      const data: dosenRU[] = dosenData.map((item) => ({
        id: item.id,
        namaMahasiswa: item.mahasiswa?.name || null,
        nim: item.mahasiswa?.nim || null,
        foto: item.mahasiswa?.image || null,
        judulTugasAkhir: item.judul,
        tanggal: item.tanggalUjian?.toISOString() || null,
        isDosenPembimbing: item.dosenPembimbingId === userId,
        completed: item.status === StatusUjian.SELESAI,
      }));

      return {
        success: true,
        data,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasMore: skip + data.length < totalCount,
        },
      };
    }

    // ====================
    //        ADMIN
    // ====================
    if (role === "ADMIN") {
      const whereClause: Prisma.UjianWhereInput = {
        ...statusCondition,
        ...dateFilter,
      };

      const totalCount = await prisma.ujian.count({ where: whereClause });

      const ujianData = await prisma.ujian.findMany({
        where: whereClause,
        select: {
          id: true,
          mahasiswa: { select: { name: true, nim: true, image: true } },
          judul: true,
          tanggalUjian: true,
          ruangan: { select: { nama: true } },
          dosenPembimbing: { select: { name: true } },
          dosenPenguji: {
            take: 2,
            select: { dosen: { select: { name: true } } },
          },
        },
        orderBy: { tanggalUjian: "desc" },
        skip,
        take: limit,
      });

      const data: adminRU[] = ujianData.map((item) => ({
        id: item.id,
        namaMahasiswa: item.mahasiswa?.name || null,
        nim: item.mahasiswa?.nim || null,
        foto: item.mahasiswa?.image || null,
        judulTugasAkhir: item.judul,
        tanggal: item.tanggalUjian?.toISOString() || null,
        ruangan: item.ruangan?.nama || null,
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
          hasMore: skip + data.length < totalCount,
        },
      };
    }

    return { success: false, error: "Role tidak valid" };
  } catch (error) {
    console.error("Error fetching riwayat ujian:", error);
    return { success: false, error: "Terjadi kesalahan saat mengambil riwayat ujian" };
  }
}