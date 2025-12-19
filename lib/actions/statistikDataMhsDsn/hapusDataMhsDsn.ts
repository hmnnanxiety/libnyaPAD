"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const cekMhsData = async (id: string) => {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return { success: false, error: "Akses ditolak" };
    }

    const ujians = await prisma.ujian.findMany({
      where: {
        mahasiswaId: id,
      },
      select: {
        id: true,
        judul: true,
        status: true,
        tanggalUjian: true,
        dosenPembimbing: {
          select: {
            name: true,
            id: true,
          },
        },
        dosenPenguji: {
          select: {
            dosen: {
              select: {
                name: true,
                id: true,
              },
            },
          },
        },
      },
    });
    return { success: true, data: ujians };
  } catch (error) {
    return { success: false, error };
  }
};

export const cekDsnData = async (id: string) => {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return { success: false, error: "Akses ditolak" };
    }

    const ujianPembimbing = await prisma.ujian.findMany({
      where: {
        dosenPembimbingId: id,
      },
      select: {
        id: true,
        judul: true,
        status: true,
        tanggalUjian: true,
        mahasiswa: {
          select: {
            name: true,
            nim: true,
          },
        },
      },
    });
    const ujianPenguji = await prisma.ujianDosenPenguji.findMany({
      where: {
        dosenId: id,
      },
      select: {
        ujianId: true,
        dosenId: true,
        ujian: {
          select: {
            id: true,
            judul: true,
            status: true,
            tanggalUjian: true,
            mahasiswa: {
              select: {
                name: true,
                nim: true,
              },
            },
          },
        },
      },
    });

    return {
      success: true,
      data: {
        dosenPembimbing: ujianPembimbing,
        dosenPenguji: ujianPenguji,
      },
    };
  } catch (error) {
    return { success: false, error };
  }
};

export const hapusDataMhs = async (id: string) => {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return { success: false, error: "Akses ditolak" };
    }

    await prisma.ujianDosenPenguji.deleteMany({
      where: {
        ujian: {
          mahasiswaId: id,
        },
      },
    });

    await prisma.ujian.deleteMany({
      where: {
        mahasiswaId: id,
      },
    });

    const user = await prisma.user.delete({
      where: {
        id: id,
      },
    });
    return { success: true, data: user };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, error };
  }
};

export const hapusDataDsn = async (id: string) => {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return { success: false, error: "Akses ditolak" };
    }

    await prisma.ujianDosenPenguji.deleteMany({
      where: {
        dosenId: id,
      },
    });

    await prisma.user.updateMany({
      where: {
        dosenPembimbingId: id,
      },
      data: {
        dosenPembimbingId: null,
      },
    });

    await prisma.ujian.updateMany({
      where: {
        dosenPembimbingId: id,
      },
      data: {
        dosenPembimbingId: null,
      },
    });

    const user = await prisma.user.delete({
      where: {
        id: id,
      },
    });
    return { success: true, data: user };
  } catch (error) {
    console.error("Error deleting dosen:", error);
    return { success: false, error };
  }
};
