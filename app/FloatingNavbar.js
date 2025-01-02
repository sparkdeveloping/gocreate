"use client";

import React, { useState, useEffect } from "react";
import { useScroll, useTransform, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Icon from "./icon_black.svg";

export default function FloatingNavbar() {
  const { scrollY } = useScroll();
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);

  // Opacity transformation only for `/` or `/home`
  const opacity = useTransform(scrollY, [200, 300], [0, 1]);

  useEffect(() => {
    const handleVisibility = () => {
      if (pathname === "/" || pathname === "/home") {
        // Show FloatingNavbar only after scrolling 200px on `/` or `/home`
        setIsVisible(window.scrollY > 200);
      } else {
        // Show FloatingNavbar immediately on other pages
        setIsVisible(true);
      }
    };

    // Attach the scroll listener for `/` or `/home`
    if (pathname === "/" || pathname === "/home") {
      window.addEventListener("scroll", handleVisibility);
    } else {
      setIsVisible(true); // Directly show on other pages
    }

    return () => window.removeEventListener("scroll", handleVisibility);
  }, [pathname]);

  if (!isVisible) return null;

  return (
    <motion.div
      style={pathname === "/" || pathname === "/home" ? { opacity } : { opacity: 1 }}
      className="fixed top-4 inset-x-0 max-w-5xl mx-auto z-40 px-6 py-3 shadow-lg rounded-full backdrop-blur-xl bg-white/50 transition-all pointer-events-auto"
    >
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="shrink-0">
          <Image src={Icon} alt="Icon" width={30} height={20} priority />
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 flex justify-center space-x-8 relative z-10">
          {["Home", "Studios", "Memberships", "Explore"].map((item, index) => {
            const href = item === "Home" ? "/" : `/${item.toLowerCase()}`;
            const isActive = pathname === href;

            return (
              <Link
                key={index}
                href={href}
                className={`text-sm font-medium px-3 py-1 rounded-lg ${
                  isActive
                    ? "bg-blue-500 text-white"
                    : "text-black hover:bg-gray-200"
                }`}
              >
                {item}
              </Link>
            );
          })}
        </nav>

        {/* Login & Become a Member Buttons */}
        <div className="flex items-center space-x-4">
          <Link
            href="/login"
            className="rounded-full bg-gray-200 px-4 py-1 text-sm font-medium text-gray-800 hover:bg-gray-300"
          >
            Login
          </Link>
          <Link
            href="/join"
            className="rounded-full bg-blue-500 px-4 py-1 text-sm font-semibold text-white hover:bg-blue-600"
          >
            Become a Member
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
