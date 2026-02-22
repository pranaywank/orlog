"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { PM_TYPES } from "@/constants/types";

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

    // Validate presence of required URL parameters
    useEffect(() => {
        const primary = searchParams.get("primary");
        const secondary = searchParams.get("secondary");
        const hybrid = searchParams.get("hybrid");
        const scores = searchParams.get("scores");

        if (!primary || !secondary) {
            // Redirect to test if no results are found in URL
            router.push("/test");
            return;
        }

        setPrimaryType(primary);
        setSecondaryType(secondary);
        setHybridName(hybrid || "The Enigma");

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
            // Insert into Supabase
            const { data, error: supaError } = await supabase
                .from("sessions")
                .insert([
                    {
                        name: name.trim(),
                        email: email.trim(),
                        primary_type: primaryType,
                        secondary_type: secondaryType,
                        hybrid_name: hybridName,
                        dimension_scores: dimensionScores
                    },
                ])
                .select();

            if (supaError) {
                console.error("Supabase Error:", supaError);
                throw new Error("Something went wrong. Please try again.");
            }

            // Success
            if (data && data.length > 0) {
                router.push(`/ result / ${data[0].id} `);
            } else {
                throw new Error("Failed to retrieve session ID.");
            }
        } catch (err: any) {
            setError(err.message || "Something went wrong. Please try again.");
            setLoading(false);
        }
    };

    // Prevent flash of content before redirecting if missing params
    if (!primaryType || !secondaryType) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans selection:bg-black selection:text-white">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-black"></div>
            </div>
        );
    }

    const primaryData = PM_TYPES[primaryType as keyof typeof PM_TYPES];
    const secondaryData = PM_TYPES[secondaryType as keyof typeof PM_TYPES];

    const primaryTitle = primaryData ? `${primaryData.name} — ${primaryData.subtitle} ` : `The ${primaryType} `;
    const secondaryTitle = secondaryData ? `${secondaryData.name} — ${secondaryData.subtitle} ` : `The ${secondaryType} `;

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans selection:bg-black selection:text-white px-6 py-12">
            <div className="w-full max-w-lg bg-white p-8 sm:p-12 rounded-3xl shadow-sm border border-zinc-200 animate-in fade-in zoom-in-95 duration-500 text-center">
                <div className="mb-8">
                    <p className="text-sm font-semibold tracking-widest text-zinc-400 uppercase mb-3">Your Result</p>
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-black mb-3">{primaryTitle}</h1>
                    <p className="text-base sm:text-lg text-zinc-500 font-medium leading-relaxed">
                        with traits of <span className="text-zinc-700">{secondaryTitle}</span>
                    </p>
                </div>
                <div className="text-center mb-10">
                    <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-black mb-3">
                        One last step before your results
                    </h2>
                    <p className="text-zinc-500 text-sm sm:text-base leading-relaxed">
                        We'll use this to personalize your results.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2 relative">
                        <label htmlFor="name" className="text-sm font-medium text-zinc-700 ml-1">
                            Your Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={loading}
                            placeholder="e.g. Avery PM"
                            className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3.5 text-black placeholder:text-zinc-400 focus:border-black focus:bg-white focus:outline-none focus:ring-1 focus:ring-black disabled:opacity-50 transition-colors"
                        />
                    </div>

                    <div className="flex flex-col gap-2 relative">
                        <label htmlFor="email" className="text-sm font-medium text-zinc-700 ml-1">
                            Work Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                            placeholder="you@company.com"
                            className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3.5 text-black placeholder:text-zinc-400 focus:border-black focus:bg-white focus:outline-none focus:ring-1 focus:ring-black disabled:opacity-50 transition-colors"
                        />
                    </div>

                    {error && (
                        <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium animate-in slide-in-from-top-2 duration-300">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="group relative mt-4 flex w-full items-center justify-center rounded-ull bg-black px-6 py-4 text-sm sm:text-base font-medium text-white transition-all hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-70 disabled:hover:bg-black rounded-full"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                    </button>
                </form>
            </div>
        </div>
    );
}

import { Suspense } from 'react';

export default function CapturePage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-black"></div>
            </div>
        }>
            <CaptureContent />
        </Suspense>
    );
}
