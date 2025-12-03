"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface dataDosen {
  id: string;
  ruangan: string | null;
  jamMulai: Date | null;
  jamSelesai: Date | null;
}

interface dataMahasiswa {
  id: string;
  ruangan: string | null;
  jamMulai: Date | null;
  jamSelesai: Date | null;
}

interface dataAdmin {
  id: string;
  namaMahasiswa: string | null;
  nim: string | null;
  foto: string | null;
  ruangan: string | null;
  jamMulai: Date | null;
  jamSelesai: Date | null;
}

/**
 * Update exam status from DIJADWALKAN to SELESAI when exam has passed
 */
async function updateExpiredExams() {
  try {
    const now = new Date();

    const expiredExams = await prisma.ujian.findMany({
      where: {
        status: "DIJADWALKAN",
        tanggalUjian: {
          lt: now,
        },
      },
      select: {
        id: true,
        jamSelesai: true,
      },
    });

    const examsToUpdate = expiredExams.filter((exam) => {
      if (!exam.jamSelesai) return true;
      const examEndTime = new Date(exam.jamSelesai);
      return examEndTime < now;
    });

    if (examsToUpdate.length > 0) {
      await prisma.ujian.updateMany({
        where: {
          id: {
            in: examsToUpdate.map((exam) => exam.id),
          },
        },
        data: {
          status: "SELESAI",
        },
      });
    }
  } catch (error) {
    console.error("Error updating expired exams:", error);
  }
}

export async function dashboardTop() {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      success: false,
      error: "Anda harus login untuk mengakses dashboard",
    };
  }

  try {
    // 🔥 UPDATE EXPIRED EXAMS FIRST
    await updateExpiredExams();

    const userId = session.user.id;
    const role = String(session.user.role || "").toUpperCase();

    // Calculate date range: current month and 2 months ahead
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 3, 0);

    const dateFilter = {
      tanggalUjian: {
        gte: startOfCurrentMonth,
        lte: endDate,
      },
    };

    // Calculate current month range for counting completed exams
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    switch (role) {
      case "MAHASISWA": {
        // Fetch ujian data
        const ujianData = await prisma.ujian.findMany({
          where: {
            mahasiswaId: userId,
            ...dateFilter,
            status: "DIJADWALKAN", // Only show scheduled exams
          },
          select: {
            id: true,
            ruangan: {
              select: {
                nama: true,
              },
            },
            jamMulai: true,
            jamSelesai: true,
          },
          orderBy: { tanggalUjian: "asc" },
        });

        const latestUjian = await prisma.ujian.findFirst({
          where: { mahasiswaId: userId },
          select: { status: true },
          orderBy: { createdAt: "desc" },
        });

        const data: dataMahasiswa[] = ujianData.map((item) => ({
          id: item.id,
          ruangan: item.ruangan?.nama || null,
          jamMulai: item.jamMulai,
          jamSelesai: item.jamSelesai,
        }));

        return {
          success: true,
          data,
          statusPengajuan: latestUjian?.status || null,
        };
      }

      case "DOSEN": {
        const ujianData = await prisma.ujian.findMany({
          where: {
            OR: [
              { dosenPembimbingId: userId },
              { dosenPenguji: { some: { dosenId: userId } } },
            ],
            ...dateFilter,
            status: "DIJADWALKAN", // Only show scheduled exams
          },
          select: {
            id: true,
            ruangan: {
              select: {
                nama: true,
              },
            },
            jamMulai: true,
            jamSelesai: true,
          },
          orderBy: { tanggalUjian: "asc" },
        });

        // Count completed exams this month
        const ujianSelesaiBulanIni = await prisma.ujian.count({
          where: {
            OR: [
              { dosenPembimbingId: userId },
              { dosenPenguji: { some: { dosenId: userId } } },
            ],
            status: "SELESAI",
            tanggalUjian: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
          },
        });

        const jumlahMahasiswaBimbingan = await prisma.user.count({
          where: { dosenPembimbingId: userId },
        });

        const data: dataDosen[] = ujianData.map((item) => ({
          id: item.id,
          ruangan: item.ruangan?.nama || null,
          jamMulai: item.jamMulai,
          jamSelesai: item.jamSelesai,
        }));

        return {
          success: true,
          data,
          jumlahMahasiswaBimbingan,
          ujianSelesaiBulanIni,
        };
      }

      case "ADMIN": {
        const ujianData = await prisma.ujian.findMany({
          where: {
            ...dateFilter,
            status: "DIJADWALKAN", // Only show scheduled exams
          },
          select: {
            id: true,
            mahasiswa: {
              select: {
                name: true,
                nim: true,
                image: true,
              },
            },
            ruangan: {
              select: {
                nama: true,
              },
            },
            jamMulai: true,
            jamSelesai: true,
          },
          orderBy: { tanggalUjian: "asc" },
        });

        // Count completed exams this month
        const ujianSelesaiBulanIni = await prisma.ujian.count({
          where: {
            status: "SELESAI",
            tanggalUjian: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
          },
        });

        const [jumlahMahasiswa, jumlahDosen] = await Promise.all([
          prisma.user.count({ where: { role: "MAHASISWA" } }),
          prisma.user.count({ where: { role: "DOSEN" } }),
        ]);

        const data: dataAdmin[] = ujianData.map((item) => ({
          id: item.id,
          namaMahasiswa: item.mahasiswa?.name || null,
          nim: item.mahasiswa?.nim || null,
          foto: item.mahasiswa?.image || null,
          ruangan: item.ruangan?.nama || null,
          jamMulai: item.jamMulai,
          jamSelesai: item.jamSelesai,
        }));

        return {
          success: true,
          data,
          jumlahMahasiswa,
          jumlahDosen,
          ujianSelesaiBulanIni,
        };
      }

      default:
        return {
          success: false,
          error: "Role pengguna tidak dikenali",
        };
    }
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return {
      success: false,
      error: "Terjadi kesalahan saat mengambil data dashboard",
    };
  }
}