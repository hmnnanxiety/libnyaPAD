import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import DaftarPenjadwalanClient from "@/components/riwayat-dan-laporan/rnl-client";

export default async function RiwayatDanLaporanPage() {
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
          <p className="text-gray-600">Halaman ini hanya dapat diakses oleh Admin Prodi.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <DaftarPenjadwalanClient />
    </div>
  );
}