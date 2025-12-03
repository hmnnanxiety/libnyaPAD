"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bell, Loader2, Search } from "lucide-react";
import { TimelineItem } from "./rp-timelineItem";
import { getNotifications } from "@/lib/actions/notifikasi/notifications";

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

interface RiwayatPengajuanClientProps {
  initialData: Notification[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
  userRole: string;
}

export function RiwayatPengajuanClient({
  initialData,
  pagination: initialPagination,
  userRole,
}: RiwayatPengajuanClientProps) {
  const [notifications, setNotifications] = useState<Notification[]>(initialData);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(initialPagination?.page || 1);
  const [hasMore, setHasMore] = useState(initialPagination?.hasMore || false);

  // Filter and search notifications
  const filteredNotifications = notifications.filter((notif) => {
    // Apply status filter
    if (selectedFilter !== "all") {
      const message = notif.message.toLowerCase();
      let matchesFilter = false;

      switch (selectedFilter) {
        case "submitted":
          matchesFilter =
            message.includes("dibuat") ||
            message.includes("disubmit") ||
            message.includes("diajukan");
          break;
        case "verified":
          matchesFilter =
            message.includes("diverifikasi") ||
            message.includes("disetujui") ||
            message.includes("diterima");
          break;
        case "scheduled":
          matchesFilter = message.includes("dijadwalkan");
          break;
        case "rejected":
          matchesFilter = message.includes("ditolak");
          break;
        default:
          matchesFilter = true;
      }

      if (!matchesFilter) return false;
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        notif.message.toLowerCase().includes(query) ||
        notif.ujian.judul.toLowerCase().includes(query) ||
        notif.ujian.mahasiswa.name?.toLowerCase().includes(query);

      return matchesSearch;
    }

    return true;
  });

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    try {
      const result = await getNotifications(currentPage + 1, 50);

      if (result.success && result.data) {
        setNotifications([...notifications, ...result.data]);
        setCurrentPage(result.pagination?.page || currentPage + 1);
        setHasMore(result.pagination?.hasMore || false);
      }
    } catch (error) {
      console.error("Error loading more notifications:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Dynamic empty state message based on role
  const getEmptyStateMessage = () => {
    switch (userRole) {
      case "MAHASISWA":
        return {
          title: "Belum ada riwayat pengajuan",
          subtitle: "Notifikasi akan muncul setelah Anda mengajukan ujian",
        };
      case "DOSEN":
        return {
          title: "Belum ada notifikasi ujian",
          subtitle:
            "Notifikasi akan muncul ketika ada mahasiswa yang mengajukan ujian",
        };
      case "ADMIN":
        return {
          title: "Belum ada notifikasi pengajuan",
          subtitle: "Notifikasi akan muncul ketika ada pengajuan baru",
        };
      default:
        return {
          title: "Belum ada notifikasi",
          subtitle: "Notifikasi akan muncul di sini",
        };
    }
  };

  const emptyState = getEmptyStateMessage();

  return (
    <div className="space-y-6 p-6">
      {/* Header with Title and Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Riwayat Pengajuan</h1>

        {/* Search and Filter Controls */}
        <div className="flex items-center gap-3">
          {/* Search Input */}
          <div className="relative w-full md:w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cari notifikasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Filter Status */}
          <Select value={selectedFilter} onValueChange={setSelectedFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Semua Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="submitted">Diajukan</SelectItem>
              <SelectItem value="verified">Diverifikasi</SelectItem>
              <SelectItem value="scheduled">Dijadwalkan</SelectItem>
              <SelectItem value="rejected">Ditolak</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content Card */}
      <Card className="border-none shadow-sm">
        <CardContent className="pt-6">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-muted-foreground text-lg mb-2">
                {searchQuery ? "Tidak ada notifikasi yang cocok" : emptyState.title}
              </p>
              <p className="text-sm text-muted-foreground">
                {searchQuery
                  ? "Coba gunakan kata kunci yang berbeda"
                  : emptyState.subtitle}
              </p>
            </div>
          ) : (
            <div className="space-y-0">
              {filteredNotifications.map((notif, index) => (
                <TimelineItem
                  key={notif.id}
                  notification={notif}
                  isLast={index === filteredNotifications.length - 1}
                />
              ))}
            </div>
          )}

          {/* Load More Button */}
          {hasMore && filteredNotifications.length > 0 && (
            <div className="mt-6 text-center border-t pt-6">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memuat...
                  </>
                ) : (
                  "Muat Lebih Banyak"
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}