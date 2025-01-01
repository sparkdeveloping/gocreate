import React from "react";

export function DotBackground({ children, className = "" }) {
  return (
    <div
      className={`relative h-full w-full dark:bg-black bg-white bg-dot-gray-300 dark:bg-dot-gray-700 ${className}`}
    >
      {/* Radial fade effect */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent to-black/50 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
