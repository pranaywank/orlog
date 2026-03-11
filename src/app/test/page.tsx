"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import testData from "@/constants/questions.json";
import { CHAPTERS } from "@/constants/chapters";
import { Spotlight } from "@/components/ui/spotlight";
import { Meteors } from "@/components/ui/meteors";
import * as motion from "motion/react-client";

type Dimension = "Thinking Style" | "Decision Driver" | "Work Mode" | "Focus Area";

interface Option {
    id: string;
    text: string;
    scores: Record<string, number>;
}

interface Question {
    id: number;
    dimension: Dimension;
    format: "scenario" | "forced_choice" | "slider";
    text: string;
    category: string;
    options?: Option[];
    scale_low?: string;
    scale_high?: string;
    low_maps_to?: string;
    high_maps_to?: string;
}

const TOTAL_QUESTIONS = 30;

function selectQuestions(allQuestions: Question[]): Question[] {
    const groups: Record<Dimension, Question[]> = {
        "Thinking Style": [],
        "Decision Driver": [],
        "Work Mode": [],
        "Focus Area": [],
    };

    allQuestions.forEach((q) => {
        if (groups[q.dimension]) groups[q.dimension].push(q);
    });

    const dimensions: Dimension[] = ["Thinking Style", "Decision Driver", "Work Mode", "Focus Area"];
    dimensions.forEach((dim) => {
        groups[dim] = [...groups[dim]].sort(() => Math.random() - 0.5);
    });

    // 1-10: Thinking Style, 11-20: Decision Driver, 21-25: Work Mode, 26-30: Focus Area
    return [
        ...groups["Thinking Style"].slice(0, 10),
        ...groups["Decision Driver"].slice(0, 10),
        ...groups["Work Mode"].slice(0, 5),
        ...groups["Focus Area"].slice(0, 5),
    ];
}

const hybridMap: Record<string, string> = {
    "seer-forge": "The Architect",
    "seer-mirror": "The Pioneer",
    "seer-compass": "The Oracle",
    "seer-herald": "The Catalyst",
    "seer-anchor": "The Titan",
    "forge-mirror": "The Champion",
    "forge-compass": "The Precision PM",
    "forge-herald": "The Conductor",
    "forge-anchor": "The Operator",
    "mirror-compass": "The Empath Engineer",
    "mirror-herald": "The Connector",
    "mirror-anchor": "The Crusader",
    "compass-herald": "The Strategist",
    "compass-anchor": "The Calculated Bet",
    "herald-anchor": "The Sovereign Weaver",
};

function getHybrid(type1: string, type2: string): string | null {
    const key1 = `${type1}-${type2}`;
    const key2 = `${type2}-${type1}`;
    return hybridMap[key1] || hybridMap[key2] || null;
}

const STORAGE_KEY = "orlog_progress";
const INTRO_KEY = "orlog_intro_seen";

type ViewState = "INTRO" | "OPENER" | "QUESTION" | "FLASH" | "MILESTONE" | "LOADING";

