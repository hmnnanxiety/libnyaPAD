"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface UserProfile {
  id: string;
  name: string | null;
  nim: string | null;
  prodi: string | null;
  departemen: string | null;
  dosenPembimbingId: string | null; 
  dosenPembimbing: string | null;
}

export async function DataProfile() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Anda harus login untuk mengakses profil",
      };
    }

    if (session.user.role !== "MAHASISWA") {
      return {
        success: false,
        error:
          "Akses ditolak. Hanya mahasiswa yang dapat mengakses data profil.",
      };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        nim: true,
        prodi: true,
        telepon: true,
        email: true,
        departemen: true,
        dosenPembimbingId: true, 
        dosenPembimbing: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!user) {
      return {
        success: false,
        error: "User tidak ditemukan.",
      };
    }

    if (
      !user.name ||
      !user.nim ||
      !user.prodi ||
      !user.departemen ||
      !user.dosenPembimbing ||
      !user.telepon ||
      !user.email
    ) {
      return {
        success: false,
        error: "Data profil tidak lengkap. Silakan lengkapi data Anda.",
      };
    }

    const cleaned: UserProfile = {
      id: user.id,
      name: user.name,
      nim: user.nim,
      prodi: user.prodi,
      departemen: user.departemen,
      dosenPembimbingId: user.dosenPembimbingId, 
      dosenPembimbing: user.dosenPembimbing ? user.dosenPembimbing.name : null,
    };

    return {
      success: true,
      data: cleaned,
    };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return {
      success: false,
      error: "Terjadi kesalahan saat mengambil profil",
    };
  }
}
