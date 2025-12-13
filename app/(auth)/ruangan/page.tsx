import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { RuanganClient } from "@/components/ruangan/r-client";

export default async function RuanganPage() {
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

  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <RuanganClient />
    </div>
  );
}