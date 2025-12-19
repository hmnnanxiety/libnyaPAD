"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  createCalendarEvent,
  updateCalendarEvent,
} from "../googleCalendar/googleCalendar";
import { createMultipleNotifications } from "../notifikasi/notifications";
import { formatNotificationMessage } from "@/lib/utils/notificationHelpers";

export async function getAllDosen() {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "Akses ditolak",
      };
    }

    const dosen = await prisma.user.findMany({
      where: { role: "DOSEN" },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return {
      success: true,
      data: dosen,
    };
  } catch (error) {
    console.error("Error fetching dosen list:", error);
    return {
      success: false,
      error: "Terjadi kesalahan saat mengambil data dosen",
    };
  }
}

const assignUjianSchema = z.object({
  ujianId: z.string().min(1, "ID Ujian tidak valid"),
  dosenPenguji1Id: z.string().min(1, "Dosen Penguji 1 wajib dipilih"),
  dosenPenguji2Id: z.string().min(1, "Dosen Penguji 2 wajib dipilih"),
  tanggalUjian: z.string().min(1, "Tanggal ujian wajib diisi"),
  jamMulai: z.string().min(1, "Jam mulai wajib diisi"),
  jamSelesai: z.string().min(1, "Jam selesai wajib diisi"),
  ruanganId: z.string().min(1, "Ruangan wajib dipilih"),
});

export async function getUjianDetails(ujianId: string) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Anda harus login untuk mengakses halaman ini",
      };
    }

    if (session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "Akses ditolak. Hanya admin yang dapat mengakses halaman ini.",
      };
    }

    const ujian = await prisma.ujian.findUnique({
      where: { id: ujianId },
      select: {
        id: true,
        judul: true,
        berkasUrl: true,
        status: true,
        createdAt: true,
        mahasiswa: {
          select: {
            id: true,
            name: true,
            nim: true,
            prodi: true,
          },
        },
        dosenPembimbing: {
          select: {
            id: true,
            name: true,
          },
        },
        dosenPenguji: {
          select: {
            dosen: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        tanggalUjian: true,
        jamMulai: true,
        jamSelesai: true,
        ruangan: true,
      },
    });

    if (!ujian) {
      return {
        success: false,
        error: "Ujian tidak ditemukan",
      };
    }

    return {
      success: true,
      data: ujian,
    };
  } catch (error) {
    console.error("Error fetching ujian details:", error);
    return {
      success: false,
      error: "Terjadi kesalahan saat mengambil data ujian",
    };
  }
}

