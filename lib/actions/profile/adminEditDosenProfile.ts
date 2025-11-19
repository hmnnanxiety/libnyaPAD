"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const updateDosenProfileSchema = z.object({
  name: z
    .string()
    .min(1, "Nama tidak boleh kosong")
    .max(100, "Nama terlalu panjang"),
  departemen: z.string().min(1, "Departemen tidak boleh kosong").optional(),
  telepon: z
    .string()
    .regex(/^(\+62|62|0)[8-9][0-9]{7,11}$/, "Format nomor telepon tidak valid")
    .optional()
    .or(z.literal("")),
});

export async function updateDosenProfileByAdmin(
  userId: string,
  formData: FormData
) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "Akses ditolak. Hanya admin yang dapat mengedit profil dosen.",
      };
    }

    const rawData = {
      name: formData.get("name") as string,
      departemen: formData.get("departemen") as string,
      telepon: formData.get("telepon") as string,
    };

    const validationResult = updateDosenProfileSchema.safeParse(rawData);

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
        departemen: data.departemen || null,
        telepon: data.telepon || null,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/data-dosen");
    revalidatePath(`/data-dosen/${userId}`);

    return {
      success: true,
      message: "Profil dosen berhasil diperbarui",
    };
  } catch (error) {
    console.error("Error updating dosen profile:", error);
    return {
      success: false,
      error: "Terjadi kesalahan saat memperbarui profil dosen",
    };
  }
}

export async function getDosenProfile(userId: string) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "Akses ditolak. Hanya admin yang dapat mengakses profil dosen.",
      };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId, role: "DOSEN" },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        departemen: true,
        telepon: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return {
        success: false,
        error: "Profil dosen tidak ditemukan",
      };
    }

    return {
      success: true,
      data: user,
    };
  } catch (error) {
    console.error("Error fetching dosen profile:", error);
    return {
      success: false,
      error: "Terjadi kesalahan saat mengambil profil dosen",
    };
  }
}
