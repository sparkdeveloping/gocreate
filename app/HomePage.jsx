"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { PreviewCards } from "@/components/ui/PreviewCards";
import StickyScrollRevealDemo from "@/components/ui/StickyScrollRevealDemo";
import HeroVideoDialog from "@/components/ui/hero-video-dialog";

export default function HomePage() {
  return (
    <div className="bg-white">
      {/* Home Content */}
      <HomeContent />
    </div>
  );
}

function HomeContent() {
  return (
    <div>
      <Section
        videoSrc="https://www.youtube.com/embed/xPfprSotic0"
        thumbnailSrc="../hero.png"
        subheading="The future is not tomorrow"
        heading="It's Today"
      >
        <StickyScrollRevealDemo />
        <PreviewCards />
      </Section>
    </div>
  );
}

const Section = ({ videoSrc, thumbnailSrc, subheading, heading, children }) => {
  return (
    <div className="px-0">
      <div className="relative h-[150vh]">
        <StickyVideo videoSrc={videoSrc} thumbnailSrc={thumbnailSrc} />
        <OverlayCopy heading={heading} subheading={subheading} />
      </div>
      {children}
    </div>
  );
};

const StickyVideo = ({ videoSrc, thumbnailSrc }) => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["end end", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.85]);
  const borderRadius = useTransform(scrollYProgress, [0, 0.5], ["0px", "30px"]);

  return (
    <motion.div
      style={{ scale, borderRadius }}
      ref={targetRef}
      className="sticky z-0 overflow-hidden h-[calc(100vh)] top-0 w-full"
    >
      {/* Hero Video */}
      <div className="relative z-20 pointer-events-auto h-full w-full">
        <HeroVideoDialog
          animationStyle="from-center"
          videoSrc={videoSrc}
          thumbnailSrc={thumbnailSrc}
          thumbnailAlt="Hero Video"
          className="h-full w-full object-cover"
        />
      </div>

      {/* Background overlay */}
      <motion.div className="absolute inset-0 bg-neutral-900/60 z-10 pointer-events-none" />
    </motion.div>
  );
};

const OverlayCopy = ({ subheading, heading }) => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [250, -250]);
  const opacity = useTransform(scrollYProgress, [0.25, 0.5, 0.75], [0, 1, 0]);

  return (
    <motion.div
      style={{ y, opacity }}
      ref={targetRef}
      className="absolute inset-0 flex h-screen w-full flex-col items-center justify-center text-white"
    >
      <p className="mb-2 text-center text-xl md:mb-4 md:text-3xl font-bold">
        {subheading}
      </p>
      <p className="text-center text-4xl md:text-7xl font-bold">{heading}</p>
    </motion.div>
  );
};
