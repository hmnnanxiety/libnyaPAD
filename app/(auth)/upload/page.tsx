"use client";

import { useFormStatus } from "react-dom";
import {
  submitBerkas,
  type FormState,
} from "@/lib/actions/formPengajuan/uploadBerkasSupabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useActionState, useEffect } from "react";

// Komponen tombol terpisah untuk menampilkan status "pending"
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Mengunggah..." : "Kirim Pengajuan"}
    </Button>
  );
}

export default function PengajuanPage() {
  // Inisialisasi state formulir
  const initialState: FormState = { success: false, message: "" };
  const [state, formAction] = useActionState(submitBerkas, initialState);

  useEffect(() => {
    if (state.success) {
      alert(state.message); // Atau gunakan toast/notifikasi yang lebih baik
      // Anda bisa mereset formulir di sini
    } else if (state.message) {
      alert(state.message); // Tampilkan pesan error
    }
  }, [state]);

  return (
    <div className="p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Formulir Pengajuan Ujian</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Formulir memanggil Server Action */}
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="judul">Judul Tugas Akhir</Label>
              <Input id="judul" name="judul" type="text" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dosenPembimbingId">ID Dosen Pembimbing</Label>
              {/* Ganti ini dengan <select> yang mengambil data dosen */}
              <Input
                id="dosenPembimbingId"
                name="dosenPembimbingId"
                type="text"
                required
                placeholder="Untuk sementara, masukkan ID Dosen"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="berkas">Berkas Ujian (PDF)</Label>
              <Input
                id="berkas"
                name="berkas"
                type="file"
                accept=".pdf" // Hanya terima PDF
                required
              />
            </div>

            <SubmitButton />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
