import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAllPengajuan } from "@/lib/actions/manajemenPengajuanFormPendaftaran/manajemenPengajuanFormPendaftaran";
import PengajuanClient from "@/components/pengajuan/p-client";

export default async function PengajuanPage() {
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

  const result = await getAllPengajuan();

  return (
    <div className="space-y-6 p-6">
      <PengajuanClient initialData={result.data || []} />
    </div>
  );
}