"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { PM_TYPES } from "@/constants/types";
import { Spotlight } from "@/components/ui/spotlight";
import * as motion from "motion/react-client";

export const dynamic = 'force-dynamic'; // Prevent static prerendering issues

function CaptureContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [primaryType, setPrimaryType] = useState<string | null>(null);
    const [secondaryType, setSecondaryType] = useState<string | null>(null);
    const [hybridName, setHybridName] = useState<string | null>(null);
    const [dimensionScores, setDimensionScores] = useState<any>(null);
    const [success, setSuccess] = useState(false);

    // Validate presence of required URL parameters
    useEffect(() => {
        const primary = searchParams.get("primary");
        const secondary = searchParams.get("secondary");
        const hybrid = searchParams.get("hybrid");
        const scores = searchParams.get("scores");

        if (!primary || !secondary) {
            router.push("/test");
            return;
        }

        setPrimaryType(primary);
        setSecondaryType(secondary);
        setHybridName(hybrid);

        if (scores) {
            try {
                setDimensionScores(JSON.parse(scores));
            } catch (e) {
                console.error("Failed to parse dimension scores", e);
            }
        }
    }, [router, searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Basic Validation
        if (!name.trim() || !email.trim()) {
            setError("Please fill in all fields.");
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            setError("Please enter a valid email address.");
            return;
        }

        setLoading(true);

        try {
            // Insert into Firestore
            const docRef = await addDoc(collection(db, "sessions"), {
                name: name.trim(),
                email: email.trim(),
                primary_type: primaryType,
                secondary_type: secondaryType,
                hybrid_name: hybridName,
                dimension_scores: dimensionScores,
                created_at: serverTimestamp(),
            });

            // Success — navigate to result page using the new doc ID
            setSuccess(true);
            setTimeout(() => {
                router.push(`/result/${docRef.id}`);
            }, 600); // Wait for transition
        } catch (err: any) {
            console.error("Firebase Error:", err);
            setError(err.message || "Something went wrong. Please try again.");
            setLoading(false);
        }
    };

    if (!primaryType || !secondaryType) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A] font-sans">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2A2A2A] border-t-[#C45C3A]"></div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 1, scale: 1 }}
            animate={success ? { opacity: 0, scale: 0.95 } : { opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex min-h-screen items-center justify-center bg-[#0A0A0A] font-sans selection:bg-[#C45C3A] selection:text-white px-6 py-12 relative overflow-hidden"
        >
            <Spotlight className="-top-40 left-0 md:left-60 md:-top-20 opacity-30" fill="#C45C3A" />
            
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={{ hidden: { y: 30 }, visible: { y: 0, transition: { staggerChildren: 0.15 } } }}
                className="w-full max-w-lg bg-[#111111] p-8 sm:p-12 rounded-3xl shadow-[0_0_20px_rgba(196,92,58,0.2)] border border-[#C45C3A] text-center z-10"
            >
                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="mb-10 mt-4 text-center">
                    <p className="text-xs font-bold tracking-[0.2em] text-[#C45C3A] uppercase mb-4">
                        ALMOST THERE
                    </p>
                    <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-[#F5F0E8] mb-3">
                        One last step before your results
                    </h1>
                    <p className="text-base sm:text-lg text-[#8A8480] font-medium leading-relaxed">
                        Where should we send your PM personality report?
                    </p>
                </motion.div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6 text-left">
                    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="flex flex-col gap-2 relative group layout">
                        <label htmlFor="name" className="text-sm font-medium text-[#F5F0E8] ml-1">
                            Your Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={loading || success}
                            placeholder="e.g. Avery PM"
                            className="w-full rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] px-4 py-3.5 text-[#F5F0E8] placeholder:text-[#4A4540] focus:border-[#C45C3A] focus:outline-none focus:ring-1 focus:ring-[#C45C3A] disabled:opacity-50 transition-colors relative z-10"
                        />
                        <motion.div 
                            className="absolute -inset-[2px] rounded-[14px] opacity-0 group-focus-within:opacity-100 bg-gradient-to-r from-[#C45C3A]/40 to-transparent blur-sm -z-0"
                            layoutId="name-glow"
                            initial={{ opacity: 0 }}
                            whileFocus={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                        />
                    </motion.div>

                    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="flex flex-col gap-2 relative group layout">
                        <label htmlFor="email" className="text-sm font-medium text-[#F5F0E8] ml-1">
                            Work Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading || success}
                            placeholder="you@company.com"
                            className="w-full rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] px-4 py-3.5 text-[#F5F0E8] placeholder:text-[#4A4540] focus:border-[#C45C3A] focus:outline-none focus:ring-1 focus:ring-[#C45C3A] disabled:opacity-50 transition-colors relative z-10"
                        />
                        <motion.div 
                            className="absolute -inset-[2px] rounded-[14px] opacity-0 group-focus-within:opacity-100 bg-gradient-to-r from-[#C45C3A]/40 to-transparent blur-sm -z-0"
                            layoutId="email-glow"
                            initial={{ opacity: 0 }}
                            whileFocus={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                        />
                        {error && (
                            <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-red-500/80 text-sm font-medium mt-1 ml-1">
                                {error}
                            </motion.p>
                        )}
                    </motion.div>

                    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                        <motion.button
                            type="submit"
                            disabled={loading || success}
                            whileHover={{ scale: 1.02, filter: "brightness(1.1)" }}
                            whileTap={{ scale: 0.98 }}
                            className="group relative mt-4 flex w-full items-center justify-center rounded-full bg-[#C45C3A] px-6 py-4 text-sm sm:text-base font-bold text-white transition-all shadow-lg shadow-[#C45C3A]/20 focus:outline-none focus:ring-2 focus:ring-[#C45C3A] focus:ring-offset-2 focus:ring-offset-[#111111] disabled:opacity-70 disabled:hover:scale-100 disabled:hover:filter-none"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    Show My Results
                                    <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                                </span>
                            )}
                        </motion.button>
                    </motion.div>
                </form>
            </motion.div>
        </motion.div>
    );
}

import { Suspense } from 'react';

export default function CapturePage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A] font-sans">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2A2A2A] border-t-[#C45C3A]"></div>
            </div>
        }>
            <CaptureContent />
        </Suspense>
    );
}
