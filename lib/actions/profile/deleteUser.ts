"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteUser(userId: string) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "Akses ditolak. Hanya admin yang dapat menghapus user.",
      };
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        _count: {
          select: {
            ujianMahasiswa: true,
            ujianDosenPembimbing: true,
            ujianDosenPenguji: true,
          },
        },
      },
    });

    if (!user) {
      return {
        success: false,
        error: "User tidak ditemukan",
      };
    }

    // Check if user has related data
    const hasRelatedData =
      user._count.ujianMahasiswa > 0 ||
      user._count.ujianDosenPembimbing > 0 ||
      user._count.ujianDosenPenguji > 0;

    if (hasRelatedData) {
      return {
        success: false,
        error:
          "User tidak dapat dihapus karena memiliki data ujian terkait. Silakan hapus data ujian terlebih dahulu.",
      };
    }

    // Delete user
    await prisma.user.delete({
      where: { id: userId },
    });

    // Revalidate pages
    if (user.role === "MAHASISWA") {
      revalidatePath("/data-mahasiswa");
    } else if (user.role === "DOSEN") {
      revalidatePath("/data-dosen");
    }

    return {
      success: true,
      message: "User berhasil dihapus",
    };
  } catch (error) {
    console.error("Error deleting user:", error);
    return {
      success: false,
      error: "Terjadi kesalahan saat menghapus user",
    };
  }
}