"use server";

import { prisma } from "@/lib/prisma";
// import { getSupabaseAdmin } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { createNotification } from "../notifikasi/notifications";
import { generateRandomString } from "@/lib/utils/random";

export type FormState = {
  success: boolean;
  message: string;
};

export async function submitBerkas(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await auth();
  if (!session?.user || session.user.role !== "MAHASISWA") {
    return { success: false, message: "Akses ditolak." };
  }

  const file = formData.get("berkas") as File;
  const judul = formData.get("judul") as string;
  const dosenPembimbingId = formData.get("dosenPembimbingId") as string;

  if (!file || file.size === 0) {
    return { success: false, message: "Berkas ujian wajib diunggah." };
  }

  if (file.type !== "application/pdf") {
    return { success: false, message: "Hanya file PDF yang diperbolehkan." };
  }

  const fileExtension = file.name.split(".").pop()?.toLowerCase();
  if (!fileExtension || fileExtension !== "pdf") {
    return { success: false, message: "Hanya file PDF yang diperbolehkan." };
  }

  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return { success: false, message: "Ukuran file maksimal 10MB." };
  }

  if (!judul || !dosenPembimbingId) {
    return {
      success: false,
      message: "Judul dan dosen pembimbing wajib diisi.",
    };
  }

  try {
    // const supabaseAdmin = getSupabaseAdmin();

    const fileExtension = file.name.split(".").pop();
    const randomId = generateRandomString(4);
    const fileName = `${randomId}-${Date.now()}.${fileExtension}`;
    const filePath = `public/${fileName}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("dokumen")
      .upload(filePath, file);

    if (uploadError) {
      console.error("Supabase Upload Error:", uploadError.message);
      return {
        success: false,
        message: `Gagal mengunggah file: ${uploadError.message}`,
      };
    }

    const { data: urlData } = supabaseAdmin.storage
      .from("dokumen")
      .getPublicUrl(filePath);

    if (!urlData.publicUrl) {
      return { success: false, message: "Gagal mendapatkan URL publik file." };
    }

    const publicUrl = urlData.publicUrl;

    const newUjian = await prisma.ujian.create({
      data: {
        judul: judul,
        berkasUrl: publicUrl,
        mahasiswaId: session.user.id,
        dosenPembimbingId: dosenPembimbingId,
        status: "MENUNGGU_VERIFIKASI",
      },
    });

    await createNotification(
      session.user.id,
      newUjian.id,
      "Pengajuan telah dibuat dan dikirim ke sistem"
    );

    revalidatePath("/dashboard");
    return { success: true, message: "Pengajuan ujian berhasil dikirim." };
  } catch (e: unknown) {
    console.error("Error:", e instanceof Error ? e.message : String(e));
    return { success: false, message: "Terjadi kesalahan pada server." };
  }
}
