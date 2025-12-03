"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const updateProfileSchema = z.object({
  name: z
    .string()
    .min(1, "Nama tidak boleh kosong")
    .max(100, "Nama terlalu panjang"),
  nim: z.string().optional(),
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
    .or(z.literal("")), // ✅ Allow empty string
  dosenPembimbingId: z.string().optional().or(z.literal("")), // ✅ Allow empty string
});

export async function updateProfile(formData: FormData) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Anda harus login untuk mengupdate profil",
      };
    }

    // ✅ Only include dosenPembimbingId if it exists in formData
    const rawData: Record<string, string> = {
      name: formData.get("name") as string,
      nim: formData.get("nim") as string,
      prodi: formData.get("prodi") as string,
      telepon: formData.get("telepon") as string,
    };

    // ✅ Only add dosenPembimbingId if it's in the form (untuk MAHASISWA)
    if (formData.has("dosenPembimbingId")) {
      rawData.dosenPembimbingId = formData.get("dosenPembimbingId") as string;
    }

    const validationResult = updateProfileSchema.safeParse(rawData);

    if (!validationResult.success) {
      return {
        success: false,
        error: "Data tidak valid",
        fieldErrors: validationResult.error.flatten().fieldErrors,
      };
    }

    const data = validationResult.data;

    if (data.nim) {
      const existingUser = await prisma.user.findUnique({
        where: { nim: data.nim },
      });

      if (existingUser && existingUser.id !== session.user.id) {
        return {
          success: false,
          error: "NIM sudah digunakan oleh pengguna lain",
        };
      }
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: data.name,
        nim: data.nim || null,
        prodi: data.prodi || null,
        telepon: data.telepon || null,
        updatedAt: new Date(),
        dosenPembimbingId: data.dosenPembimbingId || null,
      },
    });

    revalidatePath("/profile");

    return {
      success: true,
      message: "Profil berhasil diperbarui",
    };
  } catch (error) {
    console.error("Error updating profile:", error);
    return {
      success: false,
      error: "Terjadi kesalahan saat memperbarui profil",
    };
  }
}

export async function getUserProfile() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Anda harus login untuk mengakses profil",
      };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        nim: true,
        prodi: true,
        departemen: true,
        telepon: true,
        createdAt: true,
        updatedAt: true,
        dosenPembimbingId: true,
      },
    });

    if (!user) {
      return {
        success: false,
        error: "Profil tidak ditemukan",
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
      error: "Terjadi kesalahan saat mengambil profil",
    };
  }
}
