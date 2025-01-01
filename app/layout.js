"use client";

import "./globals.css"; // Import global styles
import StaticNavbar from "./StaticNavbar";
import DynamicNavbar from "./DynamicNavbar";
import TwoColumnFooter from "./TwoColumnFooter"; // Import the footer
import { usePathname } from "next/navigation";

export default function RootLayout({ children }) {
  const pathname = usePathname();

  // Define paths where navbars and footers should not appear
  const excludedPaths = ["/admin", "/profile"];

  // Check if the current pathname starts with any excluded path
  const isExcludedPath = excludedPaths.some((excludedPath) =>
    pathname.startsWith(excludedPath)
  );

  return (
    <html lang="en">
      <body className="bg-white">
        {/* Render DynamicNavbar only if not on excluded paths */}
        {!isExcludedPath && <DynamicNavbar />}

        {/* Page Content */}
        <main>{children}</main>

        {/* Render Footer only if not on excluded paths */}
        {!isExcludedPath && <TwoColumnFooter />}
      </body>
    </html>
  );
}
