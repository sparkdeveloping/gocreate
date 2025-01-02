"use client";

import { usePathname } from "next/navigation"; // Import usePathname for routing
import StaticNavbar from "./StaticNavbar";
import FloatingNavbar from "./FloatingNavbar";

export default function DynamicNavbar() {
  const pathname = usePathname();

  // Show StaticNavbar and FloatingNavbar only on "/" or "/home"
  if (pathname === "/" || pathname === "/home") {
    return (
      <>
        <StaticNavbar />
        <FloatingNavbar />
      </>
    );
  }

  // Show only FloatingNavbar on other pages
  return <FloatingNavbar />;
}
