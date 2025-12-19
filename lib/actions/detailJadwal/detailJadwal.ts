"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/* ============================
   INTERFACES
============================= */

export interface DosenDJ {
  id: string;
  namaMahasiswa: string | null;
  nim: string | null;
  foto: string | null;
  judulTugasAkhir: string | null;
  tanggal: Date | null;
  jamMulai: Date | null;
  jamSelesai: Date | null;
  ruangan: string | null;
  isDosenPembimbing: boolean;
  prodi: string | null;
  angkatan: string | null;
}

export interface MahasiswaDJ {
  id: string;
  judul: string | null;
  tanggal: Date | null;
  jamMulai: Date | null;
  jamSelesai: Date | null;
  ruangan: string | null;
}

export interface AdminDJ {
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

export interface FilterOptions {
  startDate?: Date;
  endDate?: Date;
  prodi?: string;
  angkatan?: string;
  search?: string;
  page?: number;
  limit?: number;
}

/* ============================
   1. DETAIL JADWAL (LIST) - ALL ROLES
   Purpose: Menampilkan jadwal ujian yang AKAN DATANG
   Status: DIJADWALKAN dengan tanggalUjian >= today
============================= */

export async function detailJadwal(filters?: FilterOptions) {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      success: false,
      error: "Anda harus login untuk mengakses detail jadwal",
    };
  }

  const role = String(session.user.role || "").toUpperCase();
  const allowedRoles = ["MAHASISWA", "DOSEN", "ADMIN"];

  if (!allowedRoles.includes(role)) {
    return {
      success: false,
      error: "Anda tidak memiliki akses ke halaman ini",
    };
  }

  try {
    const userId = session.user.id;
    let data: DosenDJ[] | MahasiswaDJ[] | AdminDJ[] = [];
    let totalCount = 0;

    switch (role) {
      /* =====================
         ADMIN
      ====================== */
      case "ADMIN": {
        // Get current date at start of today (00:00:00)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const whereClause: any = { 
          status: "DIJADWALKAN",
          tanggalUjian: {
            gte: today, // Hanya ambil ujian yang akan datang (hari ini dan kedepan)
          },
        };

        if (filters?.startDate || filters?.endDate) {
          // Override tanggalUjian filter jika ada custom date range filter
          whereClause.tanggalUjian = {};
          if (filters.startDate)
            whereClause.tanggalUjian.gte = filters.startDate;
          if (filters.endDate) whereClause.tanggalUjian.lte = filters.endDate;
        }

        if (filters?.prodi) {
          whereClause.mahasiswa = { prodi: filters.prodi };
        }

        if (filters?.search) {
          whereClause.OR = [
            {
              mahasiswa: {
                name: { contains: filters.search, mode: "insensitive" },
              },
            },
            {
              mahasiswa: {
                nim: { contains: filters.search, mode: "insensitive" },
              },
            },
          ];
        }

        totalCount = await prisma.ujian.count({ where: whereClause });

        const skip = filters?.page
          ? (filters.page - 1) * (filters?.limit || 10)
          : 0;
        const take = filters?.limit || 10;

        const adminData = await prisma.ujian.findMany({
          where: whereClause,
          skip: filters ? skip : undefined,
          take: filters ? take : undefined,
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
            dosenPembimbing: { select: { name: true } },
            dosenPenguji: {
              select: {
                dosen: { select: { name: true } },
              },
            },
          },
          orderBy: { tanggalUjian: "asc" },
        });

        data = adminData.map((item) => {
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
        }) as AdminDJ[];

        break;
      }

      /* =====================
         DOSEN
      ====================== */
      case "DOSEN": {
        const dosenData = await prisma.ujian.findMany({
          where: {
            status: "DIJADWALKAN",
            OR: [
              { dosenPembimbingId: userId },
              { dosenPenguji: { some: { dosenId: userId } } },
            ],
          },
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
            dosenPembimbingId: true,
          },
          orderBy: { tanggalUjian: "asc" },
        });

        data = dosenData.map((item) => {
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
            isDosenPembimbing: item.dosenPembimbingId === userId,
            prodi: item.mahasiswa?.prodi || null,
            angkatan,
          };
        }) as DosenDJ[];

        break;
      }

      /* =====================
         MAHASISWA
      ====================== */
      case "MAHASISWA": {
        const mahasiswaData = await prisma.ujian.findMany({
          where: {
            mahasiswaId: userId,
            status: "DIJADWALKAN",
          },
          select: {
            id: true,
            judul: true,
            tanggalUjian: true,
            jamMulai: true,
            jamSelesai: true,
            ruangan: {
              select: {
                nama: true,
              },
            },
          },
          orderBy: { tanggalUjian: "asc" },
        });

        data = mahasiswaData.map((item) => ({
          id: item.id,
          judul: item.judul || null,
          tanggal: item.tanggalUjian ?? null,
          jamMulai: item.jamMulai ?? null,
          jamSelesai: item.jamSelesai ?? null,
          ruangan: item.ruangan?.nama || null,
        })) as MahasiswaDJ[];

        break;
      }

      default:
        break;
    }

    return {
      success: true,
      data,
      totalCount: filters ? totalCount : undefined,
      totalPages: filters
        ? Math.ceil(totalCount / (filters?.limit || 10))
        : undefined,
    };
  } catch (error) {
    console.error("Error in detailJadwal:", error);
    return {
      success: false,
      error: "Terjadi kesalahan saat mengambil detail jadwal",
    };
  }
}

/* ============================
   2. GET ADMIN JADWAL (ADMIN ONLY)
   Purpose: Menampilkan RIWAYAT ujian yang SUDAH SELESAI
   Status: SELESAI (sudah di-auto-update oleh system)
============================= */

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: any = {
      status: "SELESAI", // Tampilkan ujian yang sudah selesai untuk RIWAYAT
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
        tanggalUjian: "desc", // Terbaru dulu untuk riwayat
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
    }) as AdminDJ[];

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

/* ============================
   3. DETAIL UJIAN PER ID (ALL ROLES)
============================= */

export async function getUjianDetailsForAll(ujianId: string) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Anda harus login untuk mengakses halaman ini",
      };
    }

    const userId = session.user.id;
    const userRole = session.user.role;

    const ujian = await prisma.ujian.findUnique({
      where: { id: ujianId },
      select: {
        id: true,
        judul: true,
        berkasUrl: true,
        status: true,
        createdAt: true,
        tanggalUjian: true,
        jamMulai: true,
        jamSelesai: true,
        ruangan: {
          select: {
            nama: true,
          },
        },
        mahasiswa: {
          select: {
            id: true,
            name: true,
            nim: true,
            prodi: true,
            image: true,
          },
        },
        dosenPembimbing: {
          select: {
            id: true,
            name: true,
          },
        },
        dosenPenguji: {
          select: {
            dosen: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!ujian) {
      return {
        success: false,
        error: "Ujian tidak ditemukan",
      };
    }

    const isAuthorized =
      userRole === "ADMIN" ||
      ujian.mahasiswa.id === userId ||
      ujian.dosenPembimbing?.id === userId ||
      ujian.dosenPenguji.some((p) => p.dosen.id === userId);

    if (!isAuthorized) {
      return {
        success: false,
        error: "Anda tidak memiliki akses ke ujian ini",
      };
    }

    return {
      success: true,
      data: ujian,
    };
  } catch (error) {
    console.error("Error fetching ujian details:", error);
    return {
      success: false,
      error: "Terjadi kesalahan saat mengambil data ujian",
    };
  }
}