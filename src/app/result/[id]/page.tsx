"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { PM_TYPES } from "@/constants/types";
import { TracingBeam } from "@/components/ui/tracing-beam";
import { SparklesCore } from "@/components/ui/sparkles";
import * as motion from "motion/react-client";
import { AnimatePresence } from "motion/react";

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
    const [copiedText, setCopiedText] = useState<string | null>(null);
    const [isGeneratingCard, setIsGeneratingCard] = useState(false);

    useEffect(() => {
        async function fetchSession() {
            if (!params?.id) {
                setError(true);
                setLoading(false);
                return;
            }

            try {
                const docRef = doc(db, "sessions", params.id as string);
                const docSnap = await getDoc(docRef);

                if (!docSnap.exists()) {
                    throw new Error("Not found");
                }

                setData(docSnap.data() as SessionData);
            } catch (err) {
                console.error(err);
                setError(true);
            } finally {
                setLoading(false);
            }
        }

        fetchSession();
    }, [params?.id]);

    const primaryTypeKey = data?.primary_type as keyof typeof PM_TYPES;
    const secondaryTypeKey = data?.secondary_type as keyof typeof PM_TYPES;
    const primaryData = PM_TYPES[primaryTypeKey];
    const secondaryData = PM_TYPES[secondaryTypeKey];

    const primaryName = primaryData?.name || (data ? `The ${data.primary_type}` : "");
    const primarySubtitle = primaryData?.subtitle || "";
    const secondaryName = secondaryData?.name || (data ? `The ${data.secondary_type}` : "");
    const secondarySubtitle = secondaryData?.subtitle || "";

    const getLinkedInText = () => {
        if (!data) return "";
        return `I just took the Orlog PM Personality Test and here's what I found out about myself.\n\n🧭 My PM Type: ${data.hybrid_name}\n${primaryName} (${primarySubtitle}) × ${secondaryName} (${secondarySubtitle})\n\nIt's a 15-minute experiential test — 30 real product scenarios that reveal how you actually think, decide, and lead as a PM.\n\nCurious what type you are? Find out here:\norlog.fourg.dev`;
    };

    const getTwitterText = () => {
        if (!data) return "";
        return `Just discovered I'm ${data.hybrid_name} on @OrlogPM — ${primaryName} × ${secondaryName}.\n\nA PM personality test built on real product scenarios, not abstract questions.\n\nFind out your type 👇`;
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(`https://orlog.fourg.dev/result/${params?.id}`);
            setCopiedText("Link copied! Share it anywhere → the preview will show your result card.");
            setTimeout(() => setCopiedText(null), 3000);
        } catch (err) {
            console.error("Failed to copy", err);
        }
    };

    const handleLinkedInShare = async () => {
        try {
            await navigator.clipboard.writeText(getLinkedInText());
            setCopiedText("Caption copied! Paste it as your LinkedIn post.");
            setTimeout(() => setCopiedText(null), 4000);
            
            const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://orlog.fourg.dev/result/${params?.id}`)}`;
            window.open(url, '_blank', 'noopener,noreferrer');
        } catch (err) {
            console.error("Failed to copy to clipboard for LinkedIn", err);
        }
    };

    const handleTwitterShare = () => {
        const text = getTwitterText();
        const url = `https://orlog.fourg.dev/result/${params?.id}`;
        const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        window.open(tweetUrl, '_blank', 'noopener,noreferrer');
    };

    const downloadCard = async () => {
        setIsGeneratingCard(true);
        try {
            const html2canvas = (await import('html2canvas')).default;
            const element = document.getElementById("share-card-wrapper");
            const container = document.getElementById("share-card-container");
            
            if (element && container) {
                // Temporarily move the element into the viewport but hidden (opacity 0, pointer-events none)
                element.style.position = "fixed";
                element.style.left = "0";
                element.style.top = "0";
                element.style.zIndex = "-50";
                element.style.opacity = "1"; // HTML2Canvas needs it to have opacity > 0 to render children correctly sometimes, but we keep it behind everything
                
                // Wait a tick for DOM to apply styles
                await new Promise(resolve => setTimeout(resolve, 100));

                const canvas = await html2canvas(container, { 
                    scale: 2, 
                    useCORS: true, 
                    backgroundColor: "#FAF8F4",
                    logging: false
                });
                
                // Put it back off-screen immediately
                element.style.position = "absolute";
                element.style.left = "-9999px";
                element.style.top = "-9999px";
                element.style.zIndex = "auto";

                const url = canvas.toDataURL("image/png");
                const link = document.createElement("a");
                link.download = `orlog-result-${data?.hybrid_name?.toLowerCase().replace(/\s+/g, '-')}.png`;
                link.href = url;
                link.click();
            }
        } catch (err) {
            console.error("Error generating static card:", err);
        } finally {
            setIsGeneratingCard(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#FAF8F4]">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#E2DFD8] border-t-[#C45C3A]"></div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAF8F4] px-6 font-sans text-center">
                <h2 className="text-2xl font-serif font-semibold text-[#2C2A28] mb-4">We couldn't find your results.</h2>
                <p className="text-[#8A8480] mb-8 max-w-sm">Try taking the test again to discover your PM nature.</p>
                <button
                    onClick={() => router.push("/test")}
                    className="group inline-flex h-12 items-center justify-center rounded-full bg-[#2C2A28] px-8 font-medium text-white transition-all hover:bg-black"
                >
                    Retake Test <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </button>
            </div>
        );
    }

    const primaryDesc = primaryData?.description || "";
    const secondaryDesc = secondaryData?.description || "";

    return (
        <div data-theme="light" className="min-h-screen bg-[#FAF8F4] font-sans selection:bg-[#C45C3A] selection:text-white pb-32 overflow-hidden relative">

            {/* Custom Toast Notification inside page to prevent fixed layout issues, using fixed overlay */}
            <AnimatePresence>
                {copiedText && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-[#2C2A28] text-white px-6 py-3 rounded-full shadow-xl flex flex-col sm:flex-row items-center sm:gap-3 font-medium text-sm w-[90%] sm:w-auto text-center sm:text-left gap-1"
                    >
                        <div className="bg-[#4A7C6F] rounded-full p-1 hidden sm:block shrink-0">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        {copiedText}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Top Border Accent */}
            <div className="w-full h-[3px] bg-[#C45C3A] absolute top-0 left-0 z-50"></div>

            {/* Content Wrapper */}
            <TracingBeam className="px-6 md:px-0 mt-16 sm:mt-24">
                <div className="w-full max-w-[900px] mx-auto px-1 sm:px-6">

                    {/* --- SECTION 1: HERO --- */}
                    <section className="text-center mb-24 relative pt-4">
                        <div className="absolute inset-0 bg-gradient-to-b from-[#C45C3A]/5 to-transparent -z-10 rounded-[100px] blur-3xl opacity-50 block md:hidden"></div>

                        <motion.p 
                            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
                            className="text-xs sm:text-sm font-bold tracking-[0.2em] text-[#C45C3A] uppercase mb-6"
                        >
                            Your Orlog Result
                        </motion.p>
                        
                        <motion.h2 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.1 }}
                            className="text-2xl sm:text-3xl font-serif text-[#2C2A28] mb-2"
                        >
                            {data.name}, you are…
                        </motion.h2>

                        <div className="relative inline-block mb-1">
                            <motion.h1 
                                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                                className="text-[48px] sm:text-[64px] font-serif font-bold text-[#2C2A28] leading-tight relative z-10"
                            >
                                {primaryName}
                            </motion.h1>
                            <motion.span 
                                initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 1, delay: 0.5, ease: "circOut" }}
                                className="absolute bottom-2 sm:bottom-4 left-0 h-3 sm:h-4 bg-[#C45C3A]/20 -z-0"
                            ></motion.span>
                        </div>

                        {primarySubtitle && (
                            <motion.p 
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.4 }}
                                className="text-xl sm:text-2xl font-serif italic text-[#8A8480] mb-6"
                            >
                                {primarySubtitle}
                            </motion.p>
                        )}

                        <motion.p 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.7 }}
                            className="text-lg sm:text-xl font-medium text-[#2C2A28] mb-10 font-serif italic"
                        >
                            with traits of {secondaryName}{secondarySubtitle ? ` — ${secondarySubtitle}` : ""}
                        </motion.p>

                        <div className="flex flex-col items-center gap-4">
                            <motion.div 
                                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.9 }}
                                className="inline-flex items-center justify-center px-6 py-2 rounded-full bg-[#4A7C6F] text-white font-semibold text-sm sm:text-base tracking-wide shadow-sm"
                            >
                                {data.hybrid_name}
                            </motion.div>
                            <motion.p 
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 1.1 }}
                                className="text-[#2C2A28] font-medium max-w-md mx-auto text-sm sm:text-base"
                            >
                                {primaryDesc.split('.')[0]}.
                            </motion.p>
                        </div>
                    </section>

                    {/* --- SECTION 2: RADAR CHART --- */}
                    <motion.section 
                        initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8 }}
                        className="mb-24 flex flex-col items-center relative"
                    >
                        {/* CSS Glow behind the radar container for the primary spike emphasis */}
                        <div className="absolute inset-0 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#C45C3A]/10 rounded-full blur-3xl animate-pulse -z-10"></div>
                        <h2 className="text-3xl font-serif font-bold text-[#2C2A28] mb-8 text-center">Your PM Signature</h2>
                        <PMRadarChart scores={data.dimension_scores} />
                    </motion.section>

                    {/* --- SECTION 3: TYPE DESCRIPTION CARDS --- */}
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
                        {/* Primary Card */}
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6 }}
                            whileHover={{ y: -4, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)" }}
                            className="bg-white p-8 sm:p-10 rounded-2xl border border-[#E2DFD8] shadow-sm border-l-4 border-l-[#C45C3A] flex flex-col transition-shadow"
                        >
                            <span className="text-xs font-bold tracking-widest text-[#C45C3A] uppercase mb-4">Primary Type</span>
                            <h3 className="text-3xl font-serif font-bold text-[#2C2A28] mb-1">{primaryName}</h3>
                            <p className="text-lg font-serif italic text-[#8A8480] mb-6">{primarySubtitle}</p>
                            <p className="text-[#2C2A28] leading-relaxed mb-8 flex-grow">
                                {primaryDesc}
                            </p>
                            <div>
                                <span className="text-sm font-bold uppercase tracking-wider text-[#8A8480] mb-3 block">Strengths</span>
                                <ul className="space-y-2">
                                    {(primaryData?.strengths || []).map((strength, i) => (
                                        <li key={i} className="flex items-start gap-2 text-[#2C2A28] text-sm sm:text-base">
                                            <span className="text-[#C45C3A] mt-0.5">•</span> {strength}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>

                        {/* Secondary Card */}
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6, delay: 0.2 }}
                            whileHover={{ y: -4, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)" }}
                            className="bg-white p-8 sm:p-10 rounded-2xl border border-[#E2DFD8] shadow-sm border-l-4 border-l-[#4A7C6F] flex flex-col transition-shadow"
                        >
                            <span className="text-xs font-bold tracking-widest text-[#4A7C6F] uppercase mb-4">Secondary Type</span>
                            <h3 className="text-3xl font-serif font-bold text-[#2C2A28] mb-1">{secondaryName}</h3>
                            <p className="text-lg font-serif italic text-[#8A8480] mb-6">{secondarySubtitle}</p>
                            <p className="text-[#2C2A28] leading-relaxed mb-8 flex-grow">
                                {secondaryDesc}
                            </p>
                            <div>
                                <span className="text-sm font-bold uppercase tracking-wider text-[#8A8480] mb-3 block">Strengths</span>
                                <ul className="space-y-2">
                                    {(secondaryData?.strengths || []).map((strength, i) => (
                                        <li key={i} className="flex items-start gap-2 text-[#2C2A28] text-sm sm:text-base">
                                            <span className="text-[#4A7C6F] mt-0.5">•</span> {strength}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>
                    </section>

                    {/* --- SECTION 4: THE PM SPECTRUM --- */}
                    <section className="mb-24">
                        <motion.h2 
                            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
                            className="text-3xl font-serif font-bold text-[#2C2A28] mb-8 text-center"
                        >
                            The PM Spectrum
                        </motion.h2>
                        <div className="flex overflow-x-auto pb-4 gap-4 snap-x snap-mandatory hide-scrollbars md:grid md:grid-cols-3 md:gap-6 md:overflow-visible">
                            {Object.values(PM_TYPES).map((type, i) => {
                                const key = type.key;
                                const isPrimary = key === data.primary_type;
                                const isSecondary = key === data.secondary_type;

                                let borderClass = "border-[#E2DFD8] opacity-60";
                                let badge = null;
                                let circleBg = "bg-[#D6D3CD] text-white";

                                if (isPrimary) {
                                    borderClass = "border-[#C45C3A] border-2 opacity-100 shadow-md relative overflow-hidden";
                                    circleBg = "bg-[#C45C3A] text-white relative z-10";
                                    badge = (
                                        <div className="absolute -top-3 right-4 z-20">
                                            <div className="relative">
                                                <span className="bg-[#C45C3A] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full relative z-10">That's you</span>
                                            </div>
                                        </div>
                                    );
                                } else if (isSecondary) {
                                    borderClass = "border-[#4A7C6F] border-2 opacity-100 shadow-sm";
                                    circleBg = "bg-[#4A7C6F] text-white";
                                    badge = <span className="absolute -top-3 right-4 bg-[#4A7C6F] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full z-10">Your Secondary</span>;
                                }

                                return (
                                    <motion.div 
                                        key={key} 
                                        initial={{ opacity: 0, y: 20 }} 
                                        whileInView={{ opacity: 1, y: 0 }} 
                                        viewport={{ once: true, margin: "-20px" }} 
                                        transition={{ duration: 0.4, delay: i * 0.1 }}
                                        className={`bg-white p-6 rounded-2xl relative flex-shrink-0 w-[260px] md:w-auto snap-center flex flex-col items-center text-center transition-all ${borderClass}`}
                                    >
                                        {/* Inject Sparkles globally inside the primary card */}
                                        {isPrimary && (
                                            <div className="absolute inset-0 z-0">
                                                <SparklesCore
                                                    id={`sparkles-${key}`}
                                                    background="transparent"
                                                    minSize={0.6}
                                                    maxSize={1.4}
                                                    particleDensity={60}
                                                    className="w-full h-full"
                                                    particleColor="#C45C3A"
                                                />
                                            </div>
                                        )}

                                        {badge}
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-serif font-bold text-xl mb-4 ${circleBg}`}>
                                            {type.name.replace("The ", "").charAt(0)}
                                        </div>
                                        <h4 className="font-serif font-bold text-[#2C2A28] text-xl mb-0 relative z-10">{type.name}</h4>
                                        <p className="text-sm font-serif italic text-[#8A8480] mb-3 relative z-10">{type.subtitle}</p>
                                        <p className="text-sm text-[#2C2A28]/80 leading-relaxed font-medium relative z-10">
                                            {type.tagline}
                                        </p>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </section>

                    {/* --- SECTION 5: FAMOUS ARCHETYPES --- */}
                    <section className="mb-32">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
                            className="flex justify-center mb-6 opacity-80"
                        >
                            <svg width="150" height="120" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="200" cy="150" r="100" fill="#FAF8F4" />
                                <path d="M150 200 L200 120 L250 200 Z" fill="#4A7C6F" fillOpacity="0.8" />
                                <circle cx="200" cy="110" r="20" fill="#C45C3A" fillOpacity="0.9" />
                                <circle cx="150" cy="220" r="15" fill="#2C2A28" fillOpacity="0.7" />
                                <circle cx="250" cy="220" r="15" fill="#2C2A28" fillOpacity="0.7" />
                                <path d="M130 250 Q200 280 270 250" stroke="#E2DFD8" strokeWidth="4" strokeLinecap="round" />
                            </svg>
                        </motion.div>
                        <motion.h2 
                            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-3xl font-serif font-bold text-[#2C2A28] mb-8 text-center"
                        >
                            You're in Good Company
                        </motion.h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {(primaryData?.famousPMs || []).map((person, i) => (
                                <motion.div 
                                    key={i} 
                                    initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }} 
                                    whileInView={{ opacity: 1, x: 0 }} 
                                    viewport={{ once: true, margin: "-50px" }} 
                                    transition={{ duration: 0.5, delay: i * 0.15 }}
                                    className="bg-white p-6 rounded-2xl border border-[#E2DFD8] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-[#F4F1E9] rounded-bl-full -z-0 opacity-50"></div>
                                    <h4 className="font-serif font-bold text-[#2C2A28] text-xl mb-1 relative z-10">{person.name}</h4>
                                    <p className="text-[#8A8480] text-sm font-medium mb-3 uppercase tracking-wider relative z-10">{person.company}</p>
                                    <p className="text-[#2C2A28] text-sm leading-relaxed relative z-10">
                                        "{person.note}"
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </section>

                    {/* --- SECTION 6: SHARE & RETAKE --- */}
                    <motion.section 
                        initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
                        className="flex flex-col items-center gap-6 border-t border-[#E2DFD8] pt-16 pb-12"
                    >
                        <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#2C2A28] mb-2">Share your result</h3>

                        {/* Top row buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-[800px]">
                            {/* LinkedIn */}
                            <motion.button
                                onClick={handleLinkedInShare}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                title="Link opens LinkedIn. Caption copied to clipboard — paste it as your post text."
                                className="flex h-12 w-full sm:w-auto min-w-[200px] items-center justify-center gap-2 rounded-xl bg-[#C45C3A] px-6 font-medium text-white transition-shadow shadow-md hover:shadow-lg focus:outline-none"
                            >
                                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                                </svg>
                                Share on LinkedIn
                            </motion.button>

                            {/* Twitter */}
                            <motion.button
                                onClick={handleTwitterShare}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                className="flex h-12 w-full sm:w-auto min-w-[200px] items-center justify-center gap-2 rounded-xl bg-transparent border-2 border-[#2C2A28] px-6 font-medium text-[#2C2A28] transition-colors focus:outline-none"
                            >
                                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                                </svg>
                                Share on Twitter
                            </motion.button>

                            {/* Copy Link */}
                            <motion.button
                                onClick={handleCopy}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                className="flex h-12 w-full sm:w-auto min-w-[200px] items-center justify-center gap-2 rounded-xl bg-transparent border-2 border-[#4A7C6F] px-6 font-medium text-[#4A7C6F] transition-colors focus:outline-none"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                                Copy Link
                            </motion.button>
                        </div>

                        {/* Bottom row button */}
                        <div className="w-full sm:w-auto mt-2 mb-10">
                            <motion.button
                                onClick={downloadCard}
                                disabled={isGeneratingCard}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                className="flex h-12 w-full sm:min-w-[300px] items-center justify-center gap-2 rounded-xl bg-transparent border-2 border-[#4A7C6F] px-6 font-bold text-[#4A7C6F] transition-colors focus:outline-none hover:bg-[#4A7C6F] hover:text-white disabled:opacity-50 disabled:pointer-events-none"
                            >
                                {isGeneratingCard ? "Generating…" : "Download Result Card ↓"}
                            </motion.button>
                        </div>

                        {/* Retake test small link */}
                        <button
                            onClick={() => router.push("/test")}
                            className="text-sm font-medium text-[#8A8480] hover:text-[#C45C3A] underline underline-offset-4 transition-colors mb-20"
                        >
                            Retake Test
                        </button>
                    </motion.section>

                    {/* --- HIDDEN HTML2CANVAS CAPTURE TEMPLATE --- */}
                    {/* Position absolute off-screen but rendered for snapshotting */}
                    <div id="share-card-wrapper" style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
                        <div id="share-card-container" style={{ display: "flex", flexDirection: "column", backgroundColor: "#FAF8F4", width: "1080px", height: "1080px", padding: "80px", fontFamily: "'Inter', sans-serif" }}>
                            
                            {/* Top row */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", marginBottom: "80px", position: "relative", zIndex: 10, flexShrink: 0 }}>
                                <div style={{ fontSize: "30px", fontFamily: "var(--font-serif)", fontWeight: 900, letterSpacing: "0.1em", color: "#2C2A28" }}>ORLOG.</div>
                                <div style={{ color: "#8A8480", fontWeight: 500, fontSize: "20px" }}>orlog.fourg.dev</div>
                            </div>
                            
                            {/* Center blocks flex */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", flexGrow: 1, position: "relative", zIndex: 10 }}>
                                
                                {/* Left text content */}
                                <div style={{ display: "flex", flexDirection: "column", maxWidth: "500px" }}>
                                    <span style={{ color: "#C45C3A", fontWeight: "bold", letterSpacing: "0.2em", textTransform: "uppercase", fontSize: "18px", marginBottom: "24px" }}>PM PERSONALITY TYPE</span>
                                    
                                    <h1 style={{ fontSize: "90px", fontFamily: "var(--font-serif)", fontWeight: "bold", color: "#C45C3A", lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: "8px" }}>
                                        {primaryName}
                                    </h1>
                                    
                                    <h2 style={{ fontSize: "36px", fontFamily: "var(--font-serif)", fontStyle: "italic", color: "#8A8480", marginBottom: "32px" }}>
                                        {primarySubtitle}
                                    </h2>
                                    
                                    <p style={{ color: "#8A8480", fontSize: "22px", fontWeight: 500, marginBottom: "48px" }}>
                                        with traits of {secondaryName} — {secondarySubtitle}
                                    </p>
                                    
                                    <div>
                                        <div style={{ display: "inline-flex", backgroundColor: "#4A7C6F", color: "#ffffff", padding: "12px 32px", borderRadius: "9999px", fontSize: "26px", fontWeight: "bold", letterSpacing: "0.025em" }}>
                                            {data.hybrid_name}
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Right radar chart */}
                                <div style={{ transform: "scale(1.8)", transformOrigin: "right center", width: "300px", height: "300px" }}>
                                    <PMRadarChart scores={data.dimension_scores || {}} />
                                </div>
                            </div>

                            {/* Bottom row */}
                            <div style={{ width: "100%", flexShrink: 0, marginTop: "80px", position: "relative", zIndex: 10, borderTop: "2px solid #E2DFD8", paddingTop: "48px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontSize: "28px", fontStyle: "italic", fontFamily: "var(--font-serif)", color: "#8A8480" }}>Know your PM nature.</span>
                                <span style={{ fontSize: "22px", fontWeight: 500, color: "#8A8480" }}>Take the test at <strong style={{ color: "#C45C3A" }}>orlog.fourg.dev</strong></span>
                            </div>
                            
                            {/* Background decoration - Explicit safely constructed solid color block with blur instead of radial-gradient for Canvas parsing */}
                            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "600px", height: "600px", backgroundColor: "rgba(196,92,58,0.04)", borderRadius: "50%", filter: "blur(100px)", zIndex: 0 }}></div>
                        </div>
                    </div>

                </div>
            </TracingBeam>
        </div>
    );
}
