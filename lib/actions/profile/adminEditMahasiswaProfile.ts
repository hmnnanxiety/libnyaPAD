"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const updateMahasiswaProfileSchema = z.object({
  name: z
    .string()
    .min(1, "Nama tidak boleh kosong")
    .max(100, "Nama terlalu panjang"),
  prodi: z
    .enum([
      "TeknologiRekayasaPerangkatLunak",
      "TeknologiRekayasaElektro",
      "TeknologiRekayasaInternet",
      "TeknologiRekayasaInstrumentasiDanKontrol",
    ])
    .optional(),
  telepon: z
    .string()
    .regex(/^(\+62|62|0)[8-9][0-9]{7,11}$/, "Format nomor telepon tidak valid")
    .optional()
    .or(z.literal("")),
  dosenPembimbingId: z.string().optional(),
  role: z.enum(["MAHASISWA", "DOSEN"])
});

export async function updateMahasiswaProfileByAdmin(
  userId: string,
  formData: FormData
) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return {
        success: false,
        error:
          "Akses ditolak. Hanya admin yang dapat mengedit profil mahasiswa.",
      };
    }

    const rawData = {
      name: formData.get("name") as string,
      prodi: formData.get("prodi") as string,
      telepon: formData.get("telepon") as string,
      dosenPembimbingId: formData.get("dosenPembimbingId") as string,
      role: formData.get("role") as string,
    };

    const validationResult = updateMahasiswaProfileSchema.safeParse(rawData);

    if (!validationResult.success) {
      return {
        success: false,
        error: "Data tidak valid",
        fieldErrors: validationResult.error.flatten().fieldErrors,
      };
    }

    const data = validationResult.data;

    await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        prodi: data.prodi || null,
        telepon: data.telepon || null,
        dosenPembimbingId: data.dosenPembimbingId || null,
        updatedAt: new Date(),
        role: data.role || "MAHASISWA",
      },
    });

    revalidatePath("/data-mahasiswa");
    revalidatePath(`/data-mahasiswa/${userId}`);

    return {
      success: true,
      message: "Profil mahasiswa berhasil diperbarui",
    };
  } catch (error) {
    console.error("Error updating mahasiswa profile:", error);
    return {
      success: false,
      error: "Terjadi kesalahan saat memperbarui profil mahasiswa",
    };
  }
}

export async function getMahasiswaProfile(userId: string) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return {
        success: false,
        error:
          "Akses ditolak. Hanya admin yang dapat mengakses profil mahasiswa.",
      };
    }

    // Remove role filter to allow editing both MAHASISWA and DOSEN
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        nim: true,
        prodi: true,
        telepon: true,
        dosenPembimbingId: true,
        dosenPembimbing: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return {
        success: false,
        error: "Profil pengguna tidak ditemukan",
      };
    }

    return {
      success: true,
      data: user,
    };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return {
      success: false,
      error: "Terjadi kesalahan saat mengambil profil pengguna",
    };
  }
}