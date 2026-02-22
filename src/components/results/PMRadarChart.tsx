"use client";

import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
} from "recharts";

interface RadarChartProps {
    scores: any;
}

export default function PMRadarChart({ scores }: RadarChartProps) {
    // Translate the scores object into Recharts format
    // Fallback to placeholder if scores don't exist
    const data = [
        { subject: "Seer", A: scores?.seer ?? 12, fullMark: 20 },
        { subject: "Forge", A: scores?.forge ?? 8, fullMark: 20 },
        { subject: "Warden", A: scores?.warden ?? 15, fullMark: 20 },
        { subject: "Sage", A: scores?.sage ?? 10, fullMark: 20 },
        { subject: "Weaver", A: scores?.weaver ?? 14, fullMark: 20 },
        { subject: "Sovereign", A: scores?.sovereign ?? 9, fullMark: 20 },
    ];

    return (
        <div className="w-full flex-col items-center justify-center">
            <div className="h-[300px] sm:h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                        <PolarGrid stroke="#E8E4DC" />
                        <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fill: "#6B6560", fontSize: 14, fontWeight: 500 }}
                        />
                        <PolarRadiusAxis
                            angle={30}
                            domain={[0, 20]}
                            tick={false}
                            axisLine={false}
                        />
                        <Radar
                            name="PM Signature"
                            dataKey="A"
                            stroke="#C45C3A"
                            fill="#C45C3A"
                            fillOpacity={0.3}
                            dot={{ r: 4, fill: "#4A7C6F", strokeWidth: 0 }}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
            <p className="text-center text-sm font-medium text-earth-muted max-w-md mx-auto mt-4 leading-relaxed px-4">
                Your shape shows where your PM instincts naturally cluster. A taller spike means a stronger tendency — not better or worse, just more you.
            </p>
        </div>
    );
}
