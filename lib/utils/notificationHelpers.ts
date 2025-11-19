/**
 * Format notification message with date/time
 * This is a utility function for formatting notification messages
 */
export function formatNotificationMessage(
  baseMessage: string,
  tanggalUjian?: Date | null,
  jamMulai?: Date | null
): string {
  if (tanggalUjian && jamMulai) {
    const date = new Date(tanggalUjian).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const time = new Date(jamMulai).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${baseMessage} pada ${date} pukul ${time}`;
  }
  return baseMessage;
}
