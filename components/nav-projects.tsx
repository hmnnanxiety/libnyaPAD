"use client";

import { usePathname } from "next/navigation";
import {
  type LucideIcon,
} from "lucide-react";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavProjects({
  projects,
}: {
  projects: {
    name: string;
    url: string;
    icon: LucideIcon;
  }[];
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarMenu className="mt-2">
        {projects.map((item) => {
          const isActive = pathname === item.url;
          return (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton
                asChild
                className={`h-12 ${
                  isActive
                    ? "text-blue-500 font-semibold border-l-4 border-blue-500 pl-4 rounded-l-none"
                    : "hover:text-blue-600"
                }`}
              >
                <a href={item.url}>
                  <item.icon
                    className={
                      isActive
                        ? "text-blue-500 hover:text-blue-600"
                        : "hover:text-blue-600"
                    }
                  />
                  <span className="font-medium">{item.name}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
