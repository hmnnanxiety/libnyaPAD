"use client";

import { useState, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, Loader2, Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import {
  getAllRuangan,
  createRuangan,
  updateRuangan,
  deleteRuangan,
} from "@/lib/actions/ruangan";
import { RuanganTable } from "./r-table";
import { RuanganModal } from "./r-modal";

interface Ruangan {
  id: string;
  nama: string;
  deskripsi: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface Message {
  type: "success" | "error";
  text: string;
}

export function RuanganClient() {
  const { data: session, status } = useSession();
  const [ruanganList, setRuanganList] = useState<Ruangan[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<Message | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"form" | "delete">("form");
  const [editingRuangan, setEditingRuangan] = useState<Ruangan | null>(null);
  const [deletingRuanganId, setDeletingRuanganId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user || session.user.role !== "ADMIN") {
      setLoading(false);
      return;
    }
    fetchRuangan();
  }, [session, status]);

  const fetchRuangan = async () => {
    startTransition(async () => {
      const result = await getAllRuangan();
      if (result.success && result.data) {
        setRuanganList(result.data);
      } else {
        setMessage({
          type: "error",
          text: result.error || "Gagal mengambil data ruangan",
        });
      }
      setLoading(false);
    });
  };

  const handleOpenFormModal = (ruangan?: Ruangan) => {
    setEditingRuangan(ruangan || null);
    setModalMode("form");
    setIsModalOpen(true);
    setMessage(null);
  };

  const handleOpenDeleteModal = (id: string) => {
    setDeletingRuanganId(id);
    setModalMode("delete");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRuangan(null);
    setDeletingRuanganId(null);
  };

  const handleSubmit = async (formData: FormData) => {
    setMessage(null);

    startTransition(async () => {
      const result = editingRuangan
        ? await updateRuangan(editingRuangan.id, formData)
        : await createRuangan(formData);

      if (result.success) {
        setMessage({
          type: "success",
          text:
            result.message ||
            (editingRuangan
              ? "Ruangan berhasil diperbarui"
              : "Ruangan berhasil ditambahkan"),
        });
        handleCloseModal();
        fetchRuangan();
      } else {
        setMessage({
          type: "error",
          text: result.error || "Terjadi kesalahan",
        });
      }
    });
  };

  const handleDelete = async () => {
    if (!deletingRuanganId) return;

    startTransition(async () => {
      const result = await deleteRuangan(deletingRuanganId);
      if (result.success) {
        setMessage({
          type: "success",
          text: result.message || "Ruangan berhasil dihapus",
        });
        fetchRuangan();
      } else {
        setMessage({
          type: "error",
          text: result.error || "Gagal menghapus ruangan",
        });
      }
      handleCloseModal();
    });
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!session?.user || session.user.role !== "ADMIN") {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Akses ditolak. Hanya admin yang dapat mengakses halaman ini.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manajemen Ruangan</h1>
          <p className="mt-1 text-sm text-gray-500">
            Kelola data ruangan untuk penjadwalan ujian tugas akhir
          </p>
        </div>

        <Button 
          onClick={() => handleOpenFormModal()}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Tambah Ruangan
        </Button>
      </div>

      {/* Status Messages */}
      {message && (
        <Alert
          variant={message.type === "error" ? "destructive" : "default"}
          className={message.type === "success" ? "border-green-500 bg-green-50" : ""}
        >
          {message.type === "success" ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription className={message.type === "success" ? "text-green-800" : ""}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {/* Table */}
      <RuanganTable
        ruanganList={ruanganList}
        onEdit={handleOpenFormModal}
        onDelete={handleOpenDeleteModal}
        isPending={isPending}
      />

      {/* Single Modal for both Form and Delete */}
      <RuanganModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        onConfirm={handleDelete}
        editingRuangan={editingRuangan}
        isPending={isPending}
        mode={modalMode}
      />
    </div>
  );
}