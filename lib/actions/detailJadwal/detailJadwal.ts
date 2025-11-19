"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface dosenDJ {
  id: string;
  namaMahasiswa: string | null;
  nim: string | null;
  foto: string | null;
  judulTugasAkhir: string | null;
  tanggal: Date | null;
  ruangan: string | null;
  isDosenPembimbing: boolean;
}

interface mahasiswaDJ {
  id: string;
  judul: string | null;
  tanggal: Date | null;
}

export async function detailJadwal() {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      success: false,
      error: "Anda harus login untuk mengakses detail jadwal",
    };
  }

  if (session?.user?.role !== "MAHASISWA" && session?.user?.role !== "DOSEN") {
    return {
      success: false,
      error: "Hanya mahasiswa dan dosen yang dapat mengakses detail jadwal",
    };
  }

  try {
    const userId = session.user.id;
    const role = String(session.user.role || "").toUpperCase();
    let data: dosenDJ[] | mahasiswaDJ[] | null = null;

    switch (role) {
      case "DOSEN":
        {
          const dosenData = await prisma.ujian.findMany({
            where: {
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
                },
              },
              judul: true,
              tanggalUjian: true,
              ruangan: true,
              dosenPembimbingId: true,
            },
          });
          data = dosenData.map((item) => ({
            id: item.id,
            namaMahasiswa: item.mahasiswa?.name || null,
            nim: item.mahasiswa?.nim || null,
            foto: item.mahasiswa?.image || null,
            judulTugasAkhir: item.judul || null,
            tanggal: item.tanggalUjian,
            ruangan: item.ruangan || null,
            isDosenPembimbing: item.dosenPembimbingId === userId,
          }));
        }
        break;
      case "MAHASISWA":
        {
          const mahasiswaData = await prisma.ujian.findMany({
            where: {
              mahasiswaId: userId,
            },
            select: {
              id: true,
              judul: true,
              tanggalUjian: true,
            },
          });
          data = mahasiswaData.map((item) => ({
            id: item.id,
            judul: item.judul || null,
            tanggal: item.tanggalUjian,
          }));
        }
        break;
      default:
        break;
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: "Terjadi kesalahan saat mengambil detail jadwal",
    };
  }
}
