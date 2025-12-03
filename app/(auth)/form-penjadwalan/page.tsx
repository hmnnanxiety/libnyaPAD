import { getAllPengajuan } from "@/lib/actions/adminPengajuan/getPengajuan";
import PenjadwalanClient from "@/components/form-penjadwalan/fp-client";

export default async function PenjadwalanPage() {
  const result = await getAllPengajuan({ status: "DITERIMA" });

  return (
    <div className="space-y-6 p-6">
      <PenjadwalanClient initialData={result.data || []} />
    </div>
  );
}
