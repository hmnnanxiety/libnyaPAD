"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface Data {
  id: string;
  namaMahasiswa?: string | null;
  nim?: string | null;
  foto?: string | null;
  judul?: string | null;
  tanggal?: Date | null;
  jamMulai?: Date | null;
  jamSelesai?: Date | null;
  ruangan?: string | null;
  dosenPenguji1?: string | null;
  dosenPenguji2?: string | null;
  dosenPembimbing?: string | null;
  status?: string | null;
  isDosenPembimbing?: boolean | null;
  prodi?: string | null;
  angkatan?: string | null;
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
    let data: Data[] = [];

    // MAHASISWA ROLE - FIXED
    if (role === "MAHASISWA") {
      const ujianData = await prisma.ujian.findMany({
        where: { 
          mahasiswaId: userId,
          status: "DIJADWALKAN"
        },
        select: {
          id: true,
          judul: true,
          tanggalUjian: true,
          jamMulai: true,
          jamSelesai: true,
          ruangan: {
            select: { nama: true },
          },
        },
        orderBy: { tanggalUjian: "asc" },
        take: 5,
      });

      data = ujianData.map((item) => ({
        id: item.id,
        judul: item.judul ?? null,
        tanggal: item.tanggalUjian ?? null,
        jamMulai: item.jamMulai ?? null,
        jamSelesai: item.jamSelesai ?? null,
        ruangan: item.ruangan?.nama ?? null,
      }));
    }

    // ADMIN ROLE - FIXED
    else if (role === "ADMIN") {
      const ujianData = await prisma.ujian.findMany({
        where: {
          status: "DIJADWALKAN"
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
          tanggalUjian: true,
          jamMulai: true,
          jamSelesai: true,
          ruangan: { select: { nama: true } },
          dosenPenguji: {
            select: { dosen: { select: { name: true } } },
          },
          dosenPembimbing: {
            select: { name: true },
          },
        },
        orderBy: { tanggalUjian: "asc" },
        take: 5,
      });

      data = ujianData.map((item) => ({
        id: item.id,
        namaMahasiswa: item.mahasiswa?.name ?? null,
        nim: item.mahasiswa?.nim ?? null,
        foto: item.mahasiswa?.image ?? null,
        tanggal: item.tanggalUjian ?? null,
        jamMulai: item.jamMulai ?? null,
        jamSelesai: item.jamSelesai ?? null,
        ruangan: item.ruangan?.nama ?? null,
        dosenPenguji1: item.dosenPenguji?.[0]?.dosen?.name ?? null,
        dosenPenguji2: item.dosenPenguji?.[1]?.dosen?.name ?? null,
        dosenPembimbing: item.dosenPembimbing?.name ?? null,
        prodi: item.mahasiswa?.prodi ?? null,
        angkatan: item.mahasiswa?.nim?.substring(0, 2) ?? null,
      }));
    }
    
    // DOSEN ROLE - FIXED
    else if (role === "DOSEN") {
      const ujianData = await prisma.ujian.findMany({
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
          ruangan: { select: { nama: true } },
          dosenPembimbingId: true,
        },
        orderBy: { tanggalUjian: "asc" },
        take: 5,
      });

      data = ujianData.map((item) => ({
        id: item.id,
        namaMahasiswa: item.mahasiswa?.name ?? null,
        nim: item.mahasiswa?.nim ?? null,
        foto: item.mahasiswa?.image ?? null,
        judul: item.judul ?? null,
        tanggal: item.tanggalUjian ?? null,
        jamMulai: item.jamMulai ?? null,
        jamSelesai: item.jamSelesai ?? null,
        ruangan: item.ruangan?.nama ?? null,
        isDosenPembimbing: item.dosenPembimbingId === userId,
        prodi: item.mahasiswa?.prodi ?? null,
        angkatan: item.mahasiswa?.nim?.substring(0, 2) ?? null,
      }));
    }
    
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching dashboard bottom data:", error);
    return {
      success: false,
      error: "Terjadi kesalahan saat mengambil data",
    };
  }
}