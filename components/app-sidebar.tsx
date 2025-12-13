"use client";

import * as React from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  FileText,
  LayoutDashboard,
  FileClock,
  Calendar,
  Bell,
  SquareUser,
  ClipboardList,
  Building2,
  LogOut,
  UserPen,
  ChevronDown,
} from "lucide-react";
import { NavProjects } from "@/components/nav-projects";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const dashboard = {
  name: "Dashboard",
  url: "/dashboard",
  icon: LayoutDashboard,
};

// Data untuk MAHASISWA - TANPA menu Profile
const dataMhs = {
  projects: [
    dashboard,
    {
      name: "Form Pengajuan",
      url: "/form-pengajuan",
      icon: FileText,
    },
    {
      name: "Riwayat Pengajuan",
      url: "/riwayat-pengajuan",
      icon: FileClock,
    },
    {
      name: "Detail Jadwal",
      url: "/detail-jadwal",
      icon: Calendar,
    },
  ],
};

// Data untuk DOSEN - TANPA menu Profile & Notifikasi
const dataDosn = {
  projects: [
    dashboard,
    {
      name: "Detail Jadwal",
      url: "/detail-jadwal",
      icon: Calendar,
    },
    {
      name: "Riwayat Ujian",
      url: "/riwayat-ujian",
      icon: FileClock,
    },
    {
      name: "Notifikasi",
      url: "/riwayat-pengajuan",
      icon: Bell,
    },
  ],
};

// Data untuk ADMIN - TANPA menu Profile
const dataAdm = {
  projects: [
    dashboard,
    {
      name: "Pengajuan",
      url: "/pengajuan",
      icon: FileText,
    },
    {
      name: "Formulir Penjadwalan",
      url: "/form-penjadwalan",
      icon: FileClock,
    },
    {
      name: "Kalender Utama",
      url: "/kalender-utama",
      icon: Calendar,
    },
    {
      name: "Manajemen Ruangan",
      url: "/ruangan",
      icon: Building2,
    },
    {
      name: "Data Mahasiswa",
      url: "/data-mahasiswa",
      icon: SquareUser,
    },
    {
      name: "Data Dosen",
      url: "/data-dosen",
      icon: SquareUser,
    },
    {
      name: "Riwayat dan Laporan",
      url: "/riwayat-dan-laporan",
      icon: ClipboardList,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session, status } = useSession();
  const router = useRouter();

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

  const handleEditProfile = () => {
    router.push("/profile");
  };

  if (status === "loading" || !session) {
    return (
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
              <span className="text-xl font-bold text-white">S</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">SIMPENSI</span>
              <span className="text-xs text-muted-foreground">SV UGM</span>
            </div>
          </div>
        </SidebarHeader>
        
        <SidebarContent>
          <div className="p-4 space-y-2">
            <div className="h-8 bg-muted rounded animate-pulse"></div>
            <div className="h-8 bg-muted rounded animate-pulse"></div>
            <div className="h-8 bg-muted rounded animate-pulse"></div>
          </div>
        </SidebarContent>
        
        <SidebarFooter></SidebarFooter>
        <SidebarRail />
      </Sidebar>
    );
  }

  const role = session.user?.role;
  let dataNav;
  if (role === "MAHASISWA") {
    dataNav = dataMhs;
  } else if (role === "DOSEN") {
    dataNav = dataDosn;
  } else if (role === "ADMIN") {
    dataNav = dataAdm;
  } else {
    dataNav = dataMhs;
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* Header dengan Logo/Branding */}
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 shrink-0">
            <span className="text-xl font-bold text-white">S</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold truncate">SIMPENSI</span>
            <span className="text-xs text-muted-foreground truncate">SV UGM</span>
          </div>
        </div>
      </SidebarHeader>

      {/* Navigation Menu */}
      <SidebarContent>
        <NavProjects projects={dataNav.projects} />
      </SidebarContent>

      {/* Footer dengan Profile & Actions */}
      <SidebarFooter className="border-t">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 px-4 py-3 hover:bg-accent transition-colors focus:outline-none rounded-md">
              <Avatar className="h-9 w-9 rounded-full border-2 border-gray-200 shrink-0">
                <AvatarImage 
                  src={session.user?.image || ""} 
                  alt={session.user?.name || ""} 
                />
                <AvatarFallback className="rounded-full bg-blue-100 text-blue-600 text-sm font-semibold">
                  {session.user?.name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-1 flex-col text-left min-w-0">
                <span className="text-sm font-semibold text-foreground truncate">
                  {session.user?.name}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  {getRoleLabel(session.user?.role)}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
            </button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="font-medium">{session.user?.name}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {session.user?.email}
                </span>
              </div>
            </DropdownMenuLabel>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem
              onClick={handleEditProfile}
              className="cursor-pointer"
            >
              <UserPen className="mr-2 h-4 w-4" />
              Edit Profil
            </DropdownMenuItem>
            
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
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  );
}