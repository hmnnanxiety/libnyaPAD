import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { detailJadwal } from "@/lib/actions/detailJadwal/getDetailsUjianForAll";
import KalenderUtamaClient from "@/components/kalender-utama/ku-client";

export default async function KalenderUtamaPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const result = await detailJadwal();

  if (!result.success) {
    return (
      <div className="space-y-6 p-6">
        <div className="rounded-lg bg-red-50 p-4 text-red-800">
          {result.error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <KalenderUtamaClient 
        initialData={result.data || []} 
        userRole={session.user.role || "MAHASISWA"}
      />
    </div>
  );
}