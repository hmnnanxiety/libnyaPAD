import FpTop from "@/components/form-pengajuan/fp-top";
import FpBottom from "@/components/form-pengajuan/fp-bottom";

export default function FormPengajuanPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Form Pengajuan Ujian Tugas Akhir</h1>
        <p className="text-muted-foreground">
          Lengkapi data diri dan unggah berkas pengajuan ujian tugas akhir Anda.
        </p>
      </div>

      {/* Data Mahasiswa Section */}
      <FpTop />

      {/* Upload Berkas Section */}
      <FpBottom />
    </div>
  );
}