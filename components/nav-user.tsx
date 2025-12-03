"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession, signOut } from "next-auth/react";
import { LogOut, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}) {
  const { data: session } = useSession();
  const router = useRouter();

  if (!session) {
    return null;
  }

  const getRoleLabel = (role?: string) => {
    if (!role) return "User";
    const roleMap: Record<string, string> = {
      MAHASISWA: "Mahasiswa",
      DOSEN: "Dosen",
      ADMIN: "Admin Prodi",
    };
    return roleMap[role] || role;
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex w-full items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors focus:outline-none">
          <Avatar className="h-10 w-10 rounded-full border-2 border-gray-200">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="rounded-full bg-blue-100 text-blue-600">
              {user.name?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-1 flex-col text-left">
            <span className="text-sm font-semibold text-gray-900">
              {user.name}
            </span>
            <span className="text-xs text-gray-500">
              {getRoleLabel(session.user?.role)}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="font-medium">{user.name}</span>
            <span className="text-xs font-normal text-gray-500">
              {user.email}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}