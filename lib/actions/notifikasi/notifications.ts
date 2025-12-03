"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function createNotification(
  userId: string,
  ujianId: string,
  message: string
) {
  try {
    await prisma.notification.create({
      data: {
        userId,
        ujianId,
        message,
      },
    });
    return { success: true, message: "Notification created" };
  } catch (error) {
    console.error("Error creating notification:", error);
    return { success: false, error: "Failed to create notification" };
  }
}

export async function createMultipleNotifications(
  notifications: Array<{ userId: string; ujianId: string; message: string }>
) {
  try {
    await prisma.notification.createMany({
      data: notifications,
    });
    return { success: true, message: "Notifications created" };
  } catch (error) {
    console.error("Error creating notifications:", error);
    return { success: false, error: "Failed to create notifications" };
  }
}

export async function getNotifications(page = 1, limit = 10) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Anda harus login untuk melihat notifikasi",
      };
    }

    const skip = (page - 1) * limit;

    // Get total count
    const totalCount = await prisma.notification.count({
      where: {
        userId: session.user.id,
      },
    });

    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        ujian: {
          select: {
            judul: true,
            tanggalUjian: true,
            jamMulai: true,
            mahasiswa: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    return {
      success: true,
      data: notifications,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: skip + notifications.length < totalCount,
      },
    };
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return {
      success: false,
      error: "Terjadi kesalahan saat mengambil notifikasi",
    };
  }
}