// src/app/(auth)/dashboard/page.tsx
import { auth } from "@/lib/auth";
import DashboardClient from "@/components/dashboard/dashboard-client";
import { dashboardTop } from "@/lib/actions/dashboard/dashboardTop";
import { dashBottom } from "@/lib/actions/dashboard/dashBottom";
import { getNotifications } from "@/lib/actions/notifikasi/notifications";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  const userRole = String(session.user.role || "").toUpperCase();

  // Fetch pengajuan data for admin (directly from prisma)
  let pengajuanData = null;
  if (userRole === "ADMIN") {
    try {
      const pengajuanList = await prisma.ujian.findMany({
        where: {
          status: {
            in: ["MENUNGGU_VERIFIKASI", "DITERIMA", "DITOLAK", "DIJADWALKAN"],
          },
        },
        select: {
          id: true,
          judul: true,
          berkasUrl: true,
          status: true,
          createdAt: true,
          tanggalUjian: true,
          mahasiswa: {
            select: {
              id: true,
              name: true,
              nim: true,
              prodi: true,
              image: true,
            },
          },
          dosenPembimbing: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      pengajuanData = { success: true, data: pengajuanList };
    } catch (error) {
      console.error("Error fetching pengajuan:", error);
      pengajuanData = { success: false, data: [] };
    }
  }

  // Fetch dashboard data
  const [topResult, bottomResult, notifResult] = await Promise.all([
    dashboardTop(),
    dashBottom(),
    userRole !== "ADMIN" ? getNotifications() : Promise.resolve(null),
  ]);

  const topData = topResult.success
    ? topResult
    : { data: [], error: topResult.error };

  const bottomData = bottomResult.success
    ? bottomResult
    : { data: [], error: bottomResult.error };

  // **LIMIT NOTIFIKASI 7 ITEM**
  const notifications =
    notifResult?.success && Array.isArray(notifResult.data)
      ? {
          ...notifResult,
          data: notifResult.data.slice(0, 7),
        }
      : { data: [] };

  return (
    <DashboardClient
      role={userRole}
      topData={topData}
      bottomData={bottomData}
      notifications={notifications}
      pengajuanData={pengajuanData}
    />
  );
}