export async function getAvailableDosen(
  tanggalUjian: string,
  jamMulai: string,
  jamSelesai: string,
  excludeUjianId?: string
) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "Akses ditolak",
      };
    }

    const selectedDate = new Date(tanggalUjian);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return {
        success: false,
        error: "Tidak dapat menjadwalkan ujian pada tanggal yang sudah lewat",
      };
    }

    const [startHour, startMinute] = jamMulai.split(":").map(Number);
    const [endHour, endMinute] = jamSelesai.split(":").map(Number);

    const startTime = new Date(selectedDate);
    startTime.setUTCHours(startHour - 7, startMinute, 0, 0);

    const endTime = new Date(selectedDate);
    endTime.setUTCHours(endHour - 7, endMinute, 0, 0);

    if (endTime <= startTime) {
      return {
        success: false,
        error: "Jam selesai harus lebih besar dari jam mulai",
      };
    }

    const allDosen = await prisma.user.findMany({
      where: { role: "DOSEN" },
      select: {
        id: true,
        name: true,
      },
    });

    const conflictingExams = await prisma.ujian.findMany({
      where: {
        tanggalUjian: {
          gte: new Date(
            selectedDate.getFullYear(),
            selectedDate.getMonth(),
            selectedDate.getDate(),
            0,
            0,
            0,
            0
          ),
          lt: new Date(
            selectedDate.getFullYear(),
            selectedDate.getMonth(),
            selectedDate.getDate(),
            23,
            59,
            59,
            999
          ),
        },
        status: "DIJADWALKAN",
        jamMulai: { not: null },
        jamSelesai: { not: null },
        ...(excludeUjianId && { id: { not: excludeUjianId } }),
      },
      select: {
        id: true,
        jamMulai: true,
        jamSelesai: true,
        dosenPembimbingId: true,
        dosenPenguji: {
          select: {
            dosenId: true,
          },
        },
      },
    });

    const hasTimeOverlap = (
      exam1Start: Date,
      exam1End: Date,
      exam2Start: Date,
      exam2End: Date
    ) => {
      return exam1Start < exam2End && exam2Start < exam1End;
    };

    const busyDosenIds = new Set<string>();

    conflictingExams.forEach((exam) => {
      if (exam.jamMulai && exam.jamSelesai) {
        const examStart = new Date(exam.jamMulai);
        const examEnd = new Date(exam.jamSelesai);

        if (hasTimeOverlap(startTime, endTime, examStart, examEnd)) {
          if (exam.dosenPembimbingId) {
            busyDosenIds.add(exam.dosenPembimbingId);
          }

          exam.dosenPenguji.forEach((penguji) => {
            busyDosenIds.add(penguji.dosenId);
          });
        }
      }
    });

    const availableDosen = allDosen.filter(
      (dosen) => !busyDosenIds.has(dosen.id)
    );

    return {
      success: true,
      data: {
        available: availableDosen,
        busy: allDosen.filter((dosen) => busyDosenIds.has(dosen.id)),
      },
    };
  } catch (error) {
    console.error("Error getting available dosen:", error);
    return {
      success: false,
      error: "Terjadi kesalahan saat mengambil data dosen",
    };
  }
}

export async function getAllRuangan() {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "Akses ditolak",
      };
    }

    const ruangan = await prisma.ruangan.findMany({
      select: {
        id: true,
        nama: true,
        deskripsi: true,
      },
      orderBy: {
        nama: "asc",
      },
    });

    return {
      success: true,
      data: ruangan,
    };
  } catch (error) {
    console.error("Error getting all ruangan:", error);
    return {
      success: false,
      error: "Terjadi kesalahan saat mengambil data ruangan",
    };
  }
}

export async function getAvailableRuangan(
  tanggalUjian: string,
  jamMulai: string,
  jamSelesai: string,
  excludeUjianId?: string
) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "Akses ditolak",
      };
    }

    const selectedDate = new Date(tanggalUjian);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return {
        success: false,
        error: "Tidak dapat menjadwalkan ujian pada tanggal yang sudah lewat",
      };
    }

    const [startHour, startMinute] = jamMulai.split(":").map(Number);
    const [endHour, endMinute] = jamSelesai.split(":").map(Number);

    const startTime = new Date(selectedDate);
    startTime.setUTCHours(startHour - 7, startMinute, 0, 0);

    const endTime = new Date(selectedDate);
    endTime.setUTCHours(endHour - 7, endMinute, 0, 0);

    if (endTime <= startTime) {
      return {
        success: false,
        error: "Jam selesai harus lebih besar dari jam mulai",
      };
    }

    const allRuangan = await prisma.ruangan.findMany({
      select: {
        id: true,
        nama: true,
        deskripsi: true,
      },
      orderBy: {
        nama: "asc",
      },
    });

    const conflictingExams = await prisma.ujian.findMany({
      where: {
        tanggalUjian: {
          gte: new Date(
            selectedDate.getFullYear(),
            selectedDate.getMonth(),
            selectedDate.getDate(),
            0,
            0,
            0,
            0
          ),
          lt: new Date(
            selectedDate.getFullYear(),
            selectedDate.getMonth(),
            selectedDate.getDate(),
            23,
            59,
            59,
            999
          ),
        },
        status: "DIJADWALKAN",
        jamMulai: { not: null },
        jamSelesai: { not: null },
        ruanganId: { not: null },
        ...(excludeUjianId && { id: { not: excludeUjianId } }),
      },
      select: {
        id: true,
        jamMulai: true,
        jamSelesai: true,
        ruanganId: true,
      },
    });

    const hasTimeOverlap = (
      exam1Start: Date,
      exam1End: Date,
      exam2Start: Date,
      exam2End: Date
    ) => {
      return exam1Start < exam2End && exam2Start < exam1End;
    };

    const busyRuanganIds = new Set<string>();

    conflictingExams.forEach((exam) => {
      if (exam.jamMulai && exam.jamSelesai && exam.ruanganId) {
        const examStart = new Date(exam.jamMulai);
        const examEnd = new Date(exam.jamSelesai);

        if (hasTimeOverlap(startTime, endTime, examStart, examEnd)) {
          busyRuanganIds.add(exam.ruanganId);
        }
      }
    });

    const availableRuangan = allRuangan.filter(
      (ruangan) => !busyRuanganIds.has(ruangan.id)
    );

    return {
      success: true,
      data: {
        available: availableRuangan,
        busy: allRuangan.filter((ruangan) => busyRuanganIds.has(ruangan.id)),
      },
    };
  } catch (error) {
    console.error("Error getting available ruangan:", error);
    return {
      success: false,
      error: "Terjadi kesalahan saat mengambil data ruangan",
    };
  }
}

