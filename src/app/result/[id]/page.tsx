"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const DESCRIPTIONS: Record<string, string> = {
    seer: "You think in futures. Where others see the present, you see what could be. Your superpower is vision — you pull people toward a compelling tomorrow.",
    forge: "You ship. While others debate, you execute. Your superpower is turning plans into reality with discipline and relentless follow-through.",
    mirror: "You are the user's voice in every room. You listen deeply, empathize genuinely, and refuse to ship things that hurt the people you serve.",
    compass: "You let data lead. You find truth in numbers, build rigorous frameworks, and make decisions others can trust because the evidence is always there.",
    herald: "You connect people. Your superpower is alignment — you make cross-functional teams feel like one team, and complex org dynamics feel manageable.",
    anchor: "You own it. You act like a founder, move fast, take accountability, and rarely wait for permission. Where others hesitate, you decide.",
};

const DISPLAY_NAMES: Record<string, string> = {
    seer: "The Seer",
    forge: "The Forge",
    mirror: "The Warden",
    compass: "The Sage",
    herald: "The Weaver",
    anchor: "The Sovereign",
};

const STRENGTHS: Record<string, string[]> = {
    seer: ["Visionary thinking", "Inspiring others", "Spotting trends early"],
    forge: ["Reliable delivery", "Scope management", "Execution under pressure"],
    mirror: ["Deep user empathy", "Customer advocacy", "Qualitative research"],
    compass: ["Data rigour", "Hypothesis-driven thinking", "Metric definition"],
    herald: ["Stakeholder alignment", "Cross-functional trust", "Conflict resolution"],
    anchor: ["Ownership mindset", "Fast decision-making", "Founder-level accountability"]
};

const SPECTRUM_TAGLINES: Record<string, string> = {
    seer: "Thinks in futures and possibilities",
    forge: "Ships fast and executes with discipline",
    mirror: "Guards the user above everything else",
    compass: "Finds truth in data and patterns",
    herald: "Connects people and builds alignment",
    anchor: "Owns everything, decides fast"
};

const FAMOUS_ARCHETYPES: Record<string, { name: string, company: string, note: string }[]> = {
    seer: [{ name: "Steve Jobs", company: "Apple", note: "Known for obsessive product vision and taste-driven decisions" }, { name: "Elon Musk", company: "Tesla / SpaceX", note: "Pushing boundaries of what is possible" }],
    forge: [{ name: "Jeff Bezos", company: "Amazon", note: "Relentless execution and operational rigor" }, { name: "Sundar Pichai", company: "Google", note: "Scaling massive products with reliable delivery" }],
    mirror: [{ name: "Stewart Butterfield", company: "Slack", note: "Deep focus on user experience and playfulness" }, { name: "Brian Chesky", company: "Airbnb", note: "Design-led, community-first product building" }],
    compass: [{ name: "Marissa Mayer", company: "Google / Yahoo", note: "Data-driven, A/B testing pioneer" }, { name: "Kevin Systrom", company: "Instagram", note: "Metrics-informed simplicity" }],
    herald: [{ name: "Sheryl Sandberg", company: "Meta", note: "Scaling through massive stakeholder alignment" }, { name: "Satya Nadella", company: "Microsoft", note: "Cultural transformation and empathic leadership" }],
    anchor: [{ name: "Jensen Huang", company: "Nvidia", note: "Founder-led, decisive market positioning" }, { name: "Patrick Collison", company: "Stripe", note: "High agency, deep ownership of the developer experience" }]
};

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
        const shareText = `I'm ${data.hybrid_name} — ${DISPLAY_NAMES[data.primary_type]} × ${DISPLAY_NAMES[data.secondary_type]}. Discover your PM type at https://orlog-test.netlify.app/\n\n${url}`;

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

    const primaryName = DISPLAY_NAMES[data.primary_type] || data.primary_type;
    const secondaryName = DISPLAY_NAMES[data.secondary_type] || data.secondary_type;

    const primaryDesc = DESCRIPTIONS[data.primary_type] || "";
    const secondaryDesc = DESCRIPTIONS[data.secondary_type] || "";

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

                    <div className="relative inline-block mb-2">
                        <h1 className="text-[48px] sm:text-[64px] font-serif font-bold text-earth-dark leading-tight relative z-10">
                            {primaryName}
                        </h1>
                        <span className="absolute bottom-2 sm:bottom-4 left-0 w-full h-3 sm:h-4 bg-earth-terracotta/20 -z-0"></span>
                    </div>

                    <p className="text-lg sm:text-xl font-medium text-earth-muted mb-10 font-serif italic">
                        with traits of {secondaryName}
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
                        <h3 className="text-2xl font-serif font-bold text-earth-dark mb-4">{primaryName}</h3>
                        <p className="text-earth-dark leading-relaxed mb-8 flex-grow">
                            {primaryDesc}
                        </p>
                        <div>
                            <span className="text-sm font-bold uppercase tracking-wider text-earth-muted mb-3 block">Strengths</span>
                            <ul className="space-y-2">
                                {(STRENGTHS[data.primary_type] || []).map((strength, i) => (
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
                        <h3 className="text-2xl font-serif font-bold text-earth-dark mb-4">{secondaryName}</h3>
                        <p className="text-earth-dark leading-relaxed mb-8 flex-grow">
                            {secondaryDesc}
                        </p>
                        <div>
                            <span className="text-sm font-bold uppercase tracking-wider text-earth-muted mb-3 block">Strengths</span>
                            <ul className="space-y-2">
                                {(STRENGTHS[data.secondary_type] || []).map((strength, i) => (
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
                        {Object.entries(DISPLAY_NAMES).map(([key, name]) => {
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
                                        {name.replace("The ", "").charAt(0)}
                                    </div>
                                    <h4 className="font-serif font-bold text-earth-dark text-lg mb-2">{name}</h4>
                                    <p className="text-sm text-earth-muted leading-relaxed">
                                        {SPECTRUM_TAGLINES[key]}
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
                        {(FAMOUS_ARCHETYPES[data.primary_type] || []).map((person, i) => (
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
