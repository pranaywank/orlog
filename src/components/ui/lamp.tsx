"use client";
import React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export const LampEffect = ({
  className,
}: {
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "absolute inset-0 flex w-full flex-col items-center justify-start overflow-visible bg-transparent z-0 pointer-events-none",
        className
      )}
    >
      <div className="absolute top-[8vh] flex w-full flex-1 items-center justify-center isolate z-0">
        <motion.div
          initial={{ opacity: 0, width: "30vw" }}
          animate={{ opacity: 1, width: "60vw" }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-auto right-1/2 h-64 w-[60vw] max-w-[800px] bg-gradient-to-br from-[#6B2A1A] to-transparent text-white blur-3xl origin-bottom-right"
        />
        <motion.div
          initial={{ opacity: 0, width: "30vw" }}
          animate={{ opacity: 1, width: "60vw" }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-auto left-1/2 h-64 w-[60vw] max-w-[800px] bg-gradient-to-bl from-[#6B2A1A] to-transparent text-white blur-3xl origin-bottom-left"
        />
        <div className="absolute inset-auto z-50 h-40 w-[100vw] max-w-[1200px] -translate-y-[10%] rounded-full bg-[#6B2A1A] opacity-20 blur-[100px]"></div>
      </div>
    </div>
  );
};
