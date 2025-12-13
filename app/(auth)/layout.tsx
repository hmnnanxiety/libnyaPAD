// src\app\(auth)\layout.tsx

"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { NavUser } from "@/components/nav-user";
import { useSession } from "next-auth/react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();

  // Tampilkan loading state saat checking session
  if (status === "loading") {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
          <p className="text-sm text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }
  
  const user = {
    name: session?.user?.name || "User",
    email: session?.user?.email || "",
    avatar: session?.user?.image || "",
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Mobile trigger button - hanya tampil di mobile */}
        <div className="md:hidden sticky top-0 z-10 bg-background border-b">
          <div className="flex items-center gap-2 px-4 py-3">
            <SidebarTrigger className="-ml-1" />
            <h1 className="text-lg font-semibold">SIMPENSI</h1>
          </div>
        </div>
        
        {/* Main content - tanpa navbar */}
        <main className="flex-1">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}