"use client";

import React, { useState, useEffect } from "react";
import { useScroll, useTransform, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  auth,
  db,
  doc,
  getDoc,
  onAuthStateChanged,
} from "@/lib/firebase/firebaseConfig";
import Logo from "./Logo.svg";

export default function StaticNavbar() {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0.1, 0.2], [1, 0]);
  const pathname = usePathname();

  const [user, setUser] = useState(null);
  const [membershipStatus, setMembershipStatus] = useState("Staff");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        // Fetch membership status from Firestore
        const userDoc = await getDoc(doc(db, "memberships", currentUser.uid));
        if (userDoc.exists()) {
          setMembershipStatus(userDoc.data().membershipStatus);
        }
      } else {
        setUser(null);
        setMembershipStatus("Staff");
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <motion.div
      style={{ opacity }}
      className="fixed top-0 left-0 w-full bg-transparent z-50"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <a href="/" className="flex items-center">
          <Image src={Logo} alt="Logo" width={200} height={20} priority />
        </a>

        {/* Navigation Items */}
        <nav className="flex items-center space-x-8 relative">
          {["Home", "Studios", "Memberships", "Explore"].map((item) => {
            const href = item === "Home" ? "/" : `/${item.toLowerCase()}`;
            const isActive = pathname === href;

            return (
              <a
                key={item}
                href={href}
                className={`text-sm font-medium px-3 py-1 rounded-lg ${
                  isActive
                    ? "bg-white text-black"
                    : "text-white hover:bg-white/20"
                }`}
              >
                {item}
              </a>
            );
          })}
        </nav>

        {/* Dynamic Buttons */}
        <div className="flex items-center space-x-4">
          {user ? (
            membershipStatus === "Staff" ||
            membershipStatus === "StudentTech" ? (
              <a
                href="/admin"
                className="rounded-full bg-green-500 px-4 py-1 text-sm font-medium text-white hover:bg-green-600"
              >
                Admin
              </a>
            ) : (
              <a
                href="/profile"
                className="rounded-full bg-gray-200 px-4 py-1 text-sm font-medium text-gray-800 hover:bg-gray-300"
              >
                Profile
              </a>
            )
          ) : (
            <>
              <a
                href="/login"
                className="rounded-full bg-gray-200 px-4 py-1 text-sm font-medium text-gray-800 hover:bg-gray-300"
              >
                Login
              </a>
              <a
                href="/join"
                className="rounded-full bg-blue-500 px-4 py-1 text-sm font-semibold text-white hover:bg-blue-600"
              >
                Become a Member
              </a>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
