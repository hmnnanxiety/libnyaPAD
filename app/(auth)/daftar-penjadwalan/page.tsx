import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import DJClient from "@/components/detail-jadwal/dj-client";

export default async function DaftarPenjadwalanPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  const role = String(session.user.role || "").toUpperCase();
  
  // Hanya admin yang bisa akses
  if (role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Daftar Penjadwalan</h1>
        <p className="mt-1 text-sm text-gray-600">
          Kelola dan lihat semua jadwal ujian tugas akhir mahasiswa
        </p>
      </div>
      
      <DJClient role={role} />
    </div>
  );
}