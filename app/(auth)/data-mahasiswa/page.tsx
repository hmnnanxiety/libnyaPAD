import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { statistikMahasiswa } from "@/lib/actions/statistikDataMhsDsn/statistikMhs";
import { getDosenName } from "@/lib/actions/profile/getDosenName";
import { MahasiswaClient } from "@/components/data-mahasiswa/dm-client";

export default async function DataMahasiswaPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const allowedRoles = ["ADMIN"];
  if (!allowedRoles.includes(session.user.role || "")) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Akses Ditolak</h2>
          <p className="text-gray-600">Anda tidak memiliki akses ke halaman ini.</p>
        </div>
      </div>
    );
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