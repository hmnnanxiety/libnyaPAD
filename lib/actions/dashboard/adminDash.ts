"use server";

import { prisma } from "@/lib/prisma";

export const dashboardAdmin = async () => {
  try {
    const pengajuanList = await prisma.ujian.findMany({
      where: {
        status: {
          in: ["MENUNGGU_VERIFIKASI", "DITERIMA", "DITOLAK", "DIJADWALKAN"],
        },
      },
      select: {
        id: true,
        judul: true,
        berkasUrl: true,
        status: true,
        createdAt: true,
        tanggalUjian: true,
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
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, data: pengajuanList };
  } catch (error) {
    console.error("Error fetching pengajuan:", error);
    return { success: false, data: [] };
  }
};
