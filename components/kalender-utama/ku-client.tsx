"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import KuEvent from "./ku-event";
import KuSidebarEvent from "./ku-sidebarevent";
import BAModal from "@/components/berita-acara/ba-modal";

interface EventData {
  id: string;
  namaMahasiswa?: string | null;
  nim?: string | null;
  foto?: string | null;
  judulTugasAkhir?: string | null;
  judul?: string | null;
  tanggal: Date | null;
  jamMulai: Date | null;
  jamSelesai: Date | null;
  ruangan?: string | null;
  isDosenPembimbing?: boolean;
  prodi?: string | null;
  angkatan?: string | null;
  dosenPembimbing?: string | null;
  dosenPenguji?: string[];
}

interface KalenderUtamaClientProps {
  initialData: EventData[];
  userRole: string;
}

const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const DAYS_MOBILE = ["S", "M", "T", "W", "T", "F", "S"];
const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

export default function KalenderUtamaClient({ initialData, userRole }: KalenderUtamaClientProps) {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);

  // Auto-select today's date on mount
  useEffect(() => {
    setSelectedDate(new Date());
  }, []);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    
    const days: (Date | null)[] = [];
    
    // Previous month days
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevDate = new Date(year, month, -startingDayOfWeek + i + 1);
      days.push(prevDate);
    }
    
    // Current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    // Next month days to fill the grid
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i));
    }
    
    return days;
  }, [currentDate]);

  // Group events by date
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, EventData[]> = {};
    
    initialData.forEach(event => {
      if (event.tanggal) {
        const dateKey = new Date(event.tanggal).toDateString();
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(event);
      }
    });
    
    return grouped;
  }, [initialData]);

  // Get events for selected date
  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return [];
    const dateKey = selectedDate.toDateString();
    return eventsByDate[dateKey] || [];
  }, [selectedDate, eventsByDate]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setShowSidebar(true);
  };

  const handleEventClick = (eventId: string) => {
    setSelectedId(eventId);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedId(null);
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return selectedDate?.toDateString() === date.toDateString();
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Kalender Utama</h1>
        {userRole === "ADMIN" && (
          <button
            onClick={() => router.push("/daftar-penjadwalan")}
            className="rounded-lg bg-blue-500 px-4 py-2 text-sm text-white transition hover:bg-blue-600 sm:text-base">
            Lihat Daftar Penjadwalan
          </button>
        )}
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
        {/* Calendar */}
        <div className="flex-1 rounded-lg bg-white p-3 shadow sm:p-4 md:p-6">
          {/* Calendar Header */}
          <div className="mb-3 flex items-center justify-between md:mb-4">
            <button
              onClick={handlePrevMonth}
              className="rounded p-1.5 hover:bg-gray-100 md:p-2"
            >
              <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
            </button>
            <h2 className="text-base font-semibold sm:text-lg">
              {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button
              onClick={handleNextMonth}
              className="rounded p-1.5 hover:bg-gray-100 md:p-2"
            >
              <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
            </button>
          </div>

          {/* Day Headers - Desktop */}
          <div className="mb-2 hidden grid-cols-7 gap-1 sm:grid md:gap-2">
            {DAYS.map(day => (
              <div key={day} className="text-center text-xs font-medium text-gray-600 md:text-sm">
                {day}
              </div>
            ))}
          </div>

          {/* Day Headers - Mobile */}
          <div className="mb-2 grid grid-cols-7 gap-1 sm:hidden">
            {DAYS_MOBILE.map((day, idx) => (
              <div key={idx} className="text-center text-xs font-medium text-gray-600">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 md:gap-2">
            {calendarDays.map((date, index) => {
              if (!date) return <div key={index} />;
              
              const dateKey = date.toDateString();
              const dayEvents = eventsByDate[dateKey] || [];
              const inCurrentMonth = isCurrentMonth(date);
              
              return (
                <div
                  key={index}
                  onClick={() => handleDateClick(date)}
                  className={`
                    flex min-h-[60px] flex-col justify-between
                    cursor-pointer rounded-lg border p-1 transition
                    sm:min-h-[80px] sm:p-1.5 md:min-h-[100px] md:p-2 lg:min-h-[120px]
                    ${inCurrentMonth ? "bg-white" : "bg-gray-50"}
                    ${isToday(date) ? "border-blue-500 bg-blue-50" : "border-gray-200"}
                    ${isSelected(date) ? "ring-2 ring-blue-400" : ""}
                    hover:border-blue-300
                  `}
                >
                  <div className={`
                    mb-1 text-xs font-medium
                    sm:text-sm
                    ${!inCurrentMonth ? "text-gray-400" : "text-gray-700"}
                    ${isToday(date) ? "text-blue-600" : ""}
                  `}>
                    {date.getDate()}
                  </div>
                  
                  {/* Events - Hidden on mobile, show on larger screens */}
                  <div className="hidden space-y-1 sm:block">
                    {dayEvents.slice(0, 2).map((event, idx) => (
                      <KuEvent key={event.id} event={event} colorIndex={idx} />
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-gray-500">
                        +{dayEvents.length - 2} lainnya
                      </div>
                    )}
                  </div>

                  {/* Event indicator dots for mobile */}
                  {dayEvents.length > 0 && (
                    <div className="flex justify-center gap-0.5 sm:hidden">
                      {dayEvents.slice(0, 3).map((_, idx) => (
                        <div
                          key={idx}
                          className="h-1 w-1 rounded-full bg-blue-500"
                        />
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="h-1 w-1 rounded-full bg-gray-400" />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar - Hidden on mobile, always visible on desktop */}
        <div className="hidden lg:block">
          <KuSidebarEvent 
            selectedDate={selectedDate} 
            events={selectedDateEvents}
            userRole={userRole}
            onEventClick={handleEventClick}
          />
        </div>

        {/* Mobile Sidebar - Expandable */}
        {showSidebar && (
          <div className="lg:hidden">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">Agenda</h3>
              <button
                onClick={() => setShowSidebar(false)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Tutup
              </button>
            </div>
            <KuSidebarEvent 
              selectedDate={selectedDate} 
              events={selectedDateEvents}
              userRole={userRole}
              onEventClick={handleEventClick}
            />
          </div>
        )}
      </div>

      {/* Modal Popup */}
      {showModal && selectedId && (
        <BAModal
          ujianId={selectedId}
          userRole={userRole.toUpperCase() as "MAHASISWA" | "DOSEN" | "ADMIN"}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}