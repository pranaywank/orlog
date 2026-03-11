"use client";

import { motion } from "motion/react";
import Link from "next/link";

export default function MotionTestPage() {
  return (
    // Page transition (fade between routes)
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-black text-white p-12 flex flex-col items-center justify-center space-y-12"
    >
      <h1 className="text-3xl font-bold">Motion Verification Page</h1>

      <div className="space-y-8">
        {/* Fade in up */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="p-6 bg-zinc-900 rounded-xl border border-zinc-800"
        >
          <h2 className="text-xl font-semibold mb-2">1. Fade In Up</h2>
          <p className="text-zinc-400">Opacity 0 → 1, y 20 → 0</p>
        </motion.div>

        {/* Stagger children */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
          className="p-6 bg-zinc-900 rounded-xl border border-zinc-800"
        >
          <h2 className="text-xl font-semibold mb-4">2. Stagger Children</h2>
          <ul className="space-y-2">
            {[1, 2, 3].map((item) => (
              <motion.li
                key={item}
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: { opacity: 1, x: 0 },
                }}
                className="bg-zinc-800 py-2 px-4 rounded"
              >
                Child {item} (Delayed by 100ms)
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Scale on hover */}
        <div className="p-6 bg-zinc-900 rounded-xl border border-zinc-800">
          <h2 className="text-xl font-semibold mb-4">3. Scale on Hover</h2>
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className="bg-blue-600 hover:bg-blue-500 py-4 px-6 rounded-lg text-center cursor-pointer"
          >
            Hover Me! (1.0 → 1.02)
          </motion.div>
        </div>
      </div>
      
      <Link href="/" className="text-blue-400 hover:underline">
        Go Back Home
      </Link>
    </motion.div>
  );
}