export async function assignUjian(formData: FormData) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Anda harus login untuk melakukan aksi ini",
      };
    }

    if (session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "Akses ditolak. Hanya admin yang dapat mengakses halaman ini.",
      };
    }

    const rawData = {
      ujianId: formData.get("ujianId") as string,
      dosenPenguji1Id: formData.get("dosenPenguji1") as string,
      dosenPenguji2Id: formData.get("dosenPenguji2") as string,
      tanggalUjian: formData.get("tanggalUjian") as string,
      jamMulai: formData.get("jamMulai") as string,
      jamSelesai: formData.get("jamSelesai") as string,
      ruanganId: formData.get("ruanganId") as string,
    };

    const validationResult = assignUjianSchema.safeParse(rawData);

    if (!validationResult.success) {
      return {
        success: false,
        error: "Data tidak valid",
        fieldErrors: validationResult.error.flatten().fieldErrors,
      };
    }

    const data = validationResult.data;

    const selectedDate = new Date(data.tanggalUjian);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return {
        success: false,
        error: "Tidak dapat menjadwalkan ujian pada tanggal yang sudah lewat",
      };
    }

    if (data.dosenPenguji1Id === data.dosenPenguji2Id) {
      return {
        success: false,
        error: "Dosen Penguji 1 dan Dosen Penguji 2 harus berbeda",
      };
    }

    const ujian = await prisma.ujian.findUnique({
      where: { id: data.ujianId },
      include: {
        mahasiswa: {
          select: {
            email: true,
            name: true,
          },
        },
        dosenPembimbing: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!ujian) {
      return {
        success: false,
        error: "Ujian tidak ditemukan",
      };
    }

    if (!ujian.dosenPembimbing) {
      return {
        success: false,
        error: "Dosen pembimbing belum ditentukan untuk ujian ini",
      };
    }

    if (
      data.dosenPenguji1Id === ujian.dosenPembimbing.id ||
      data.dosenPenguji2Id === ujian.dosenPembimbing.id
    ) {
      return {
        success: false,
        error: `Dosen pembimbing (${ujian.dosenPembimbing.name}) tidak dapat menjadi dosen penguji`,
      };
    }

    const tanggalUjian = new Date(data.tanggalUjian);
    const [jamMulaiHour, jamMulaiMinute] = data.jamMulai.split(":");
    const [jamSelesaiHour, jamSelesaiMinute] = data.jamSelesai.split(":");

    const jamMulai = new Date(tanggalUjian);
    jamMulai.setUTCHours(parseInt(jamMulaiHour) - 7, parseInt(jamMulaiMinute));

    const jamSelesai = new Date(tanggalUjian);
    jamSelesai.setUTCHours(
      parseInt(jamSelesaiHour) - 7,
      parseInt(jamSelesaiMinute)
    );

    const availabilityCheck = await getAvailableDosen(
      data.tanggalUjian,
      data.jamMulai,
      data.jamSelesai,
      data.ujianId
    );

    if (!availabilityCheck.success) {
      return {
        success: false,
        error: availabilityCheck.error || "Gagal memeriksa ketersediaan dosen",
      };
    }

    const ruanganAvailabilityCheck = await getAvailableRuangan(
      data.tanggalUjian,
      data.jamMulai,
      data.jamSelesai,
      data.ujianId
    );

    if (!ruanganAvailabilityCheck.success) {
      return {
        success: false,
        error:
          ruanganAvailabilityCheck.error ||
          "Gagal memeriksa ketersediaan ruangan",
      };
    }

    const availableDosenIds = new Set(
      availabilityCheck.data?.available.map((d) => d.id) || []
    );

    const availableRuanganIds = new Set(
      ruanganAvailabilityCheck.data?.available.map((r) => r.id) || []
    );

    if (!availableDosenIds.has(ujian.dosenPembimbing.id)) {
      return {
        success: false,
        error: `Dosen pembimbing ${ujian.dosenPembimbing.name} sudah memiliki jadwal ujian pada waktu tersebut`,
      };
    }

    if (!availableDosenIds.has(data.dosenPenguji1Id)) {
      const dosenPenguji1 = await prisma.user.findUnique({
        where: { id: data.dosenPenguji1Id },
        select: { name: true },
      });
      return {
        success: false,
        error: `Dosen penguji 1 (${dosenPenguji1?.name}) sudah memiliki jadwal ujian pada waktu tersebut`,
      };
    }

    if (!availableDosenIds.has(data.dosenPenguji2Id)) {
      const dosenPenguji2 = await prisma.user.findUnique({
        where: { id: data.dosenPenguji2Id },
        select: { name: true },
      });
      return {
        success: false,
        error: `Dosen penguji 2 (${dosenPenguji2?.name}) sudah memiliki jadwal ujian pada waktu tersebut`,
      };
    }

    if (!availableRuanganIds.has(data.ruanganId)) {
      const ruangan = await prisma.ruangan.findUnique({
        where: { id: data.ruanganId },
        select: { nama: true },
      });
      return {
        success: false,
        error: `Ruangan ${ruangan?.nama} sudah digunakan untuk ujian lain pada waktu tersebut`,
      };
    }

    const ruangan = await prisma.ruangan.findUnique({
      where: { id: data.ruanganId },
      select: { nama: true },
    });

    if (!ruangan) {
      return {
        success: false,
        error: "Ruangan tidak ditemukan",
      };
    }

    const dosenPenguji1 = await prisma.user.findUnique({
      where: { id: data.dosenPenguji1Id },
      select: { email: true, name: true },
    });

    const dosenPenguji2 = await prisma.user.findUnique({
      where: { id: data.dosenPenguji2Id },
      select: { email: true, name: true },
    });

    if (!dosenPenguji1 || !dosenPenguji2) {
      return {
        success: false,
        error: "Dosen penguji tidak ditemukan",
      };
    }

    const attendeeEmails: string[] = [];

    if (ujian.mahasiswa.email) {
      attendeeEmails.push(ujian.mahasiswa.email);
    }

    if (ujian.dosenPembimbing.email) {
      attendeeEmails.push(ujian.dosenPembimbing.email);
    }

    if (dosenPenguji1.email) {
      attendeeEmails.push(dosenPenguji1.email);
    }
    if (dosenPenguji2.email) {
      attendeeEmails.push(dosenPenguji2.email);
    }

    const description = `SIMPENSI - ${ujian.judul} - ${
      ruangan.nama
    } - Pembimbing: ${ujian.dosenPembimbing.name || "N/A"} / Penguji: ${
      dosenPenguji1.name || "N/A"
    }, ${dosenPenguji2.name || "N/A"}`;

    let calendarEventId = ujian.googleCalendarEventId;
    let calendarResult;
    let calendarCreated = false;

    try {
      if (calendarEventId) {
        calendarResult = await updateCalendarEvent(calendarEventId, {
          summary: `Ujian TA - ${ujian.mahasiswa.name}`,
          description: description,
          location: ruangan.nama,
          startDateTime: jamMulai.toISOString(),
          endDateTime: jamSelesai.toISOString(),
          attendees: attendeeEmails,
        });
      } else {
        calendarResult = await createCalendarEvent({
          summary: `Ujian TA - ${ujian.mahasiswa.name}`,
          description: description,
          location: ruangan.nama,
          startDateTime: jamMulai.toISOString(),
          endDateTime: jamSelesai.toISOString(),
          attendees: attendeeEmails,
        });

        if (calendarResult.success && calendarResult.eventId) {
          calendarEventId = calendarResult.eventId;
        }
      }

      if (calendarResult.success) {
        calendarCreated = true;
      } else {
        console.warn(
          "Calendar event creation/update failed:",
          calendarResult.error
        );
      }
    } catch (calendarError) {
      console.error(
        "Error during calendar operation (continuing anyway):",
        calendarError
      );
      calendarResult = {
        success: false,
        error: "Gagal membuat event kalender, tapi penjadwalan tetap berhasil",
      };
    }

    const isNewSchedule = ujian.status !== "DIJADWALKAN";

    await prisma.$transaction(async (tx) => {
      await tx.ujian.update({
        where: { id: data.ujianId },
        data: {
          status: "DIJADWALKAN",
          tanggalUjian: tanggalUjian,
          jamMulai: jamMulai,
          jamSelesai: jamSelesai,
          ruanganId: data.ruanganId,
          googleCalendarEventId: calendarEventId,
          updatedAt: new Date(),
        },
      });

      await tx.ujianDosenPenguji.deleteMany({
        where: { ujianId: data.ujianId },
      });

      await tx.ujianDosenPenguji.createMany({
        data: [
          {
            ujianId: data.ujianId,
            dosenId: data.dosenPenguji1Id,
          },
          {
            ujianId: data.ujianId,
            dosenId: data.dosenPenguji2Id,
          },
        ],
      });
    });

    const notifications = [];

    if (isNewSchedule) {
      notifications.push({
        userId: ujian.mahasiswaId,
        ujianId: data.ujianId,
        message: formatNotificationMessage(
          "Ujian telah dijadwalkan oleh admin prodi",
          tanggalUjian,
          jamMulai
        ),
      });

      notifications.push({
        userId: ujian.dosenPembimbing.id,
        ujianId: data.ujianId,
        message: formatNotificationMessage(
          `Pengajuan oleh ${
            ujian.mahasiswa.name || "mahasiswa"
          } sudah dijadwalkan`,
          tanggalUjian,
          jamMulai
        ),
      });

      notifications.push({
        userId: data.dosenPenguji1Id,
        ujianId: data.ujianId,
        message: formatNotificationMessage(
          `Pengajuan oleh ${
            ujian.mahasiswa.name || "mahasiswa"
          } sudah dijadwalkan`,
          tanggalUjian,
          jamMulai
        ),
      });

      notifications.push({
        userId: data.dosenPenguji2Id,
        ujianId: data.ujianId,
        message: formatNotificationMessage(
          `Pengajuan oleh ${
            ujian.mahasiswa.name || "mahasiswa"
          } sudah dijadwalkan`,
          tanggalUjian,
          jamMulai
        ),
      });
    } else {
      const newDate = tanggalUjian.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      notifications.push({
        userId: ujian.dosenPembimbing.id,
        ujianId: data.ujianId,
        message: formatNotificationMessage(
          `Jadwal ujian ${
            ujian.mahasiswa.name || "mahasiswa"
          } diubah ke ${newDate}`,
          tanggalUjian,
          jamMulai
        ),
      });

      notifications.push({
        userId: data.dosenPenguji1Id,
        ujianId: data.ujianId,
        message: formatNotificationMessage(
          `Jadwal ujian ${
            ujian.mahasiswa.name || "mahasiswa"
          } diubah ke ${newDate}`,
          tanggalUjian,
          jamMulai
        ),
      });

      notifications.push({
        userId: data.dosenPenguji2Id,
        ujianId: data.ujianId,
        message: formatNotificationMessage(
          `Jadwal ujian ${
            ujian.mahasiswa.name || "mahasiswa"
          } diubah ke ${newDate}`,
          tanggalUjian,
          jamMulai
        ),
      });
    }

    await createMultipleNotifications(notifications);

    revalidatePath("/detail-jadwal");
    revalidatePath(`/admin-assign/${data.ujianId}`);

    let successMessage =
      "Ujian berhasil dijadwalkan dan dosen penguji berhasil ditugaskan";

    if (calendarCreated && calendarResult?.success) {
      successMessage +=
        ". Event Google Calendar telah dibuat dan undangan dikirim ke semua peserta.";
    } else if (calendarResult?.needsReauth) {
      successMessage +=
        ". Namun, untuk membuat event Google Calendar, Anda perlu menyambungkan ulang akun Google. Silakan klik profil Anda, sign out, lalu sign in kembali.";
    } else if (!calendarCreated) {
      successMessage +=
        ". Event Google Calendar tidak dapat dibuat, tapi jadwal ujian tetap tersimpan. Anda dapat membuat event kalender secara manual atau menyambungkan ulang akun Google Anda.";
    }

    return {
      success: true,
      message: successMessage,
      calendarEventLink:
        calendarCreated && calendarResult?.success
          ? calendarResult.htmlLink
          : undefined,
      needsCalendarReauth: calendarResult?.needsReauth || false,
    };
  } catch (error) {
    console.error("Error assigning ujian:", error);
    return {
      success: false,
      error: "Terjadi kesalahan saat menjadwalkan ujian",
    };
  }
}

