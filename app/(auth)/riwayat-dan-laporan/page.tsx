import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import DaftarPenjadwalanClient from "@/components/riwayat-dan-laporan/rnl-client";

export default async function DaftarPenjadwalanPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Admin only access
  if (session.user.role !== "ADMIN") {
    return (
      <div className="space-y-6 p-6">
        <div className="rounded-lg bg-red-50 border border-red-200 p-6 text-center">
          <h2 className="text-xl font-bold text-red-800 mb-2">Akses Ditolak</h2>
          <p className="text-red-700">
            Halaman ini hanya dapat diakses oleh Admin Prodi.
          </p>
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