export default function TestPage() {
    const router = useRouter();

    const [isMounted, setIsMounted] = useState(false);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, string | number>>({});
    
    const [view, setView] = useState<ViewState>("INTRO");
    const [showResume, setShowResume] = useState(false);
    const [feedbackText, setFeedbackText] = useState<string | null>(null);
    const [loadingText, setLoadingText] = useState("Decoding your PM nature…");

    // Cycle text on LOADING view
    useEffect(() => {
        if (view === "LOADING") {
            const texts = ["Decoding your PM nature…", "Mapping your instincts…", "Reading your patterns…", "Revealing your type…"];
            let i = 0;
            const interval = setInterval(() => {
                i = (i + 1) % texts.length;
                setLoadingText(texts[i]);
            }, 600);
            return () => clearInterval(interval);
        }
    }, [view]);

    // Load initial state
    useEffect(() => {
        const savedProgress = localStorage.getItem(STORAGE_KEY);
        const introSeen = sessionStorage.getItem(INTRO_KEY);
        
        const freshQuestions = selectQuestions(testData.questions as Question[]);
        
        if (savedProgress) {
            try {
                const parsed = JSON.parse(savedProgress);
                const age = Date.now() - parsed.timestamp;
                if (age < 24 * 60 * 60 * 1000 && parsed.currentIndex < 30) {
                    setQuestions(parsed.questions || freshQuestions);
                    setCurrentIndex(parsed.currentIndex);
                    setAnswers(parsed.answers);
                    setShowResume(true);
                    setView("QUESTION");
                    setIsMounted(true);
                    return;
                } else {
                    localStorage.removeItem(STORAGE_KEY);
                }
            } catch (e) {
                localStorage.removeItem(STORAGE_KEY);
            }
        }
        
        setQuestions(freshQuestions);
        if (introSeen === "true") {
            setView("OPENER");
        }
        setIsMounted(true);
    }, []);

    // Save progress mapping 
    useEffect(() => {
        if (!isMounted || currentIndex === 0 && Object.keys(answers).length === 0) return;
        if (currentIndex < 30) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                currentIndex,
                answers,
                questions,
                timestamp: Date.now()
            }));
        } else {
            localStorage.removeItem(STORAGE_KEY);
        }
    }, [currentIndex, answers, isMounted, questions]);

    const handleResumeClear = () => {
        localStorage.removeItem(STORAGE_KEY);
        setQuestions(selectQuestions(testData.questions as Question[]));
        setCurrentIndex(0);
        setAnswers({});
        setShowResume(false);
        setView(sessionStorage.getItem(INTRO_KEY) === "true" ? "OPENER" : "INTRO");
    };

    const finishTest = () => {
        const scores: Record<string, number> = { seer: 0, forge: 0, mirror: 0, compass: 0, herald: 0, anchor: 0 };

        Object.entries(answers).forEach(([qIdStr, answer]) => {
            const qId = parseInt(qIdStr);
            const q = questions.find((x) => x.id === qId);
            if (!q) return;

            if (q.format === "slider") {
                const val = answer as number;
                if (val >= 4 && q.high_maps_to) {
                    scores[q.high_maps_to] += 2;
                } else if (val <= 2 && q.low_maps_to) {
                    scores[q.low_maps_to] += 2;
                }
            } else {
                const selectedOption = q.options?.find((o) => o.id === answer);
                if (selectedOption?.scores) {
                    Object.entries(selectedOption.scores).forEach(([type, pts]) => {
                        scores[type] += pts;
                    });
                }
            }
        });

        const entries = Object.entries(scores).sort((a, b) => b[1] - a[1]);
        const primary = entries[0][0];
        const secondary = entries[1][0];
        const hybridName = getHybrid(primary, secondary);

        const params = new URLSearchParams({ primary, secondary, scores: JSON.stringify(scores) });
        if (hybridName) params.set("hybrid", hybridName);

        router.push(`/capture?${params.toString()}`);
    };

    const chapterIndex = Math.floor(currentIndex / 5);
    const currentChapter = CHAPTERS[chapterIndex];

    const advanceFlow = (newIndex: number) => {
        const nextChapterIndex = Math.floor(newIndex / 5);
        if (newIndex >= 30) {
            setView("LOADING");
            setTimeout(finishTest, 2500);
            return;
        }

        if (nextChapterIndex > chapterIndex) {
            // Chapter complete
            setView("FLASH");
            setTimeout(() => {
                if (nextChapterIndex === 2 || nextChapterIndex === 4) {
                    setView("MILESTONE");
                    setTimeout(() => {
                        setCurrentIndex(newIndex);
                        setView("OPENER");
                    }, 2500);
                } else {
                    setCurrentIndex(newIndex);
                    setView("OPENER");
                }
            }, 1000);
        } else {
            setCurrentIndex(newIndex);
            setView("QUESTION");
        }
    };

    const handleAnswer = (val: string | number) => {
        const q = questions[currentIndex];
        setAnswers((prev) => ({ ...prev, [q.id]: val }));

        // Random micro feedback
        const feedbacks = ["Noted.", "That's telling.", "Classic PM move.", "Interesting call.", "The team noticed that.", "Bold.", "That tracks.", "Good instinct."];
        setFeedbackText(feedbacks[Math.floor(Math.random() * feedbacks.length)]);

        setTimeout(() => {
            setFeedbackText(null);
            advanceFlow(currentIndex + 1);
        }, 600);
    };

    if (!isMounted) return null;

    if (view === "LOADING") {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-[#0A0A0A] font-sans selection:bg-[#C45C3A] selection:text-white px-6">
                <motion.div
                    key="loading-content"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center w-full max-w-sm"
                >
                    <div className="mb-10 opacity-80">
                        {/* Data Report SVG */}
                        <svg width="200" height="150" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="50" y="100" width="400" height="300" rx="12" fill="#1A1A1A" stroke="#2A2A2A" strokeWidth="4" />
                            <rect x="100" y="150" width="120" height="20" rx="4" fill="#2A2A2A" />
                            <rect x="100" y="200" width="80" height="150" rx="4" fill="#C45C3A" fillOpacity="0.8" />
                            <rect x="210" y="170" width="80" height="180" rx="4" fill="#4A7C6F" fillOpacity="0.8" />
                            <rect x="320" y="250" width="80" height="100" rx="4" fill="#2A2A2A" />
                        </svg>
                    </div>

                    <div className="h-12 flex items-center justify-center mb-8 w-full relative">
                        <motion.h2 
                            key={loadingText}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="text-2xl font-serif tracking-tight text-[#F5F0E8] absolute text-center w-full"
                        >
                            {loadingText}
                        </motion.h2>
                    </div>

                    <div className="w-full h-1 bg-[#2A2A2A] rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 2.5, ease: "linear" }}
                            className="h-full bg-[#C45C3A]"
                        />
                    </div>
                </motion.div>
            </div>
        );
    }

    if (view === "INTRO") {
        return (
            <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-6 relative overflow-hidden">
                <motion.div
                    key="intro-content"
                    initial="hidden"
                    animate="visible"
                    variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.3 } } }}
                    className="max-w-2xl text-center z-10"
                >
                    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="mb-10 flex justify-center opacity-80">
                        {/* Team Work SVG */}
                        <svg width="240" height="180" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="50" y="100" width="400" height="250" rx="12" fill="#1A1A1A" stroke="#2A2A2A" strokeWidth="4" />
                            <circle cx="250" cy="225" r="40" fill="#C45C3A" fillOpacity="0.2" />
                            <circle cx="250" cy="225" r="20" fill="#C45C3A" />
                            <rect x="150" y="380" width="200" height="10" rx="5" fill="#4A7C6F" />
                            <circle cx="150" cy="225" r="30" fill="#2A2A2A" />
                            <circle cx="350" cy="225" r="30" fill="#2A2A2A" />
                        </svg>
                    </motion.div>
                    
                    <motion.p variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="text-xs font-bold tracking-[0.2em] text-[#C45C3A] uppercase mb-4">
                        NOVACORP — YOUR FIRST WEEK
                    </motion.p>
                    <motion.h1 variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="text-4xl sm:text-5xl font-serif text-[#F5F0E8] font-bold leading-tight mb-6">
                        The roadmap is on the table.<br />The team is watching.
                    </motion.h1>
                    <motion.p variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="text-lg text-[#8A8480] leading-relaxed mb-6">
                        You've just joined a fast-growing product company as their new PM. The next few minutes will reveal exactly what kind of product manager you are.
                    </motion.p>
                    <motion.p variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="text-sm italic text-[#4A4540] mb-12">
                        Trust your instincts. There are no right answers.
                    </motion.p>
                    <motion.button
                        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
                        onClick={() => {
                            sessionStorage.setItem(INTRO_KEY, "true");
                            setView("OPENER");
                        }}
                        className="group inline-flex h-14 items-center justify-center rounded-full bg-[#C45C3A] px-10 font-bold text-white transition-all shadow-[0_0_15px_rgba(196,92,58,0.3)] hover:scale-105 active:scale-95 text-base"
                    >
                        I'm Ready <span className="ml-2">→</span>
                    </motion.button>
                </motion.div>
            </div>
        );
    }

    if (view === "OPENER" && currentChapter) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center relative overflow-hidden px-6">
                <Spotlight className="-top-40 left-0 md:left-60 md:-top-20 opacity-50" fill={currentChapter.color} />
                
                <motion.div
                    key={`opener-content-${currentChapter.id}`}
                    initial="hidden"
                    animate="visible"
                    variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.3 } } }}
                    className="max-w-2xl w-full flex flex-col items-center text-center z-10"
                >
                    <motion.p variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="text-xs font-bold tracking-[0.2em] text-[#8A8480] uppercase mb-8">
                        NOVACORP — CHAPTER {currentChapter.id} OF 6
                    </motion.p>
                    
                    <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} className="flex gap-2 mb-16">
                        {CHAPTERS.map((ch) => (
                            <div
                                key={ch.id}
                                className={`w-2 h-2 rounded-full ${ch.id < currentChapter.id ? "bg-[#C45C3A]" : ch.id === currentChapter.id ? "bg-[#C45C3A] animate-pulse scale-125" : "bg-[#2A2A2A]"}`}
                            />
                        ))}
                    </motion.div>

                    <div className="relative w-full flex justify-center items-center mb-8">
                        <motion.div
                            variants={{ hidden: { opacity: 0, scale: 1.2 }, visible: { opacity: 1, scale: 1 } }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="absolute text-[180px] sm:text-[240px] font-serif font-bold text-[#1A1A1A] leading-none select-none -z-10"
                        >
                            0{currentChapter.id}
                        </motion.div>
                        <motion.h2 variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }} className="text-4xl sm:text-5xl lg:text-6xl font-serif text-[#F5F0E8] font-bold py-6">
                            {currentChapter.title}
                        </motion.h2>
                    </div>

                    <motion.p variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} className="text-lg text-[#8A8480] leading-relaxed max-w-xl mx-auto mb-10">
                        {currentChapter.scene}
                    </motion.p>
                    
                    <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} className="w-16 h-[1px] bg-[#2A2A2A] mb-8" />
                    
                    <motion.p variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} className="text-sm italic text-[#4A4540] mb-12">
                        Your team is waiting for your direction.
                    </motion.p>

                    <motion.button
                        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
                        onClick={() => setView("QUESTION")}
                        className="group inline-flex h-14 items-center justify-center rounded-full bg-[#C45C3A] px-10 font-bold text-white transition-all hover:bg-[#A34B2E] shadow-[0_0_15px_rgba(196,92,58,0.3)] hover:scale-105 active:scale-95 tracking-wide text-base z-20"
                    >
                        Enter the Scene <span className="ml-2">→</span>
                    </motion.button>
                </motion.div>
            </div>
        );
    }

    if (view === "FLASH") {
        return (
            <motion.div
                key={`flash-view-${chapterIndex}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-center px-6"
            >
                <motion.h2
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    className="text-3xl sm:text-5xl font-serif font-bold text-[#C45C3A]"
                >
                    Chapter 0{chapterIndex + 1} Complete.
                </motion.h2>
            </motion.div>
        );
    }

    if (view === "MILESTONE") {
        const isHalfway = chapterIndex === 2; // Finished Ch2
        return (
            <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center relative overflow-hidden px-6 text-center">
                <Meteors number={15} />
                <motion.div key={`milestone-content-${chapterIndex}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="z-10 relative">
                    <h2 className="text-4xl sm:text-5xl font-serif font-bold text-[#C4973A] mb-4">
                        {isHalfway ? "Halfway there." : "Almost there."}
                    </h2>
                    <p className="text-lg text-[#F5F0E8] opacity-80 mb-12 max-w-sm mx-auto">
                        {isHalfway ? "Your instincts are speaking clearly. Two chapters down, four to go." : "4 chapters complete. Your PM signature is nearly fully mapped."}
                    </p>
                    
                    {/* Radar SVG forming */}
                    <div className="w-48 h-48 mx-auto relative mb-8">
                        <svg viewBox="0 0 100 100" className="w-full h-full">
                            <polygon points="50,10 85,30 85,70 50,90 15,70 15,30" stroke="#2A2A2A" strokeWidth="1" fill="none" />
                            <motion.polygon
                                initial={{ strokeDasharray: 300, strokeDashoffset: 300 }}
                                animate={{ strokeDashoffset: 0 }}
                                transition={{ duration: 2, ease: "easeInOut" }}
                                points={isHalfway ? "50,20 70,40 60,70 50,80 30,60 40,30" : "50,10 80,30 70,80 50,90 20,70 30,20"}
                                fill="#C45C3A"
                                fillOpacity={isHalfway ? "0.2" : "0.4"}
                                stroke="#C45C3A"
                                strokeWidth="2"
                            />
                        </svg>
                    </div>

                    <p className="text-sm italic text-[#C4973A] opacity-80">
                        {isHalfway ? "Your PM nature is forming…" : "One more chapter reveals everything."}
                    </p>
                </motion.div>
            </div>
        );
    }

    if (view === "QUESTION") {
        const currentQ = questions[currentIndex];
        const chapterQIndex = currentIndex % 5;

        return (
            <motion.div
                key={`question-view-${currentQ.id}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex min-h-screen flex-col bg-[#0A0A0A] font-sans text-[#F5F0E8] selection:bg-[#C45C3A] selection:text-white pb-24"
            >
                {showResume && (
                    <div className="w-full bg-[#1A1A1A] border-b border-[#2A2A2A] py-3 px-6 text-sm flex justify-center items-center gap-4 text-[#8A8480]">
                        <span>You left off in Chapter {chapterIndex + 1}, Decision {(currentIndex % 5) + 1} of 5.</span>
                        <div className="flex gap-4">
                            <button onClick={() => setShowResume(false)} className="text-[#C45C3A] font-bold hover:underline">Continue →</button>
                            <button onClick={handleResumeClear} className="hover:text-white transition-colors">Start Fresh</button>
                        </div>
                    </div>
                )}
                
                {/* Top Bar */}
                <div className="sticky top-0 z-10 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-[#2A2A2A]">
                    <div className="max-w-4xl mx-auto px-6 py-4 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            {/* Chapter Dots */}
                            <div className="flex gap-1.5">
                                {CHAPTERS.map((ch) => (
                                    <div key={ch.id} className={`w-1.5 h-1.5 rounded-full ${ch.id < currentChapter.id ? "bg-[#C45C3A]" : ch.id === currentChapter.id ? "bg-[#C45C3A] animate-pulse" : "bg-[#2A2A2A]"}`} />
                                ))}
                            </div>
                            {/* Chapter Name */}
                            <p className="text-xs font-medium tracking-widest text-[#8A8480] uppercase">
                                {currentChapter.title}
                            </p>
                            {/* Decision count */}
                            <p className="text-xs font-medium text-[#8A8480]">
                                Decision {chapterQIndex + 1} of 5
                            </p>
                        </div>
                        {/* 5 Tick Marks */}
                        <div className="flex gap-1">
                            {[0, 1, 2, 3, 4].map(tick => (
                                <div key={tick} className={`h-1 flex-1 rounded-full ${tick <= chapterQIndex ? "bg-[#C45C3A]" : "bg-[#2A2A2A]"}`} />
                            ))}
                        </div>
                    </div>
                </div>

                <main className="flex-1 w-full max-w-3xl mx-auto flex flex-col items-center justify-center px-6 mt-16 sm:mt-24">
                    {/* Question Text */}
                    <motion.div
                        key={`q-${currentQ.id}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="w-full text-center mb-12 sm:mb-16"
                    >
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold tracking-tight text-[#F5F0E8] leading-tight">
                            {currentQ.text}
                        </h2>
                    </motion.div>

                    {/* Options / Slider */}
                    <div className="w-full max-w-2xl flex flex-col gap-4 relative">
                        {(currentQ.format === "scenario" || currentQ.format === "forced_choice") && currentQ.options && (
                            currentQ.options.map((opt) => {
                                const isSelected = answers[currentQ.id] === opt.id;
                                return (
                                    <motion.button
                                        key={opt.id}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => !feedbackText && handleAnswer(opt.id)}
                                        disabled={!!feedbackText}
                                        className={`relative w-full text-left p-6 sm:p-8 rounded-2xl border transition-colors duration-300 ${isSelected
                                            ? "border-[#C45C3A] bg-[#C45C3A] text-white shadow-[0_0_20px_rgba(196,92,58,0.3)]"
                                            : "border-[#2A2A2A] bg-[#1A1A1A] text-[#F5F0E8] hover:border-[#4A4540]"
                                        }`}
                                    >
                                        <p className="text-lg sm:text-xl font-medium leading-relaxed relative z-10">
                                            {opt.text}
                                        </p>
                                        
                                        {/* Microfeedback popup on selected */}
                                        {isSelected && feedbackText && (
                                            <motion.span
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="absolute right-6 bottom-4 text-sm italic opacity-90 font-serif"
                                            >
                                                {feedbackText}
                                            </motion.span>
                                        )}
                                    </motion.button>
                                );
                            })
                        )}

                        {currentQ.format === "slider" && (
                            <motion.div
                                key={`slider-${currentQ.id}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex flex-col items-center justify-center gap-12 mt-8 w-full max-w-xl mx-auto p-8 rounded-2xl bg-[#1A1A1A] border border-[#2A2A2A]"
                            >
                                <div className="w-full relative">
                                    <input
                                        type="range"
                                        min="1"
                                        max="5"
                                        step="1"
                                        className="w-full h-2 bg-[#2A2A2A] rounded-lg appearance-none cursor-pointer accent-[#C45C3A] outline-none"
                                        value={(answers[currentQ.id] as number) || 3}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value);
                                            setAnswers((prev) => ({ ...prev, [currentQ.id]: val }));
                                        }}
                                        disabled={!!feedbackText}
                                    />
                                    <div className="flex justify-between mt-6 text-sm sm:text-base font-medium text-[#8A8480]">
                                        <span className={`w-1/3 text-left transition-colors ${answers[currentQ.id] as number <= 2 ? "text-[#C45C3A]" : ""}`}>{currentQ.scale_low}</span>
                                        <span className={`w-1/3 text-center transition-colors ${answers[currentQ.id] as number === 3 || !answers[currentQ.id] ? "text-[#C45C3A]" : ""}`}>Neutral</span>
                                        <span className={`w-1/3 text-right transition-colors ${answers[currentQ.id] as number >= 4 ? "text-[#C45C3A]" : ""}`}>{currentQ.scale_high}</span>
                                    </div>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => !feedbackText && handleAnswer((answers[currentQ.id] as number) || 3)}
                                    disabled={!!feedbackText}
                                    className="relative group inline-flex h-12 items-center justify-center rounded-full bg-[#C45C3A] px-10 font-bold text-white shadow-[0_0_15px_rgba(196,92,58,0.3)]"
                                >
                                    <span className="mr-2 text-base">Confirm</span>
                                    <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                                    {feedbackText && (
                                        <motion.span
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="absolute -right-32 text-sm italic opacity-90 font-serif text-[#C45C3A] whitespace-nowrap"
                                        >
                                            {feedbackText}
                                        </motion.span>
                                    )}
                                </motion.button>
                            </motion.div>
                        )}
                    </div>
                </main>
            </motion.div>
        );
    }

    return null;
}
