"use server";

import { prisma } from "@/lib/prisma";

export async function verifyUserRole(
  userId: string,
  userRole: string
): Promise<{
  valid: boolean;
  currentRole?: string;
  sessionRole?: string;
}> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      return { valid: false };
    }

    const sessionRole = userRole;
    const currentRole = user.role;

    return {
      valid: sessionRole === currentRole,
      currentRole,
      sessionRole,
    };
  } catch (error) {
    console.error("Error verifying user role:", error);
    return { valid: false };
  }
}
