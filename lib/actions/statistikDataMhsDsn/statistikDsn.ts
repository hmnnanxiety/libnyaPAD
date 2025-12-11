"use server";

interface StatistikDosen {
  id: string;
  namaDosen: string | null;
  nip: string | null;
  jumlahBimbingan: number;
  jumlahDiuji: number;
  total: number;
}

interface DosenInfo {
  id: string;
  name: string | null;
  nim: string | null;
}

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function statistikDosen() {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      success: false,
      error: "Anda harus login untuk mengakses data statistik dosen",
    };
  }

  if (session?.user?.role !== "ADMIN") {
    return {
      success: false,
      error: "Anda tidak memiliki akses untuk mengakses data statistik dosen",
    };
  }

  try {
    const dosen = await prisma.user.findMany({
      where: { role: "DOSEN" },
      select: {
        id: true,
        name: true,
        nim: true,
        _count: {
          select: {
            ujianDosenPembimbing: true,
            ujianDosenPenguji: true,
          },
        },
      },
    });

    if (!dosen || dosen.length === 0) {
      return {
        success: false,
        error: new Error("Data dosen tidak ditemukan"),
      };
    }

    let totalWorkSum = 0;
    let mostWork = -Infinity;
    let leastWork = Infinity;
    let mostDosen: DosenInfo | null = null;
    let leastDosen: DosenInfo | null = null;

    const formattedDosen: StatistikDosen[] = dosen.map((d) => {
      const jumlahBimbingan = d._count.ujianDosenPembimbing;
      const jumlahDiuji = d._count.ujianDosenPenguji;
      const total = jumlahBimbingan + jumlahDiuji;

      totalWorkSum += total;
      if (total > mostWork) {
        mostWork = total;
        mostDosen = { id: d.id, name: d.name, nim: d.nim };
      }
      if (total < leastWork) {
        leastWork = total;
        leastDosen = { id: d.id, name: d.name, nim: d.nim };
      }

      return {
        id: d.id,
        namaDosen: d.name,
        nip: d.nim,
        jumlahBimbingan,
        jumlahDiuji,
        total,
      };
    });

    const average = Math.round((totalWorkSum / dosen.length) * 100) / 100;

    return {
      success: true,
      data: formattedDosen,
      most: mostWork,
      mostDosen,
      average,
      least: leastWork,
      leastDosen,
    };
  } catch (error) {
    console.error("Unexpected error in statistikDosen:", error);
    return {
      success: false,
      error: new Error("Terjadi kesalahan saat memproses data statistik dosen"),
    };
  }
}