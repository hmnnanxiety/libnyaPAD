// src/components/dashboard/dash-calendar-full.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useMemo, useEffect } from "react";

interface ExamItem {
  id: string;
  namaMahasiswa?: string | null;
  jamMulai?: Date | null;
  jamSelesai?: Date | null;
  tanggal?: Date | null;
  ruangan?: string | null;
}

interface CalendarFullProps {
  upcomingExams: ExamItem[];
  role: string;
  onEventClick: (examId: string) => void;
}

export function CalendarFull({ upcomingExams, role, onEventClick }: CalendarFullProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Auto-select today's date on mount
  useEffect(() => {
    setSelectedDate(new Date());
  }, []);

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];

  const getMonthYear = () => {
    return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    // Previous month padding
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ day: null, isCurrentMonth: false });
    }
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, isCurrentMonth: true });
    }
    return days;
  };

  // Group events by date
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, ExamItem[]> = {};

    upcomingExams.forEach((exam) => {
      const examDate = exam.jamMulai
        ? new Date(exam.jamMulai)
        : exam.tanggal
        ? new Date(exam.tanggal)
        : null;
      if (examDate) {
        const dateKey = examDate.toDateString();
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(exam);
      }
    });

    return grouped;
  }, [upcomingExams]);

  const hasExamOnDay = (day: number) => {
    if (!upcomingExams || upcomingExams.length === 0) return false;

    return upcomingExams.some((exam) => {
      const examDate = exam.jamMulai
        ? new Date(exam.jamMulai)
        : exam.tanggal
        ? new Date(exam.tanggal)
        : null;
      if (!examDate) return false;

      return (
        examDate.getDate() === day &&
        examDate.getMonth() === currentDate.getMonth() &&
        examDate.getFullYear() === currentDate.getFullYear()
      );
    });
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const prevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const formatTime = (date: Date | null | undefined) => {
    if (!date) return "";
    const d = new Date(date);
    const hours = d.getHours().toString().padStart(2, "0");
    const minutes = d.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const getEventsForDate = (date: Date) => {
    const dateKey = date.toDateString();
    return eventsByDate[dateKey] || [];
  };

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    setSelectedDate(clickedDate);
  };

  const days = getDaysInMonth();
  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];
  
  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };
  
  const todaySelected = isToday(selectedDate);

  return (
    <Card className="border-none shadow-sm h-full flex flex-col overflow-hidden">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded">
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <CardTitle className="text-base font-semibold">
            {getMonthYear()}
          </CardTitle>
          <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded">
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col overflow-hidden space-y-4">
        {/* Days of week */}
        <div className="grid grid-cols-7 gap-2 flex-shrink-0">
          {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-gray-500"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-2 flex-shrink-0">
          {days.map((dateObj, index) => {
            const { day, isCurrentMonth } = dateObj;
            const hasExam = day && isCurrentMonth && hasExamOnDay(day);
            const isTodayDate = day && isCurrentMonth && isToday(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
            const isSelected = selectedDate && day && isCurrentMonth && 
              selectedDate.getDate() === day &&
              selectedDate.getMonth() === currentDate.getMonth() &&
              selectedDate.getFullYear() === currentDate.getFullYear();

            return (
              <div
                key={index}
                onClick={() => day && isCurrentMonth && handleDateClick(day)}
                className={`
                  aspect-square flex items-center justify-center text-sm rounded-lg
                  ${day && isCurrentMonth ? "cursor-pointer" : ""}
                  ${!isCurrentMonth ? "text-gray-300" : "text-gray-700"}
                  ${
                    isTodayDate
                      ? "bg-blue-100 font-bold border-2 border-blue-500"
                      : ""
                  }
                  ${
                    hasExam && !isTodayDate
                      ? "bg-purple-50 text-purple-700 font-semibold"
                      : ""
                  }
                  ${
                    hasExam && isTodayDate
                      ? "bg-purple-100 text-purple-700 font-bold"
                      : ""
                  }
                  ${
                    isSelected
                      ? "ring-2 ring-blue-400"
                      : ""
                  }
                  ${
                    isCurrentMonth && !hasExam && !isTodayDate
                      ? "hover:bg-gray-50"
                      : ""
                  }
                `}
              >
                {day || ""}
              </div>
            );
          })}
        </div>

        {/* Selected Date Events - WITH SCROLL */}
        <div className="pt-4 border-t flex-1 flex flex-col min-h-0">
          <CardTitle className="text-base font-semibold mb-3 flex-shrink-0">
            {todaySelected 
              ? "Agenda Hari Ini"
              : selectedDate 
              ? `Jadwal ${selectedDate.getDate()} ${monthNames[selectedDate.getMonth()]}`
              : "Pilih Tanggal"}
          </CardTitle>

          <div className="flex-1 overflow-y-auto pr-2">
            {!selectedDate ? (
              <p className="text-sm text-gray-500 text-center py-4">
                Memuat agenda hari ini...
              </p>
            ) : selectedDateEvents.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                {todaySelected ? "Tidak ada agenda hari ini" : "Tidak ada jadwal pada tanggal ini"}
              </p>
            ) : (
              <div className="space-y-3">
                {selectedDateEvents.map((exam, index) => (
                  <div
                    key={index}
                    onClick={() => onEventClick(exam.id)}
                    className="p-3 rounded-lg bg-blue-50 border border-blue-200 cursor-pointer hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">
                          {role === "ADMIN" || role === "DOSEN"
                            ? exam.namaMahasiswa || "Ujian Tugas Akhir"
                            : "Ujian Tugas Akhir"}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {formatTime(exam.jamMulai)} -{" "}
                          {formatTime(exam.jamSelesai)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Ruangan {typeof exam.ruangan === 'string' ? exam.ruangan : exam.ruangan || "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}