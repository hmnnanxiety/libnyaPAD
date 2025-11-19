"use server";

interface StatistikMahasiswa {
  id: string;
  namaMahasiswa: string | null;
  nim: string | null;
  prodi: string | null;
}

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function statistikMahasiswa() {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      success: false,
      error: new Error(
        "Anda harus login untuk mengakses data statistik mahasiswa"
      ),
    };
  }

  if (session?.user?.role !== "ADMIN") {
    return {
      success: false,
      error: new Error(
        "Anda tidak memiliki akses untuk mengakses data statistik mahasiswa"
      ),
    };
  }

  try {
    const mahasiswa = await prisma.user.findMany({
      where: { role: "MAHASISWA" },
      select: {
        id: true,
        name: true,
        nim: true,
        prodi: true,
      },
    });

    if (!mahasiswa) {
      return {
        success: false,
        error: new Error("Data mahasiswa tidak ditemukan"),
      };
    }

    return {
      success: true,
      data: mahasiswa,
    };
  } catch (error) {
    console.error("Unexpected error in statistikMahasiswa:", error);
    return {
      success: false,
      error: new Error(
        "Terjadi kesalahan saat memproses data statistik mahasiswa"
      ),
    };
  }
}
