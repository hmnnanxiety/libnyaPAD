"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface data {
  id: string;
  namaMahasiswa?: string | null;
  nim?: string | null;
  foto?: string | null;
  judulTugasAkhir?: string | null;
  tanggal?: Date | null;
  jam?: string | null;
  ruangan?: string | null;
  dosenPenguji1?: string | null;
  dosenPenguji2?: string | null;
  dosenPembimbing?: string | null;
  status?: string | null;
  isDosenPembimbing?: boolean | null;
}

export async function dashBottom() {
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
    let data: data[] = [];
    switch (role) {
      case "MAHASISWA":
        {
          const ujianData = await prisma.ujian.findMany({
            where: { mahasiswaId: userId },
            select: {
              id: true,
              judul: true,
              tanggalUjian: true,
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 5,
          });
          data = ujianData.map((item) => ({
            id: item.id,
            judulTugasAkhir: item.judul || null,
            tanggal: item.tanggalUjian,
          }));
        }
        break;
      case "ADMIN":
        {
          const ujianData = await prisma.ujian.findMany({
            select: {
              id: true,
              mahasiswa: {
                select: {
                  name: true,
                  nim: true,
                  image: true,
                },
              },
              tanggalUjian: true,
              ruangan: true,
              dosenPenguji: {
                select: {
                  dosen: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
              dosenPembimbing: {
                select: {
                  name: true,
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 5,
          });
          data = ujianData.map((item) => ({
            id: item.id,
            namaMahasiswa: item.mahasiswa?.name || null,
            nim: item.mahasiswa?.nim || null,
            foto: item.mahasiswa?.image || null,
            tanggal: item.tanggalUjian,
            ruangan: item.ruangan || null,
            dosenPenguji1: item.dosenPenguji?.[0]?.dosen?.name || null,
            dosenPenguji2: item.dosenPenguji?.[1]?.dosen?.name || null,
            dosenPembimbing: item.dosenPembimbing?.name || null,
          }));
        }
        break;
      case "DOSEN":
        {
          const ujianData = await prisma.ujian.findMany({
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
            orderBy: {
              createdAt: "desc",
            },
            take: 5,
          });
          data = ujianData.map((item) => ({
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
      default:
        return {
          success: false,
          error: "Role pengguna tidak dikenali",
        };
    }
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Error fetching user session:", error);
    return {
      success: false,
      error: "Terjadi kesalahan saat mengambil data pengguna",
    };
  }
}
