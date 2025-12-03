"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { getNotifications } from "@/lib/actions/notifikasi/notifications";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Bell } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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

export default function NotifikasiPage() {
  const { data: session, status } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadNotifications() {
      if (status === "loading") return;

      if (!session?.user) {
        setError("Anda harus login untuk melihat notifikasi");
        setIsLoading(false);
        return;
      }

      if (session.user.role !== "DOSEN") {
        setError("Halaman ini hanya untuk dosen");
        setIsLoading(false);
        return;
      }

      try {
        const result = await getNotifications();

        if (result.success && result.data) {
          setNotifications(result.data as Notification[]);
        } else {
          setError(result.error || "Gagal memuat notifikasi");
        }
      } catch (err) {
        console.error("Error loading notifications:", err);
        setError("Terjadi kesalahan saat memuat notifikasi");
      } finally {
        setIsLoading(false);
      }
    }

    loadNotifications();
  }, [session, status]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Show loading state
  if (status === "loading" || isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Card>
          <CardHeader>
            <CardTitle>Notifikasi</CardTitle>
            <CardDescription>Notifikasi terkait jadwal ujian</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error if not dosen or not logged in
  if (error) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <div>
              <CardTitle>Notifikasi</CardTitle>
              <CardDescription>Notifikasi terkait jadwal ujian</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>Belum ada notifikasi</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Jam</TableHead>
                    <TableHead>Notifikasi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notifications.map((notif) => (
                    <TableRow key={notif.id}>
                      <TableCell className="font-medium">
                        {formatDate(notif.createdAt)}
                      </TableCell>
                      <TableCell>{formatTime(notif.createdAt)}</TableCell>
                      <TableCell>{notif.message}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
