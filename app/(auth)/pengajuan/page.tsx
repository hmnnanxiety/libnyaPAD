import { getAllPengajuan } from "@/lib/actions/adminPengajuan/getPengajuan";
import PengajuanClient from "@/components/pengajuan/p-client";

export default async function PengajuanPage() {
  const result = await getAllPengajuan();

  // result.success selalu true sekarang
  return (
    <div className="space-y-6 p-6">
      <PengajuanClient initialData={result.data || []} />
    </div>
  );
}