export async function getDosenPembimbingSchedule(mahasiswaId: string) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "Akses ditolak",
      };
    }

    const ujian = await prisma.ujian.findFirst({
      where: {
        mahasiswaId,
        status: "DITERIMA",
      },
      select: {
        dosenPembimbingId: true,
        dosenPembimbing: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!ujian || !ujian.dosenPembimbingId) {
      return {
        success: false,
        error: "Dosen pembimbing tidak ditemukan untuk mahasiswa ini",
      };
    }

    const now = new Date();

    const schedules = await prisma.ujian.findMany({
      where: {
        dosenPembimbingId: ujian.dosenPembimbingId,
        status: "DIJADWALKAN",
        tanggalUjian: {
          gt: now,
        },
      },
      select: {
        id: true,
        judul: true,
        tanggalUjian: true,
        jamMulai: true,
        jamSelesai: true,
        ruangan: {
          select: {
            nama: true,
          },
        },
        mahasiswa: {
          select: {
            name: true,
            nim: true,
          },
        },
      },
      orderBy: {
        tanggalUjian: "asc",
      },
    });

    return {
      success: true,
      data: {
        dosen: ujian.dosenPembimbing,
        schedules,
      },
    };
  } catch (error) {
    console.error("Error getting dosen pembimbing schedule:", error);
    return {
      success: false,
      error: "Terjadi kesalahan saat mengambil jadwal dosen pembimbing",
    };
  }
}
