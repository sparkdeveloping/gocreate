"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Play, XIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const animationVariants = {
  "from-bottom": {
    initial: { y: "100%", opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: "100%", opacity: 0 },
  },
  "from-center": {
    initial: { scale: 0.5, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.5, opacity: 0 },
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
};

export default function HeroVideoDialog({
  animationStyle = "from-center",
  videoSrc,
  thumbnailSrc,
  thumbnailAlt = "Video thumbnail",
  className,
}) {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const selectedAnimation = animationVariants[animationStyle];

  return (
    <div className={cn("relative", className)}>
      {/* Video Thumbnail */}
      <div
        className="relative cursor-pointer group"
        onClick={() => setIsVideoOpen(true)}
        tabIndex={0}
        role="button"
        aria-label="Play Video"
      >
        <div className="relative w-full h-[100vh] overflow-hidden">
          <img
            src={thumbnailSrc}
            alt={thumbnailAlt}
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Radial gradient overlay */}
          <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/20 to-black/60 pointer-events-none" />
        </div>

        <div className="absolute inset-0 flex items-center justify-center transition-all duration-200 ease-out rounded-2xl">
          <div className="bg-primary/10 flex items-center justify-center rounded-full backdrop-blur-md h-28 w-28">
            <div className="bg-gradient-to-b from-primary/30 to-primary shadow-md rounded-full h-20 w-20 flex items-center justify-center group-hover:scale-110 transition-all duration-200 ease-out">
              <Play
                className="h-8 w-8 text-white"
                style={{
                  filter:
                    "drop-shadow(0 4px 3px rgba(0, 0, 0, 0.07)) drop-shadow(0 2px 2px rgba(0, 0, 0, 0.06))",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Video Dialog */}
      <AnimatePresence>
        {isVideoOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsVideoOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md"
          >
            <motion.div
              {...selectedAnimation}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative w-full max-w-4xl aspect-video mx-4 md:mx-0"
            >
              <button
                onClick={() => setIsVideoOpen(false)}
                aria-label="Close Video"
                className="absolute -top-16 right-0 text-white text-xl bg-neutral-900/50 ring-1 backdrop-blur-md rounded-full p-2 dark:bg-neutral-100/50 dark:text-black"
              >
                <XIcon className="h-5 w-5" />
              </button>
              <div className="w-full h-full border-2 border-white rounded-2xl overflow-hidden relative">
                <iframe
                  src={videoSrc}
                  className="w-full h-full rounded-2xl"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  title="Hero Video"
                ></iframe>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
