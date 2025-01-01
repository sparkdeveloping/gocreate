import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import Image from "next/image";

import {
  Home,
  Calendar,
  Users,
  Building,
  ParkingCircle,
  Briefcase,
  PieChart,
  Wallet,
} from "lucide-react";

const adminMenu = [
  {
    group: "Dashboard",
    items: [{ title: "Dashboard", icon: Home, href: "/admin" }],
  },
  {
    group: "Memberships",
    items: [
      {
        title: "Memberships",
        icon: Briefcase,
        href: "/admin/memberships",
      },
      {
        title: "Tracker",
        icon: PieChart,
        href: "/admin/tracker", // Tracker moved under Memberships
      },
    ],
  },
  {
    group: "Transactions",
    items: [
      {
        title: "Payments",
        icon: Wallet,
        href: "/admin/payments",
      },
    ],
  },
  {
    group: "Workforce",
    items: [
      {
        title: "Employers",
        icon: Users,
        href: "/admin/employers",
        subMenu: [
          { title: "Directory", href: "/admin/employers/directory" },
          { title: "Details", href: "/admin/employers/details" },
        ],
      },
      {
        title: "Employees",
        icon: Users,
        href: "/admin/employees",
        subMenu: [
          { title: "Directory", href: "/admin/employees/directory" },
          { title: "Roles", href: "/admin/employees/roles" },
        ],
      },
    ],
  },
  {
    group: "Workspace",
    items: [
      {
        title: "Calendar",
        icon: Calendar,
        href: "/admin/calendar",
        subMenu: [
          { title: "Tasks", href: "/admin/calendar/tasks" },
          { title: "Events", href: "/admin/calendar/events" },
        ],
      },
      {
        title: "Parking",
        icon: ParkingCircle,
        href: "/admin/parking",
        subMenu: [{ title: "Vehicles", href: "/admin/parking/vehicles" }],
      },
    ],
  },
  {
    group: "Management",
    items: [
      {
        title: "Owners or Tenants",
        icon: Building,
        href: "/admin/tenants",
        subMenu: [
          { title: "Directory", href: "/admin/tenants/directory" },
          { title: "Details", href: "/admin/tenants/details" },
        ],
      },
    ],
  },
];

export function AdminSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center space-x-2 px-2 py-4">
          <Image
            src="/GCHorizontalColorAndBlack.svg"
            alt="Logo"
            width={150}
            height={40}
            priority
          />
        </div>
      </SidebarHeader>
      <SidebarContent>
        {adminMenu.map((group) => (
          <SidebarGroup key={group.group}>
            <SidebarGroupLabel className="text-sm font-medium text-sidebar-foreground/70">
              {group.group}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a
                        href={item.href}
                        className="flex items-center space-x-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                    {item.subMenu && (
                      <SidebarMenu>
                        {item.subMenu.map((subItem) => (
                          <SidebarMenuItem key={subItem.title}>
                            <SidebarMenuButton asChild>
                              <a
                                href={subItem.href}
                                className="ml-6 flex items-center space-x-2 text-sidebar-foreground text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                              >
                                <span>{subItem.title}</span>
                              </a>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a
                href="/logout"
                className="flex items-center space-x-2 text-red-500 hover:text-red-600"
              >
                <span className="icon-placeholder">🔓</span>
                <span>Logout</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
