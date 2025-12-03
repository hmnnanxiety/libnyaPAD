import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DosenClient } from "@/components/data-dosen/dd-client";

export default async function DataDosenPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
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