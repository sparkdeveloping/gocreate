"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, useMotionValue, useMotionTemplate } from "framer-motion";

const Input = React.forwardRef(
  ({ className, type = "text", placeholder, ...props }, ref) => {
    const [isHovered, setIsHovered] = React.useState(false);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const radius = 150; // Adjust hover effect size

    // Handle mouse position
    const handleMouseMove = (event) => {
      const { left, top } = event.currentTarget.getBoundingClientRect();
      mouseX.set(event.clientX - left);
      mouseY.set(event.clientY - top);
    };

    return (
      <motion.div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseMove={handleMouseMove}
        style={{
          background: useMotionTemplate`
            radial-gradient(
              ${
                isHovered ? `${radius}px` : "0px"
              } circle at ${mouseX}px ${mouseY}px,
              var(--blue-500),
              transparent 80%
            )
          `,
        }}
        className="relative p-[2px] rounded-md transition-all duration-300"
      >
        <input
          type={type}
          placeholder={placeholder}
          className={cn(
            `block h-10 w-full border border-gray-300 dark:border-gray-700 
             bg-white dark:bg-gray-900 text-black dark:text-white 
             rounded-md px-3 py-2 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-600 
             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 
             disabled:cursor-not-allowed disabled:opacity-50 
             transition-all duration-200`,
            className
          )}
          ref={ref}
          {...props}
        />
      </motion.div>
    );
  }
);

Input.displayName = "Input";

export { Input };
