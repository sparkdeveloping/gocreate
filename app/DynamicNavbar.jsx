"use client";

import { usePathname } from "next/navigation"; // Import usePathname for routing
import StaticNavbar from "./StaticNavbar";
import FloatingNavbar from "./FloatingNavbar";

export default function DynamicNavbar() {
  const pathname = usePathname();

  return pathname === "/join" ? (
    <FloatingNavbar />
  ) : (
    <>
      <StaticNavbar />
      <FloatingNavbar />
    </>
  );
}
