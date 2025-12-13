import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DosenClient } from "@/components/data-dosen/dd-client";

export default async function DataDosenPage() {
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

  const dosen = await prisma.user.findMany({
    where: { role: "DOSEN" },
    select: {
      id: true,
      name: true,
      nim: true,
      email: true,
      image: true,
      departemen: true,
      telepon: true,
      prodi: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div className="space-y-6 p-6">
      <DosenClient dosen={dosen} />
    </div>
  );
}