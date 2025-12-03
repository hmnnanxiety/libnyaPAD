"use client";

import { useState } from "react";
import { TopSection } from "./dash-top";
import { BottomSection } from "./dash-bottom";
import { CalendarFull } from "./dash-calendar";
import dynamic from "next/dynamic";
import { PengajuanSection } from "./dash-pengajuan";
import BAModal from "@/components/berita-acara/ba-modal";

const StatusNotification = dynamic(
  () => import("./dash-notif").then((mod) => mod.StatusNotification),
  { ssr: false }
);

interface DashboardClientProps {
  role: string;
  topData: Record<string, unknown> | null;
  bottomData: Record<string, unknown> | null;
  notifications: Record<string, unknown> | null;
  pengajuanData: Record<string, unknown> | null;
}

export default function DashboardClient({
  role,
  topData,
  bottomData,
  notifications,
  pengajuanData,
}: DashboardClientProps) {
  const userRole = role?.toUpperCase();
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleEventClick = (examId: string) => {
    setSelectedId(examId);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedId(null);
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Main Grid: Left (Stats + Notif/Pengajuan) | Right (Calendar) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">
        {/* LEFT COLUMN - Flexible with scroll */}
        <div className="lg:col-span-3 flex flex-col gap-6 h-auto lg:h-[800px]">
          {/* Top Stats - Auto height */}
          <div className="flex-shrink-0">
            <TopSection role={userRole} topData={topData as never} />
          </div>

          {/* Admin: Pengajuan Section with internal scroll */}
          {userRole === "ADMIN" && pengajuanData && (
            <div className="flex-1 min-h-[400px] lg:min-h-0">
              <PengajuanSection pengajuanData={pengajuanData as never} />
            </div>
          )}

          {/* Non-Admin: Notification with internal scroll */}
          {userRole !== "ADMIN" && notifications && (
            <div className="flex-1 min-h-[400px] lg:min-h-0">
              <StatusNotification notifications={notifications as never} />
            </div>
          )}
        </div>

        {/* RIGHT COLUMN - Calendar with locked height */}
        <div className="lg:col-span-2 h-auto lg:h-[800px]">
          <CalendarFull
            upcomingExams={(topData as { data?: never[] })?.data || []}
            role={userRole}
            onEventClick={handleEventClick}
          />
        </div>
      </div>

      {/* Bottom Full-Width Section */}
      <BottomSection role={userRole} bottomData={bottomData as never} />

      {/* Modal Popup */}
      {showModal && selectedId && (
        <BAModal
          ujianId={selectedId}
          userRole={userRole as "MAHASISWA" | "DOSEN" | "ADMIN"}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}