import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/ui/admin-sidebar";

export default function AdminLayout() {
  return (
    <SidebarProvider>
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6">Welcome to the Admin Panel!</main>
      </div>
    </SidebarProvider>
  );
}

export const metadata = {
  title: "Admin Dashboard",
  description: "Manage your application settings and data.",
};

export default function AdminPage() {
  return <div>Welcome to the Admin Dashboard</div>;
}
