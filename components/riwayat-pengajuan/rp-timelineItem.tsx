"use client";

import { Bell } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

interface Notification {
  id: string;
  message: string;
  createdAt: Date;
  ujian: {
    judul: string;
    tanggalUjian: Date | null;
    jamMulai: Date | null;
    mahasiswa: {
      name: string | null;
    };
  };
}

interface TimelineItemProps {
  notification: Notification;
  isLast: boolean;
}

export function TimelineItem({ notification, isLast }: TimelineItemProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const getRelativeTime = (date: Date) => {
    try {
      return formatDistanceToNow(new Date(date), {
        addSuffix: true,
        locale: id,
      });
    } catch {
      // Fallback if date-fns fails
      const now = new Date();
      const notifDate = new Date(date);
      const diffInMs = now.getTime() - notifDate.getTime();
      const diffInMinutes = Math.floor(diffInMs / 60000);
      const diffInHours = Math.floor(diffInMinutes / 60);
      const diffInDays = Math.floor(diffInHours / 24);

      if (diffInMinutes < 1) return "Baru saja";
      if (diffInMinutes < 60) return `${diffInMinutes} menit yang lalu`;
      if (diffInHours < 24) return `${diffInHours} jam yang lalu`;
      if (diffInDays === 1) return "Kemarin";
      if (diffInDays < 7) return `${diffInDays} hari yang lalu`;
      return formatDate(date);
    }
  };

  return (
    <div className="flex gap-4 pb-8 relative">
      {/* Timeline Line & Icon */}
      <div className="flex flex-col items-center">
        {/* Icon Container */}
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 border-2 border-blue-500 relative z-10">
          <Bell className="h-5 w-5 text-blue-600" />
        </div>

        {/* Vertical Line */}
        {!isLast && (
          <div className="w-0.5 h-full bg-blue-200 absolute top-10 left-5" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pt-1">
        {/* Date */}
        <div className="text-lg font-semibold text-gray-900 mb-1">
          {formatDate(notification.createdAt)}
        </div>

        {/* Message */}
        <div className="text-base text-gray-700 mb-2">
          {notification.message}
        </div>

        {/* Relative Time */}
        <div className="text-sm text-muted-foreground">
          {getRelativeTime(notification.createdAt)}
        </div>
      </div>
    </div>
  );
}