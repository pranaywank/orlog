"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { PM_TYPES } from "@/constants/types";

interface SessionData {
    id: string;
    name: string;
    email: string;
    primary_type: string;
    secondary_type: string;
    hybrid_name: string;
    created_at: string;
}

export default function AdminPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState("");
    const [sessions, setSessions] = useState<SessionData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === "orlog_admin_2024") {
            setIsAuthenticated(true);
            fetchSessions();
        } else {
            setError("Incorrect password");
        }
    };

    const fetchSessions = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: supaError } = await supabase
                .from("sessions")
                .select("*")
                .order("created_at", { ascending: false });

            if (supaError) throw supaError;
            setSessions((data as SessionData[]) || []);
        } catch (err: any) {
            console.error(err);
            setError("Failed to load sessions");
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadCSV = () => {
        if (sessions.length === 0) return;

        const headers = ["Date", "Name", "Email", "Primary Type", "Secondary Type", "Hybrid Name"];
        const rows = sessions.map((s) => [
            new Date(s.created_at).toLocaleString(),
            s.name,
            s.email,
            s.primary_type,
            s.secondary_type,
            s.hybrid_name,
        ]);

        const csvContent =
            "data:text/csv;charset=utf-8," +
            [headers.join(","), ...rows.map((e) => e.map((val) => `"${val}"`).join(","))].join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `orlog_sessions_${new Date().toISOString().split("T")[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (!isAuthenticated) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans selection:bg-black selection:text-white px-6">
                <div className="w-full max-w-sm bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm text-center">
                    <h1 className="text-2xl font-bold tracking-tight text-black mb-6">Admin Access</h1>
                    <form onSubmit={handleLogin} className="flex flex-col gap-4">
                        <input
                            type="password"
                            placeholder="Enter admin password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-black focus:border-black focus:bg-white focus:outline-none focus:ring-1 focus:ring-black"
                        />
                        {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
                        <button
                            type="submit"
                            className="w-full rounded-xl bg-black px-4 py-3 font-medium text-white hover:bg-zinc-800 transition-colors"
                        >
                            Sign In
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 font-sans selection:bg-black selection:text-white pb-24">
            <div className="max-w-6xl mx-auto px-6 py-12">
                <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-black mb-2">Results Dashboard</h1>
                        <p className="text-zinc-500 font-medium">
                            Total Sessions: <span className="text-black">{sessions.length}</span>
                        </p>
                    </div>
                    <button
                        onClick={handleDownloadCSV}
                        disabled={sessions.length === 0}
                        className="inline-flex items-center justify-center rounded-xl bg-white border-2 border-zinc-200 px-6 py-3 font-medium text-black transition-all hover:border-black disabled:opacity-50 disabled:hover:border-zinc-200"
                    >
                        Download CSV
                    </button>
                </header>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-black"></div>
                    </div>
                ) : (
                    <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-zinc-50 border-b border-zinc-200">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold text-zinc-600">Date</th>
                                        <th className="px-6 py-4 font-semibold text-zinc-600">Name</th>
                                        <th className="px-6 py-4 font-semibold text-zinc-600">Email</th>
                                        <th className="px-6 py-4 font-semibold text-zinc-600">Primary</th>
                                        <th className="px-6 py-4 font-semibold text-zinc-600">Secondary</th>
                                        <th className="px-6 py-4 font-semibold text-zinc-600">Hybrid</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100">
                                    {sessions.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                                                No sessions recorded yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        sessions.map((session) => {
                                            const primaryData = PM_TYPES[session.primary_type as keyof typeof PM_TYPES];
                                            const secondaryData = PM_TYPES[session.secondary_type as keyof typeof PM_TYPES];
                                            return (
                                                <tr key={session.id} className="hover:bg-zinc-50/50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap text-zinc-500">
                                                        {new Date(session.created_at).toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4 font-medium text-black">{session.name}</td>
                                                    <td className="px-6 py-4 text-zinc-600 truncate max-w-[200px]" title={session.email}>{session.email}</td>
                                                    <td className="px-6 py-4 text-zinc-800">
                                                        {primaryData ? `${primaryData.name} — ${primaryData.subtitle}` : session.primary_type}
                                                    </td>
                                                    <td className="px-6 py-4 text-zinc-800">
                                                        {secondaryData ? `${secondaryData.name} — ${secondaryData.subtitle}` : session.secondary_type}
                                                    </td>
                                                    <td className="px-6 py-4 font-medium text-black">{session.hybrid_name}</td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
