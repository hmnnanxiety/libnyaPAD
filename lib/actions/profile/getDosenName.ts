"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getDosenName() {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: "Anda harus login untuk mengakses dashboard",
    };
  }

  try {
    const namaDosen = await prisma.user.findMany({
      where: { role: "DOSEN" },
      select: {
        id: true,
        name: true,
      },
    });

    return {
      success: true,
      namaDosen,
    };
  } catch (error) {
    console.error("Unexpected error in dataRoleSpecific:", error);
    return {
      success: false,
      error: "Terjadi kesalahan saat memproses data",
    };
  }
}
