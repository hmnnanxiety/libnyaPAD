"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface dosenRU {
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

    switch (role) {
      case "MAHASISWA": {
        // Fetch ujian data - only upcoming (not finished yet)
        const ujianData = await prisma.ujian.findMany({
          where: {
            mahasiswaId: userId,
            tanggalUjian: {
              gte: startOfCurrentMonth,
              lte: endDate,
            },
            status: "DIJADWALKAN",
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

        // Filter out completed exams
        const upcomingData = ujianData.filter(item => {
          if (!item.jamSelesai) return true;
          return new Date(item.jamSelesai) >= now;
        });

        const latestUjian = await prisma.ujian.findFirst({
          where: { mahasiswaId: userId },
          select: { 
            status: true,
            jamSelesai: true,
          },
          orderBy: { createdAt: "desc" },
        });

        // Compute display status
        let displayStatus = latestUjian?.status || null;
        if (latestUjian?.jamSelesai && new Date(latestUjian.jamSelesai) < now) {
          if (latestUjian.status === "DIJADWALKAN") {
            displayStatus = "SELESAI";
          }
        }

        const data: dataMahasiswa[] = upcomingData.map((item) => ({
          id: item.id,
          ruangan: item.ruangan?.nama || null,
          jamMulai: item.jamMulai,
          jamSelesai: item.jamSelesai,
        }));

        return {
          success: true,
          data,
          statusPengajuan: displayStatus,
        };
      }

      case "DOSEN": {
        // Fetch upcoming exams for dosen
        const ujianData = await prisma.ujian.findMany({
          where: {
            OR: [
              { dosenPembimbingId: userId },
              { dosenPenguji: { some: { dosenId: userId } } },
            ],
            tanggalUjian: {
              gte: startOfCurrentMonth,
              lte: endDate,
            },
            status: "DIJADWALKAN",
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

        // Filter out completed exams
        const upcomingData = ujianData.filter(item => {
          if (!item.jamSelesai) return true;
          return new Date(item.jamSelesai) >= now;
        });

        // Count completed exams this month - FIXED
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        
        // Fetch all DIJADWALKAN exams this month and filter in memory
        const allUjianThisMonth = await prisma.ujian.findMany({
          where: {
            OR: [
              { dosenPembimbingId: userId },
              { dosenPenguji: { some: { dosenId: userId } } },
            ],
            status: "DIJADWALKAN",
            tanggalUjian: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
          },
          select: {
            jamSelesai: true,
          },
        });

        // Count those where jamSelesai has passed
        const ujianSelesaiBulanIni = allUjianThisMonth.filter(ujian => {
          if (!ujian.jamSelesai) return false;
          return new Date(ujian.jamSelesai) < now;
        }).length;

        // Count mahasiswa bimbingan - semua mahasiswa yang sedang dibimbing
        const jumlahMahasiswaBimbingan = await prisma.user.count({
          where: { 
            dosenPembimbingId: userId,
            role: "MAHASISWA"
          },
        });

        const data: dosenRU[] = upcomingData.map((item) => ({
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
        // Fetch upcoming exams
        const ujianData = await prisma.ujian.findMany({
          where: {
            tanggalUjian: {
              gte: startOfCurrentMonth,
              lte: endDate,
            },
            status: "DIJADWALKAN",
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

        // Filter out completed exams
        const upcomingData = ujianData.filter(item => {
          if (!item.jamSelesai) return true;
          return new Date(item.jamSelesai) >= now;
        });

        // Count completed exams this month - FIXED
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        
        // Fetch all DIJADWALKAN exams this month and filter in memory
        const allUjianThisMonth = await prisma.ujian.findMany({
          where: {
            status: "DIJADWALKAN",
            tanggalUjian: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
          },
          select: {
            jamSelesai: true,
          },
        });

        // Count those where jamSelesai has passed
        const ujianSelesaiBulanIni = allUjianThisMonth.filter(ujian => {
          if (!ujian.jamSelesai) return false;
          return new Date(ujian.jamSelesai) < now;
        }).length;

        // Count active mahasiswa and dosen
        const [jumlahMahasiswa, jumlahDosen] = await Promise.all([
          prisma.user.count({ where: { role: "MAHASISWA" } }),
          prisma.user.count({ where: { role: "DOSEN" } }),
        ]);

        const data: dataAdmin[] = upcomingData.map((item) => ({
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