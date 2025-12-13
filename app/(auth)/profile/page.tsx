import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUserProfile } from "@/lib/actions/profile/profile";
import { getDosenName } from "@/lib/actions/profile/getDosenName";
import { ProfileClient } from "@/components/profile/p-client";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Fetch user profile data
  const result = await getUserProfile();

  if (!result.success || !result.data) {
    return (
      <div className="space-y-6 p-6">
        <h1 className="text-2xl font-bold text-gray-900">Profil</h1>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-red-700">
            {result.error || "Gagal memuat data profil"}
          </p>
        </div>
      </div>
    );
  }

  // Fetch dosen list if user is MAHASISWA
  let dosenList: Array<{ id: string; name: string | null }> = [];
  if (result.data.role === "MAHASISWA") {
    const dosenResult = await getDosenName();
    if (dosenResult.success && dosenResult.namaDosen) {
      dosenList = dosenResult.namaDosen;
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Profil</h1>
      </div>

      <ProfileClient user={result.data} dosenList={dosenList} />
    </div>
  );
}