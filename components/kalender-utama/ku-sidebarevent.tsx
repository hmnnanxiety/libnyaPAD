"use client";

import Image from "next/image";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Calendar, Clock } from "lucide-react";

interface EventData {
  id: string;
  namaMahasiswa?: string | null;
  foto?: string | null;
  judulTugasAkhir?: string | null;
  judul?: string | null;
  tanggal: Date | null;
  jamMulai: Date | null;
  jamSelesai: Date | null;
  ruangan?: string | null;
}

interface KuSidebarEventProps {
  selectedDate: Date | null;
  events: EventData[];
  userRole: string;
  onEventClick: (eventId: string) => void;
}

const COLORS = [
  "bg-blue-100 border-blue-200",
  "bg-yellow-100 border-yellow-200",
  "bg-pink-100 border-pink-200",
  "bg-green-100 border-green-200",
  "bg-purple-100 border-purple-200",
];

export default function KuSidebarEvent({ selectedDate, events, userRole, onEventClick }: KuSidebarEventProps) {
  const formatTime = (date: Date | null) => {
    if (!date) return "-";
    return format(new Date(date), "HH:mm", { locale: id });
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "-";
    return format(new Date(date), "dd MMMM yyyy", { locale: id });
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const today = isToday(selectedDate);

  return (
    <div className="w-80 space-y-4">
      <div className="rounded-lg bg-white p-4 shadow">
        <div className="mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">
              {today ? "Agenda Hari Ini" : "Agenda"}
            </h3>
            {selectedDate && (
              <p className="text-xs text-gray-500">
                {formatDate(selectedDate)}
              </p>
            )}
          </div>
        </div>

        {!selectedDate && (
          <p className="text-sm text-gray-500">
            Memuat agenda hari ini...
          </p>
        )}

        {selectedDate && events.length === 0 && (
          <div className="text-center py-8">
            <div className="mb-3 text-gray-300">
              <Calendar className="h-12 w-12 mx-auto" />
            </div>
            <p className="text-sm text-gray-500">
              {today ? "Tidak ada agenda hari ini" : "Tidak ada jadwal pada tanggal ini"}
            </p>
          </div>
        )}

        {selectedDate && events.length > 0 && (
          <div className="space-y-3">
            {events.map((event, index) => {
              const title = userRole === "MAHASISWA" 
                ? (event.judul || "Ujian Tugas Akhir")
                : (event.judulTugasAkhir || "Ujian Tugas Akhir");
              
              const studentName = userRole === "MAHASISWA" 
                ? "Ujian Anda"
                : (event.namaMahasiswa || "Mahasiswa");

              return (
                <div
                  key={event.id}
                  onClick={() => onEventClick(event.id)}
                  className={`
                    cursor-pointer rounded-lg border p-3 transition
                    hover:shadow-md ${COLORS[index % COLORS.length]}
                  `}
                >
                  <div className="mb-2 flex items-center gap-2">
                    <div className="relative h-10 w-10 overflow-hidden rounded-full bg-gray-200">
                      {event.foto ? (
                        <Image
                          src={event.foto}
                          alt={studentName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm font-medium text-gray-600">
                          {studentName.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{studentName}</div>
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Clock className="h-3 w-3" />
                        {formatTime(event.jamMulai)} - {formatTime(event.jamSelesai)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-700 line-clamp-2">
                    {title}
                  </div>
                  
                  {event.ruangan && (
                    <div className="mt-2 text-xs text-gray-500">
                      Ruangan {event.ruangan}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}