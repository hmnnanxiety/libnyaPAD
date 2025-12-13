import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getNotifications } from "@/lib/actions/notifikasi/notifications";
import { RiwayatPengajuanClient } from "@/components/riwayat-pengajuan/rp-client";

interface PageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

export default async function RiwayatPengajuanPage({ searchParams }: PageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const params = await searchParams;
  const page = Number(params.page) || 1;
  
  const userRole = session.user.role || "MAHASISWA";

  // Fetch notifications data
  const result = await getNotifications(page, 50);

  if (!result.success || !result.data) {
    // Dynamic header for error state
    const pageTitle = userRole === "DOSEN" ? "Notifikasi" : "Riwayat Pengajuan";
    
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-red-700">{result.error || "Gagal memuat data"}</p>
        </div>
      </div>
    );
  }

  return (
    <RiwayatPengajuanClient
      initialData={result.data}
      pagination={result.pagination}
      userRole={userRole}
    />
  );
}