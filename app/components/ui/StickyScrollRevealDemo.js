"use client";

import React from "react";
import { StickyScroll } from "./sticky-scroll-reveal";
import Image from "next/image";

const content = [
  {
    title: "Design Studio",
    description:
      "Unleash your creativity with state-of-the-art tools for graphic design, 3D modeling, and digital art. Perfect for bringing your ideas to life with precision and flair.",
    content: (
      <Image
        src="/images/design-studio.jpg"
        width={300}
        height={300}
        alt="Design Studio"
        className="h-full w-full object-cover"
      />
    ),
  },
  {
    title: "Woods Studio",
    description:
      "Craft stunning wooden projects in our fully equipped workshop. From carving to furniture making, the Woods Studio is your playground for all things timber.",
    content: (
      <Image
        src="/images/woods-studio.jpg"
        width={300}
        height={300}
        alt="Woods Studio"
        className="h-full w-full object-cover"
      />
    ),
  },
  {
    title: "Metals Studio",
    description:
      "Explore metalworking with cutting-edge tools for welding, machining, and forging. Create intricate designs or robust structures in a space designed for innovation.",
    content: (
      <Image
        src="/images/metals-studio.jpg"
        width={300}
        height={300}
        alt="Metals Studio"
        className="h-full w-full object-cover"
      />
    ),
  },
  {
    title: "Textiles Studio",
    description:
      "Dive into the world of textiles with sewing machines, embroidery tools, and fabric printing equipment. Bring your fashion and fabric dreams to life.",
    content: (
      <Image
        src="/images/textiles-studio.jpg"
        width={300}
        height={300}
        alt="Textiles Studio"
        className="h-full w-full object-cover"
      />
    ),
  },
  {
    title: "Electronics Studio",
    description:
      "Innovate with cutting-edge electronics equipment for prototyping, robotics, and IoT projects. From soldering stations to microcontrollers, we have it all.",
    content: (
      <Image
        src="/images/electronics-studio.jpg"
        width={300}
        height={300}
        alt="Electronics Studio"
        className="h-full w-full object-cover"
      />
    ),
  },
];

export default function StickyScrollRevealDemo() {
  return (
    <div className="px-6 py-10 max-w-7xl mx-auto">
      {/* Gray Background Wrapper */}
      <h2 className="max-w-7xl pl-4 mx-auto text-xl md:text-5xl font-bold text-neutral-800 dark:text-neutral-200 font-sans">
        Studios
      </h2>
      <div className="bg-gray-100 rounded-lg p-10">
        <StickyScroll
          content={content}
          contentClassName="bg-white" // Matches the sticky content background for smooth integration
        />
      </div>
    </div>
  );
}
