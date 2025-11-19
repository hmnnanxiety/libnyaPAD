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

export async function dashboardTop() {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      success: false,
      error: "Anda harus login untuk mengakses dashboard",
    };
  }

  try {
    const userId = session.user.id;
    const role = String(session.user.role || "").toUpperCase();

    // Calculate date range: current month and 2 months ahead
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 3, 0); // End of 2 months ahead

    const dateFilter = {
      tanggalUjian: {
        gte: startOfCurrentMonth,
        lte: endDate,
      },
    };

    switch (role) {
      case "MAHASISWA": {
        // Fetch ujian data
        const ujianData = await prisma.ujian.findMany({
          where: {
            mahasiswaId: userId,
            ...dateFilter,
          },
          select: {
            id: true,
            ruangan: true,
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
          ruangan: item.ruangan,
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
          },
          select: {
            id: true,
            ruangan: true,
            jamMulai: true,
            jamSelesai: true,
          },
          orderBy: { tanggalUjian: "asc" },
        });

        const jumlahMahasiswaBimbingan = await prisma.user.count({
          where: { dosenPembimbingId: userId },
        });

        const data: dataDosen[] = ujianData.map((item) => ({
          id: item.id,
          ruangan: item.ruangan,
          jamMulai: item.jamMulai,
          jamSelesai: item.jamSelesai,
        }));

        return {
          success: true,
          data,
          jumlahMahasiswaBimbingan,
        };
      }

      case "ADMIN": {
        const ujianData = await prisma.ujian.findMany({
          where: dateFilter,
          select: {
            id: true,
            mahasiswa: {
              select: {
                name: true,
                nim: true,
                image: true,
              },
            },
            ruangan: true,
            jamMulai: true,
            jamSelesai: true,
          },
          orderBy: { tanggalUjian: "asc" },
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
          ruangan: item.ruangan,
          jamMulai: item.jamMulai,
          jamSelesai: item.jamSelesai,
        }));

        return {
          success: true,
          data,
          jumlahMahasiswa,
          jumlahDosen,
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
