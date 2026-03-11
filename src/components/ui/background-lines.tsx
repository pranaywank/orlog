"use client";
import React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export const BackgroundLines = ({
  className,
}: {
  className?: string;
}) => {
  const paths = [
    "M-100,50 Q250,150 500,50 T1100,50",
    "M-100,250 Q250,50 500,250 T1100,250",
    "M-100,450 Q250,350 500,450 T1100,450",
    "M-100,650 Q250,850 500,650 T1100,650",
    "M-100,850 Q250,750 500,850 T1100,850",
    "M-100,1050 Q250,950 500,1050 T1100,1050",
  ];

  return (
    <div className={cn("absolute inset-0 z-0 h-full w-full pointer-events-none overflow-hidden", className)}>
      <svg
        className="absolute w-full h-full opacity-40"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
      >
        {paths.map((path, i) => (
          <motion.path
            key={i}
            d={path}
            fill="none"
            stroke="#1E1A17"
            strokeWidth="1"
            initial={{ strokeDashoffset: 1000, strokeDasharray: 1000 }}
            animate={{ strokeDashoffset: 0 }}
            transition={{
              duration: 25 + i * 2,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </svg>
    </div>
  );
};
