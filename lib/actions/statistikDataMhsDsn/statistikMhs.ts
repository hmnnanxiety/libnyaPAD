"use server";

interface StatistikMahasiswa {
  id: string;
  name: string | null;
  nim: string | null;
  email: string | null;
  image: string | null;
  role: "MAHASISWA" | "DOSEN";
  prodi: string | null;
  telepon: string | null;
  dosenPembimbingId: string | null;
}

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function statistikMahasiswa() {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      success: false,
      error: "Anda harus login untuk mengakses data statistik mahasiswa",
    };
  }

  if (session?.user?.role !== "ADMIN") {
    return {
      success: false,
      error: "Anda tidak memiliki akses untuk mengakses data statistik mahasiswa",
    };
  }

  try {
    const mahasiswa = await prisma.user.findMany({
      where: { role: "MAHASISWA" },
      select: {
        id: true,
        name: true,
        nim: true,
        email: true,
        image: true,
        role: true,
        prodi: true,
        telepon: true,
        dosenPembimbingId: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    if (!mahasiswa) {
      return {
        success: false,
        error: "Data mahasiswa tidak ditemukan",
      };
    }

    return {
      success: true,
      data: mahasiswa as StatistikMahasiswa[],
    };
  } catch (error) {
    console.error("Unexpected error in statistikMahasiswa:", error);
    return {
      success: false,
      error: "Terjadi kesalahan saat memproses data statistik mahasiswa",
    };
  }
}