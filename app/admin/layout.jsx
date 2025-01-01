"use client";

import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/ui/admin-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function AdminLayout({ children }) {
  const pathname = usePathname();

  // Check if the current route is `/tracker/admin`
  const hideSidebar = pathname === "/admin/tracker/client";

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-white">
        {/* Render Sidebar only if not on `/tracker/admin` */}
        {!hideSidebar && <AdminSidebar />}

        {/* Main Content */}
        <main className={`flex-1 ${hideSidebar ? "p-0" : "p-6"}`}>
          <div className="max-w-full">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
