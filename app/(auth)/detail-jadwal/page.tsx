import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import DJClient from "@/components/detail-jadwal/dj-client";

export default async function DetailJadwalPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  const role = String(session.user.role || "").toUpperCase();
  
  // Redirect admin ke halaman daftar-penjadwalan
  if (role === "ADMIN") {
    redirect("/daftar-penjadwalan");
  }

  const allowedRoles = ["DOSEN", "MAHASISWA"];
  if (!allowedRoles.includes(role)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Akses Ditolak</h2>
          <p className="text-gray-600">Anda tidak memiliki akses ke halaman ini.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Detail Jadwal</h1>
        <p className="mt-1 text-sm text-gray-600">
          {role === "MAHASISWA" 
            ? "Lihat jadwal ujian tugas akhir Anda" 
            : "Lihat jadwal ujian mahasiswa yang Anda bimbing/uji"}
        </p>
      </div>
      
      <DJClient role={role} />
    </div>
  );
}