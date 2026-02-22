"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { PM_TYPES } from "@/constants/types";

interface SessionData {
    name: string;
    primary_type: string;
    secondary_type: string;
    hybrid_name: string;
    dimension_scores?: any;
}

import PMRadarChart from "@/components/results/PMRadarChart";

export default function ResultPage() {
    const params = useParams();
    const router = useRouter();

    const [data, setData] = useState<SessionData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        async function fetchSession() {
            if (!params?.id) {
                setError(true);
                setLoading(false);
                return;
            }

            try {
                const { data: sessionData, error: supaError } = await supabase
                    .from("sessions")
                    .select("name, primary_type, secondary_type, hybrid_name, dimension_scores")
                    .eq("id", params.id)
                    .single();

                if (supaError || !sessionData) {
                    throw new Error("Not found");
                }

                setData(sessionData as SessionData);
            } catch (err) {
                console.error(err);
                setError(true);
            } finally {
                setLoading(false);
            }
        }

        fetchSession();
    }, [params?.id]);

    const handleCopy = async () => {
        if (!data) return;

        const url = window.location.href;
        const shareText = `I just discovered I'm ${data.hybrid_name} on Orlog.\nMy PM type: ${primaryData?.name} (${primaryData?.subtitle}) × ${secondaryData?.name} (${secondaryData?.subtitle}).\nFind out your PM personality → orlog.app\n\n${url}`;

        try {
            await navigator.clipboard.writeText(shareText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy", err);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-earth-cream">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-earth-border border-t-earth-terracotta"></div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-earth-cream px-6 font-sans text-center">
                <h2 className="text-2xl font-serif font-semibold text-earth-dark mb-4">We couldn't find your results.</h2>
                <p className="text-earth-muted mb-8 max-w-sm">Try taking the test again to discover your PM nature.</p>
                <button
                    onClick={() => router.push("/test")}
                    className="group inline-flex h-12 items-center justify-center rounded-full bg-earth-dark px-8 font-medium text-white transition-all hover:bg-black"
                >
                    Retake Test <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </button>
            </div>
        );
    }

    const primaryTypeKey = data.primary_type as keyof typeof PM_TYPES;
    const secondaryTypeKey = data.secondary_type as keyof typeof PM_TYPES;
    const primaryData = PM_TYPES[primaryTypeKey];
    const secondaryData = PM_TYPES[secondaryTypeKey];

    const primaryName = primaryData?.name || `The ${data.primary_type}`;
    const primarySubtitle = primaryData?.subtitle || "";
    const primaryDesc = primaryData?.description || "";

    const secondaryName = secondaryData?.name || `The ${data.secondary_type}`;
    const secondarySubtitle = secondaryData?.subtitle || "";
    const secondaryDesc = secondaryData?.description || "";

    return (
        <div className="flex min-h-screen flex-col items-center bg-earth-cream font-sans selection:bg-earth-terracotta selection:text-white pb-24">

            {/* Top Border Accent */}
            <div className="w-full h-[3px] bg-earth-terracotta absolute top-0 left-0"></div>

            <div className="w-full max-w-[900px] px-6 pt-16 sm:pt-24 animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both">

                {/* --- SECTION 1: HERO --- */}
                <section className="text-center mb-24 relative">
                    {/* Subtle gradient behind hero text */}
                    <div className="absolute inset-0 bg-gradient-to-b from-earth-terracotta/5 to-transparent -z-10 rounded-[100px] blur-3xl opacity-50 block md:hidden"></div>

                    <p className="text-xs sm:text-sm font-bold tracking-[0.2em] text-earth-terracotta uppercase mb-6">
                        Your Orlog Result
                    </p>
                    <h2 className="text-2xl sm:text-3xl font-serif text-earth-dark mb-2">
                        {data.name}, you are…
                    </h2>

                    <div className="relative inline-block mb-1">
                        <h1 className="text-[48px] sm:text-[64px] font-serif font-bold text-earth-dark leading-tight relative z-10">
                            {primaryName}
                        </h1>
                        <span className="absolute bottom-2 sm:bottom-4 left-0 w-full h-3 sm:h-4 bg-earth-terracotta/20 -z-0"></span>
                    </div>

                    {primarySubtitle && (
                        <p className="text-xl sm:text-2xl font-serif italic text-earth-muted mb-6">
                            {primarySubtitle}
                        </p>
                    )}

                    <p className="text-lg sm:text-xl font-medium text-earth-dark mb-10 font-serif italic">
                        with traits of {secondaryName}{secondarySubtitle ? ` — ${secondarySubtitle}` : ""}
                    </p>

                    <div className="flex flex-col items-center gap-4">
                        <div className="inline-flex items-center justify-center px-6 py-2 rounded-full bg-earth-sage text-white font-semibold text-sm sm:text-base tracking-wide shadow-sm">
                            {data.hybrid_name}
                        </div>
                        <p className="text-earth-dark font-medium max-w-md mx-auto text-sm sm:text-base">
                            {primaryDesc.split('.')[0]}.
                        </p>
                    </div>
                </section>

                {/* --- SECTION 2: RADAR CHART --- */}
                <section className="mb-24 flex flex-col items-center">
                    <h2 className="text-3xl font-serif font-bold text-earth-dark mb-8 text-center">Your PM Signature</h2>
                    <PMRadarChart scores={data.dimension_scores} />
                </section>

                {/* --- SECTION 3: TYPE DESCRIPTION CARDS --- */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
                    {/* Primary Card */}
                    <div className="bg-earth-card p-8 sm:p-10 rounded-2xl border border-earth-border shadow-sm border-l-4 border-l-earth-terracotta flex flex-col">
                        <span className="text-xs font-bold tracking-widest text-earth-terracotta uppercase mb-4">Primary Type</span>
                        <h3 className="text-3xl font-serif font-bold text-earth-dark mb-1">{primaryName}</h3>
                        <p className="text-lg font-serif italic text-earth-muted mb-6">{primarySubtitle}</p>
                        <p className="text-earth-dark leading-relaxed mb-8 flex-grow">
                            {primaryDesc}
                        </p>
                        <div>
                            <span className="text-sm font-bold uppercase tracking-wider text-earth-muted mb-3 block">Strengths</span>
                            <ul className="space-y-2">
                                {(primaryData?.strengths || []).map((strength, i) => (
                                    <li key={i} className="flex items-start gap-2 text-earth-dark text-sm sm:text-base">
                                        <span className="text-earth-terracotta mt-0.5">•</span> {strength}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Secondary Card */}
                    <div className="bg-earth-card p-8 sm:p-10 rounded-2xl border border-earth-border shadow-sm border-l-4 border-l-earth-sage flex flex-col">
                        <span className="text-xs font-bold tracking-widest text-earth-sage uppercase mb-4">Secondary Type</span>
                        <h3 className="text-3xl font-serif font-bold text-earth-dark mb-1">{secondaryName}</h3>
                        <p className="text-lg font-serif italic text-earth-muted mb-6">{secondarySubtitle}</p>
                        <p className="text-earth-dark leading-relaxed mb-8 flex-grow">
                            {secondaryDesc}
                        </p>
                        <div>
                            <span className="text-sm font-bold uppercase tracking-wider text-earth-muted mb-3 block">Strengths</span>
                            <ul className="space-y-2">
                                {(secondaryData?.strengths || []).map((strength, i) => (
                                    <li key={i} className="flex items-start gap-2 text-earth-dark text-sm sm:text-base">
                                        <span className="text-earth-sage mt-0.5">•</span> {strength}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>

                {/* --- SECTION 4: THE PM SPECTRUM --- */}
                <section className="mb-24">
                    <h2 className="text-3xl font-serif font-bold text-earth-dark mb-8 text-center">The PM Spectrum</h2>
                    <div className="flex overflow-x-auto pb-4 gap-4 snap-x snap-mandatory hide-scrollbars md:grid md:grid-cols-3 md:gap-6 md:overflow-visible">
                        {Object.values(PM_TYPES).map((type) => {
                            const key = type.key;
                            const isPrimary = key === data.primary_type;
                            const isSecondary = key === data.secondary_type;

                            let borderClass = "border-earth-border opacity-60";
                            let badge = null;
                            let circleBg = "bg-earth-muted text-white";

                            if (isPrimary) {
                                borderClass = "border-earth-terracotta border-2 opacity-100 shadow-sm";
                                circleBg = "bg-earth-terracotta text-white";
                                badge = <span className="absolute -top-3 right-4 bg-earth-terracotta text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full">That's you</span>;
                            } else if (isSecondary) {
                                borderClass = "border-earth-sage border-2 opacity-100 shadow-sm";
                                circleBg = "bg-earth-sage text-white";
                                badge = <span className="absolute -top-3 right-4 bg-earth-sage text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full">Your Secondary</span>;
                            }

                            return (
                                <div key={key} className={`bg-earth-card p-6 rounded-2xl border relative flex-shrink-0 w-[260px] md:w-auto snap-center flex flex-col items-center text-center transition-opacity ${borderClass}`}>
                                    {badge}
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-serif font-bold text-xl mb-4 ${circleBg}`}>
                                        {type.name.replace("The ", "").charAt(0)}
                                    </div>
                                    <h4 className="font-serif font-bold text-earth-dark text-xl mb-0">{type.name}</h4>
                                    <p className="text-sm font-serif italic text-earth-muted mb-3">{type.subtitle}</p>
                                    <p className="text-sm text-earth-dark/80 leading-relaxed font-medium">
                                        {type.tagline}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* --- SECTION 5: FAMOUS ARCHETYPES --- */}
                <section className="mb-32">
                    <h2 className="text-3xl font-serif font-bold text-earth-dark mb-8 text-center">You're in Good Company</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {(primaryData?.famousPMs || []).map((person, i) => (
                            <div key={i} className="bg-earth-card p-6 rounded-2xl border border-earth-border shadow-sm hover:shadow-md transition-shadow">
                                <h4 className="font-serif font-bold text-earth-dark text-xl mb-1">{person.name}</h4>
                                <p className="text-earth-muted text-sm font-medium mb-3 uppercase tracking-wider">{person.company}</p>
                                <p className="text-earth-dark text-sm leading-relaxed">
                                    "{person.note}"
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* --- SECTION 6: SHARE & RETAKE --- */}
                <section className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 border-t border-earth-border pt-12">
                    <button
                        onClick={handleCopy}
                        className="group relative flex h-14 w-full sm:w-auto min-w-[240px] items-center justify-center rounded-xl bg-earth-terracotta px-8 font-medium text-white transition-all hover:bg-[#A34B2E] focus:outline-none focus:ring-2 focus:ring-earth-terracotta focus:ring-offset-2 shadow-sm"
                    >
                        {copied ? (
                            <span className="flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                Copied to clipboard!
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                Share My Result <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </span>
                        )}
                    </button>

                    <button
                        onClick={() => router.push("/test")}
                        className="flex h-14 w-full sm:w-auto min-w-[200px] items-center justify-center rounded-xl bg-transparent border-2 border-earth-sage px-8 font-medium text-earth-sage transition-all hover:bg-earth-sage hover:text-white focus:outline-none focus:ring-2 focus:ring-earth-sage focus:ring-offset-2"
                    >
                        Retake Test
                    </button>
                </section>

            </div>
        </div>
    );
}
