"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StatusUjian } from "@/generated/prisma";

interface Data {
  id: string;
  namaMahasiswa: string | null;
  nim: string | null;
  foto: string | null;
  judulTugasAkhir: string | null;
  tanggal: Date | null;
  statusPengajuan: string | null;
}

interface PaginationParams {
  page?: number;
  limit?: number;
  status?: StatusUjian;
}

export async function manajemenPengajuanFormPendaftaran(
  params: PaginationParams = {}
) {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      success: false,
      error: "Anda harus login untuk mengakses data pengajuan form pendaftaran",
    };
  }

  if (session?.user?.role !== "ADMIN") {
    return {
      success: false,
      error:
        "Anda tidak memiliki akses untuk mengakses data pengajuan form pendaftaran",
    };
  }

  try {
    const { page = 1, limit = 10, status } = params;
    const skip = (page - 1) * limit;

    const whereClause: any = {};
    if (status) {
      whereClause.status = status;
    }

    const totalCount = await prisma.ujian.count({
      where: whereClause,
    });

    const ujianData = await prisma.ujian.findMany({
      where: whereClause,
      select: {
        id: true,
        mahasiswa: {
          select: {
            name: true,
            nim: true,
            image: true,
          },
        },
        judul: true,
        tanggalUjian: true,
        status: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    const data: Data[] = ujianData.map((item) => ({
      id: item.id,
      namaMahasiswa: item.mahasiswa?.name || null,
      nim: item.mahasiswa?.nim || null,
      foto: item.mahasiswa?.image || null,
      judulTugasAkhir: item.judul || null,
      tanggal: item.tanggalUjian || null,
      statusPengajuan: item.status || null,
    }));

    return {
      success: true,
      data,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: skip + ujianData.length < totalCount,
      },
    };
  } catch (error) {
    console.error(
      "Unexpected error in manajemenPengajuanFormPendaftaran:",
      error
    );
    return {
      success: false,
      error: "Terjadi kesalahan saat memproses data pengajuan form pendaftaran",
    };
  }
}
