"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, ArrowRight } from "lucide-react";
import Link from "next/link";

interface NotificationItem {
  message: string;
  createdAt: Date;
}

interface NotificationData {
  data?: NotificationItem[];
}

interface StatusNotificationProps {
  notifications: NotificationData;
}

export function StatusNotification({ notifications }: StatusNotificationProps) {
  const notifData = notifications?.data || [];
  const hasNotifications = notifData.length > 0;

  // Format date and time
  const formatDateTime = (date: Date) => {
    const d = new Date(date);
    const hours = d.getHours().toString().padStart(2, "0");
    const minutes = d.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  return (
    <Card className="border-none shadow-sm h-full flex flex-col overflow-hidden">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Notifikasi</CardTitle>
          {hasNotifications && (
            <Link href="/riwayat-pengajuan">
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-600 hover:text-blue-700"
              >
                View All
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
        <p className="text-sm text-gray-500">Hari Ini</p>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto pr-2">
        <div className="space-y-3">
          {!hasNotifications ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="h-12 w-12 text-gray-300 mb-3" />
              <p className="text-sm text-gray-500">Tidak ada notifikasi</p>
            </div>
          ) : (
            notifData.map((notif: NotificationItem, index: number) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="mt-1">
                  <div className="p-2 rounded-full bg-blue-50">
                    <Bell className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 line-clamp-2">
                    {notif.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDateTime(notif.createdAt)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}