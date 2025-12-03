import { getNotifications } from "@/lib/actions/notifikasi/notifications";
import { RiwayatPengajuanClient } from "@/components/riwayat-pengajuan/rp-client";
import { auth } from "@/lib/auth";

interface PageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

export default async function RiwayatPengajuanPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  
  // Get user session for role
  const session = await auth();
  const userRole = session?.user?.role || "MAHASISWA";

  // Fetch notifications data
  const result = await getNotifications(page, 50);

  if (!result.success || !result.data) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Riwayat Pengajuan</h1>
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