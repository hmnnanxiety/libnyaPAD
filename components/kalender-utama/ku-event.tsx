"use client";

interface EventData {
  id: string;
  namaMahasiswa?: string | null;
  judul?: string | null;
  judulTugasAkhir?: string | null;
}

interface KuEventProps {
  event: EventData;
  colorIndex: number;
}

const COLORS = [
  "bg-blue-100 text-blue-700 border-blue-200",
  "bg-yellow-100 text-yellow-700 border-yellow-200",
  "bg-pink-100 text-pink-700 border-pink-200",
  "bg-green-100 text-green-700 border-green-200",
  "bg-purple-100 text-purple-700 border-purple-200",
];

export default function KuEvent({ colorIndex }: KuEventProps) {
  const colorClass = COLORS[colorIndex % COLORS.length];

  return (
    <div
      className={`
        cursor-pointer rounded border px-2 py-1 text-xs font-medium
        transition hover:shadow-sm ${colorClass}
      `}
    >
      Ujian TA
    </div>
  );
}