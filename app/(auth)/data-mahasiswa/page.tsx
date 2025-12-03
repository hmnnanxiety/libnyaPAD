import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { statistikMahasiswa } from "@/lib/actions/statistikDataMhsDsn/statistikMhs";
import { getDosenName } from "@/lib/actions/profile/getDosenName";
import { MahasiswaClient } from "@/components/data-mahasiswa/dm-client";

export default async function DataMahasiswaPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const [mahasiswaResult, dosenResult] = await Promise.all([
    statistikMahasiswa(),
    getDosenName(),
  ]);

  if (!mahasiswaResult.success || !dosenResult.success) {
    return (
      <div className="space-y-6 p-6">
        <h1 className="text-3xl font-bold text-gray-900">Data Mahasiswa</h1>
        <div className="rounded-lg bg-red-50 p-4 text-red-600">
          {mahasiswaResult.error || dosenResult.error || "Gagal memuat data"}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <MahasiswaClient
        mahasiswa={mahasiswaResult.data || []}
        dosenList={dosenResult.namaDosen || []}
      />
    </div>
  );
}