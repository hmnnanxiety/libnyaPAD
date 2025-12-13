"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  Calendar,
  CheckCircle,
  GraduationCap,
} from "lucide-react";

interface TopData {
  jumlahMahasiswa?: number;
  jumlahDosen?: number;
  data?: Array<{ 
    ruangan?: string | null;
    jamSelesai?: Date | null;
  }>;
  ujianSelesaiBulanIni?: number;
  jumlahMahasiswaBimbingan?: number;
  statusPengajuan?: string;
}

interface TopSectionProps {
  role: string;
  topData: TopData;
}

export function TopSection({ role, topData }: TopSectionProps) {
  if (role === "ADMIN") {
    return <AdminTopSection topData={topData} />;
  } else if (role === "DOSEN") {
    return <DosenTopSection topData={topData} />;
  } else if (role === "MAHASISWA") {
    return <MahasiswaTopSection topData={topData} />;
  }
  return null;
}

// Admin Statistics - 4 cards with better responsive grid
function AdminTopSection({ topData }: { topData: TopData }) {
  const stats = [
    {
      label: "Mahasiswa Aktif",
      value: topData?.jumlahMahasiswa || 0,
      icon: GraduationCap,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-100",
    },
    {
      label: "Dosen Aktif",
      value: topData?.jumlahDosen || 0,
      icon: Users,
      color: "text-cyan-600",
      bgColor: "bg-cyan-50",
      borderColor: "border-cyan-100",
    },
    {
      label: "Jadwal Ujian Terdekat",
      value: topData?.data?.length || 0,
      icon: Calendar,
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      borderColor: "border-pink-100",
    },
    {
      label: "Ujian Selesai Bulan Ini",
      value: topData?.ujianSelesaiBulanIni || 0,
      icon: CheckCircle,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={index}
            className={`border ${stat.borderColor} shadow-sm hover:shadow-md transition-shadow`}
          >
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <div
                  className={`p-2.5 sm:p-3 rounded-lg ${stat.bgColor} flex-shrink-0`}
                >
                  <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                    {stat.value}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 mt-0.5 line-clamp-2">
                    {stat.label}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// Dosen Statistics - 3 cards with better responsive grid
function DosenTopSection({ topData }: { topData: TopData }) {
  const stats = [
    {
      label: "Ujian Mendatang",
      value: topData?.data?.length || 0,
      icon: Calendar,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-100",
    },
    {
      label: "Mahasiswa Dibimbing",
      value: topData?.jumlahMahasiswaBimbingan || 0,
      icon: Users,
      color: "text-cyan-600",
      bgColor: "bg-cyan-50",
      borderColor: "border-cyan-100",
    },
    {
      label: "Ujian Selesai Bulan Ini",
      value: topData?.ujianSelesaiBulanIni || 0,
      icon: CheckCircle,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={index}
            className={`border ${stat.borderColor} shadow-sm hover:shadow-md transition-shadow`}
          >
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <div
                  className={`p-2.5 sm:p-3 rounded-lg ${stat.bgColor} flex-shrink-0`}
                >
                  <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                    {stat.value}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 mt-0.5 line-clamp-2">
                    {stat.label}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// Mahasiswa Statistics - 2 larger cards, fully responsive
function MahasiswaTopSection({ topData }: { topData: TopData }) {
  const statusPengajuan = topData?.statusPengajuan || "BELUM_MENGAJUKAN";
  const upcomingExam = topData?.data?.[0];

  const statusConfig: Record<
    string,
    {
      label: string;
      displayLabel: string;
      bgColor: string;
      textColor: string;
      iconBg: string;
      borderColor: string;
    }
  > = {
    MENUNGGU_VERIFIKASI: {
      label: "Menunggu Verifikasi",
      displayLabel: "Menunggu Verifikasi",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-700",
      iconBg: "bg-yellow-100",
      borderColor: "border-yellow-200",
    },
    DITERIMA: {
      label: "Diterima",
      displayLabel: "Diterima",
      bgColor: "bg-green-50",
      textColor: "text-green-700",
      iconBg: "bg-green-100",
      borderColor: "border-green-200",
    },
    DITOLAK: {
      label: "Ditolak",
      displayLabel: "Ditolak",
      bgColor: "bg-red-50",
      textColor: "text-red-700",
      iconBg: "bg-red-100",
      borderColor: "border-red-200",
    },
    DIJADWALKAN: {
      label: "Sudah Dijadwalkan",
      displayLabel: "Sudah Dijadwalkan",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
      iconBg: "bg-blue-100",
      borderColor: "border-blue-200",
    },
    SELESAI: {
      label: "Selesai",
      displayLabel: "Selesai",
      bgColor: "bg-purple-50",
      textColor: "text-gray-700",
      iconBg: "bg-purple-100",
      borderColor: "border-gray-200",
    },
    BELUM_MENGAJUKAN: {
      label: "Belum Mengajukan",
      displayLabel: "Belum Mengajukan",
      bgColor: "bg-gray-50",
      textColor: "text-gray-700",
      iconBg: "bg-gray-100",
      borderColor: "border-gray-200",
    },
  };

  const currentStatus = statusConfig[statusPengajuan] || statusConfig.BELUM_MENGAJUKAN;
  const ruangIsScheduled = Boolean(upcomingExam?.ruangan);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Status Pengajuan */}
      <Card
        className={`border ${currentStatus.borderColor} ${currentStatus.bgColor} shadow-sm hover:shadow-md transition-shadow`}
      >
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-start gap-3 sm:gap-4">
            <div
              className={`p-2.5 sm:p-3 rounded-lg ${currentStatus.iconBg} flex-shrink-0`}
            >
              <Calendar
                className={`h-5 w-5 sm:h-6 sm:w-6 ${currentStatus.textColor}`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">
                Status Pengajuan Ujian
              </p>
              <p
                className={`text-base sm:text-xl font-bold ${currentStatus.textColor} break-words`}
              >
                {currentStatus.displayLabel}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tempat Ruang Ujian */}
      <Card
        className={`border shadow-sm hover:shadow-md transition-shadow ${
          ruangIsScheduled
            ? "border-blue-100 bg-blue-50"
            : "border-gray-200 bg-gray-50"
        }`}
      >
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-start gap-3 sm:gap-4">
            <div
              className={`p-2.5 sm:p-3 rounded-lg flex-shrink-0 ${
                ruangIsScheduled ? "bg-blue-100" : "bg-gray-100"
              }`}
            >
              <CheckCircle
                className={`h-5 w-5 sm:h-6 sm:w-6 ${
                  ruangIsScheduled ? "text-blue-600" : "text-gray-500"
                }`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">
                Tempat Ruang Ujian
              </p>
              <p
                className={`text-base sm:text-xl font-bold break-words ${
                  ruangIsScheduled ? "text-blue-700" : "text-gray-700"
                }`}
              >
                {upcomingExam?.ruangan || "Belum Dijadwalkan"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}