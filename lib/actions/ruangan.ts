"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const ruanganSchema = z.object({
  nama: z.string().min(1, "Nama ruangan wajib diisi"),
  deskripsi: z.string().optional(),
});

export async function getAllRuangan() {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "Akses ditolak",
      };
    }

    const ruangan = await prisma.ruangan.findMany({
      orderBy: {
        nama: "asc",
      },
    });

    return {
      success: true,
      data: ruangan,
    };
  } catch (error) {
    console.error("Error fetching ruangan:", error);
    return {
      success: false,
      error: "Terjadi kesalahan saat mengambil data ruangan",
    };
  }
}

export async function createRuangan(formData: FormData) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "Akses ditolak",
      };
    }

    const rawData = {
      nama: formData.get("nama") as string,
      deskripsi: formData.get("deskripsi") as string,
    };

    const validationResult = ruanganSchema.safeParse(rawData);

    if (!validationResult.success) {
      return {
        success: false,
        error: "Data tidak valid",
        fieldErrors: validationResult.error.flatten().fieldErrors,
      };
    }

    const { nama, deskripsi } = validationResult.data;

    // Check if nama already exists
    const existing = await prisma.ruangan.findUnique({
      where: { nama },
    });

    if (existing) {
      return {
        success: false,
        error: "Nama ruangan sudah ada",
      };
    }

    await prisma.ruangan.create({
      data: {
        nama,
        deskripsi: deskripsi || null,
      },
    });

    revalidatePath("/ruangan");

    return {
      success: true,
      message: "Ruangan berhasil ditambahkan",
    };
  } catch (error) {
    console.error("Error creating ruangan:", error);
    return {
      success: false,
      error: "Terjadi kesalahan saat membuat ruangan",
    };
  }
}

export async function updateRuangan(id: string, formData: FormData) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "Akses ditolak",
      };
    }

    const rawData = {
      nama: formData.get("nama") as string,
      deskripsi: formData.get("deskripsi") as string,
    };

    const validationResult = ruanganSchema.safeParse(rawData);

    if (!validationResult.success) {
      return {
        success: false,
        error: "Data tidak valid",
        fieldErrors: validationResult.error.flatten().fieldErrors,
      };
    }

    const { nama, deskripsi } = validationResult.data;

    // Check if nama already exists (excluding current)
    const existing = await prisma.ruangan.findFirst({
      where: {
        nama,
        id: { not: id },
      },
    });

    if (existing) {
      return {
        success: false,
        error: "Nama ruangan sudah ada",
      };
    }

    await prisma.ruangan.update({
      where: { id },
      data: {
        nama,
        deskripsi: deskripsi || null,
      },
    });

    revalidatePath("/ruangan");

    return {
      success: true,
      message: "Ruangan berhasil diperbarui",
    };
  } catch (error) {
    console.error("Error updating ruangan:", error);
    return {
      success: false,
      error: "Terjadi kesalahan saat memperbarui ruangan",
    };
  }
}

export async function deleteRuangan(id: string) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "Akses ditolak",
      };
    }

    // Check if ruangan is being used
    const ujianCount = await prisma.ujian.count({
      where: { ruanganId: id },
    });

    if (ujianCount > 0) {
      return {
        success: false,
        error:
          "Ruangan tidak dapat dihapus karena sedang digunakan dalam jadwal ujian",
      };
    }

    await prisma.ruangan.delete({
      where: { id },
    });

    revalidatePath("/ruangan");

    return {
      success: true,
      message: "Ruangan berhasil dihapus",
    };
  } catch (error) {
    console.error("Error deleting ruangan:", error);
    return {
      success: false,
      error: "Terjadi kesalahan saat menghapus ruangan",
    };
  }
}
