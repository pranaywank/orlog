"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import testData from "@/constants/questions.json";

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

    // Shuffle each group
    const dimensions: Dimension[] = ["Thinking Style", "Decision Driver", "Work Mode", "Focus Area"];
    dimensions.forEach((dim) => {
        groups[dim] = [...groups[dim]].sort(() => Math.random() - 0.5);
    });

    const selected: Question[] = [];

    // Pick 7 from each (28 total)
    dimensions.forEach((dim) => {
        selected.push(...groups[dim].splice(0, 7));
    });

    // Pick 2 more from random dimensions
    const remainingDims = [...dimensions].sort(() => Math.random() - 0.5).slice(0, 2);
    remainingDims.forEach((dim) => {
        selected.push(groups[dim].shift()!);
    });

    // Final shuffle
    return selected.sort(() => Math.random() - 0.5);
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
    const name = hybridMap[key1] || hybridMap[key2];
    if (!name) {
        console.warn(`Unmatched hybrid combination: ${type1} + ${type2}`);
        return null;
    }
    return name;
}

export default function TestPage() {
    const router = useRouter();

    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, string | number>>({});
    const [loadingScreen, setLoadingScreen] = useState(false);
    const [loadingText, setLoadingText] = useState("Decoding your PM nature…");

    // Load questions on mount
    useEffect(() => {
        const selected = selectQuestions(testData.questions as Question[]);
        setQuestions(selected);
    }, []);

    // Cycling text for the loading screen
    useEffect(() => {
        if (loadingScreen) {
            const texts = ["Decoding your PM nature…", "Mapping your instincts…", "Revealing your type…"];
            let i = 0;
            const interval = setInterval(() => {
                i = (i + 1) % texts.length;
                setLoadingText(texts[i]);
            }, 700);

            const timeout = setTimeout(() => {
                finishTest();
            }, 2500);

            return () => {
                clearInterval(interval);
                clearTimeout(timeout);
            };
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loadingScreen]);

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

        console.log("Orlog scores:", {
            seer: scores.seer,
            forge: scores.forge,
            mirror: scores.mirror,
            compass: scores.compass,
            herald: scores.herald,
            anchor: scores.anchor
        });

        const entries = Object.entries(scores).sort((a, b) => b[1] - a[1]);
        const top1 = entries[0][0];
        const top2 = entries[1][0];

        // Hybrid lookup needs to be alphabetical to match keys
        const sortedKey = [top1, top2].sort().join("-");
        let primary = top1;
        let secondary = top2;

        let hybridName = getHybrid(primary, secondary);

        const params = new URLSearchParams({
            primary,
            secondary,
            scores: JSON.stringify(scores) // Pass raw dimension scores
        });

        if (hybridName) {
            params.set("hybrid", hybridName);
        }

        router.push(`/capture?${params.toString()}`);
    };

    const handleOptionClick = (optionId: string) => {
        const q = questions[currentIndex];
        setAnswers((prev) => ({ ...prev, [q.id]: optionId }));

        setTimeout(() => {
            if (currentIndex + 1 < TOTAL_QUESTIONS) {
                setCurrentIndex((prev) => prev + 1);
            } else {
                setLoadingScreen(true);
            }
        }, 400); // Wait 400ms before auto-advancing
    };

    const handleSliderNext = (val: number) => {
        const q = questions[currentIndex];
        setAnswers((prev) => ({ ...prev, [q.id]: val }));

        if (currentIndex + 1 < TOTAL_QUESTIONS) {
            setCurrentIndex((prev) => prev + 1);
        } else {
            setLoadingScreen(true);
        }
    };

    if (loadingScreen) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 font-sans selection:bg-black selection:text-white">
                <h2 className="text-3xl font-medium tracking-tight text-zinc-800 animate-pulse transition-all duration-300">
                    {loadingText}
                </h2>
            </div>
        );
    }

    if (questions.length === 0) return null; // Avoid hydration mismatch or empty state flash

    const currentQ = questions[currentIndex];
    const progressPercent = Math.round(((currentIndex + 1) / TOTAL_QUESTIONS) * 100);

    return (
        <div className="flex min-h-screen flex-col bg-zinc-50 font-sans selection:bg-black selection:text-white pb-24">
            {/* Progress Bar */}
            <div className="fixed top-0 left-0 w-full z-10 bg-zinc-50/80 backdrop-blur-md border-b border-zinc-200">
                <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
                    <p className="text-sm font-semibold tracking-wide text-zinc-500 uppercase">
                        Question {currentIndex + 1} <span className="text-zinc-300">of</span> {TOTAL_QUESTIONS}
                    </p>
                    <div className="w-48 h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-black transition-all duration-500 ease-out"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>
            </div>

            <main className="flex-1 w-full max-w-3xl mx-auto flex flex-col items-center justify-center px-6 mt-20">
                {/* Question Area */}
                <div className="w-full text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both" key={currentQ.id}>
                    <p className="text-sm font-medium tracking-widest text-zinc-400 uppercase mb-4">{currentQ.category}</p>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-black leading-tight">
                        {currentQ.text}
                    </h2>
                </div>

                {/* Options Area */}
                <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150 fill-mode-both">
                    {(currentQ.format === "scenario" || currentQ.format === "forced_choice") && currentQ.options && (
                        <div className="flex flex-col gap-4">
                            {currentQ.options.map((opt) => {
                                const isSelected = answers[currentQ.id] === opt.id;
                                return (
                                    <button
                                        key={opt.id}
                                        onClick={() => handleOptionClick(opt.id)}
                                        className={`w-full text-left p-6 sm:p-8 rounded-2xl border transition-all duration-300 ${isSelected
                                            ? "border-black bg-black text-white scale-[0.98]"
                                            : "border-zinc-200 bg-white hover:border-black hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                                            }`}
                                    >
                                        <p className={`text-lg sm:text-xl font-medium leading-relaxed ${isSelected ? "text-white" : "text-zinc-800"}`}>
                                            {opt.text}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {currentQ.format === "slider" && (
                        <div className="flex flex-col items-center justify-center gap-12 mt-8 w-full max-w-xl mx-auto">
                            <div className="w-full relative">
                                <input
                                    type="range"
                                    min="1"
                                    max="5"
                                    step="1"
                                    className="w-full h-3 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-black outline-none focus:ring-2 focus:ring-black focus:ring-offset-4"
                                    defaultValue="3"
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value);
                                        setAnswers((prev) => ({ ...prev, [currentQ.id]: val }));
                                    }}
                                />
                                <div className="flex justify-between mt-6 text-sm sm:text-base font-medium text-zinc-500">
                                    <span className="w-1/3 text-left">{currentQ.scale_low}</span>
                                    <span className="w-1/3 text-center">Neutral</span>
                                    <span className="w-1/3 text-right">{currentQ.scale_high}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => handleSliderNext((answers[currentQ.id] as number) || 3)}
                                className="group inline-flex h-14 items-center justify-center rounded-full bg-black px-10 font-medium text-white transition-all hover:scale-105 active:scale-95"
                            >
                                <span className="mr-2 text-lg">Next</span>
                                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
