"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bot, Send, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { CoachCharacter } from "@/components/aura/coach-character";
import { SiteNav } from "@/components/site/site-nav";
import { Button } from "@/components/ui/button";
import { buildReadinessScore, mockDailyLog, mockUserProfile } from "@/lib/mock-data";
import type { DailyLogs } from "@/types";

interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    text: string;
}

const SUGGESTED_PROMPTS = [
    "What should I train today?",
    "Explain my readiness score",
    "What muscles should I avoid?",
    "How can I improve my sleep?",
    "Give me a recovery strategy",
    "What's my peak training window?",
];

type Mood = "happy" | "neutral" | "thinking" | "encouraging";

export default function CoachPage() {
    const [logs] = useState<DailyLogs[]>([mockDailyLog]);
    const profile = mockUserProfile;
    const readiness = useMemo(
        () => buildReadinessScore(profile, logs[0] ?? mockDailyLog),
        [logs, profile]
    );
    const latestLog = logs[0];

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [speaking, setSpeaking] = useState(false);
    const [ttsAvailable, setTtsAvailable] = useState(true);
    const [mood, setMood] = useState<Mood>("happy");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const stateColor: "emerald" | "amber" | "rose" =
        readiness.state === "green" ? "emerald" : readiness.state === "yellow" ? "amber" : "rose";

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        setTimeout(() => inputRef.current?.focus(), 500);
    }, []);

    // Initial greeting
    useEffect(() => {
        const greeting =
            readiness.state === "green"
                ? `Hey! Looking **strong** today — readiness at ${readiness.score}/100. You're cleared for high-intensity work. What do you want to focus on?`
                : readiness.state === "yellow"
                    ? `Your readiness is at ${readiness.score}/100 — decent but not peak. Let's be **strategic** about today's session. How can I help?`
                    : `Readiness is at ${readiness.score}/100 — your body's signaling for recovery. Let me help you plan a **smart recovery session**.`;

        setMessages([{ id: "greeting", role: "assistant", text: greeting }]);
        setMood(readiness.state === "green" ? "encouraging" : "neutral");
    }, [readiness.score, readiness.state]);

    const sendMessage = useCallback(
        async (text: string) => {
            if (!text.trim() || loading) return;
            setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: "user", text: text.trim() }]);
            setInput("");
            setLoading(true);
            setMood("thinking");

            try {
                const history = messages.map((m) => ({ role: m.role, text: m.text }));
                const res = await fetch("/api/ai/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ message: text.trim(), profile, readiness, latestLog, history }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Failed");

                setMessages((prev) => [...prev, { id: `a-${Date.now()}`, role: "assistant", text: data.reply }]);
                setMood("encouraging");
                setTimeout(() => setMood("happy"), 5000);
            } catch {
                setMessages((prev) => [
                    ...prev,
                    { id: `e-${Date.now()}`, role: "assistant", text: "Connection issue — try again in a moment." },
                ]);
                setMood("neutral");
            } finally {
                setLoading(false);
            }
        },
        [loading, messages, profile, readiness, latestLog]
    );

    const speakText = useCallback(
        async (text: string) => {
            if (speaking) {
                audioRef.current?.pause();
                setSpeaking(false);
                setMood("happy");
                return;
            }
            try {
                setSpeaking(true);
                setMood("encouraging");
                const res = await fetch("/api/ai/tts", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ text: text.replace(/\*\*/g, "") }),
                });
                if (!res.ok) {
                    if (res.status === 503) setTtsAvailable(false);
                    throw new Error("TTS failed");
                }
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const audio = new Audio(url);
                audioRef.current = audio;
                audio.onended = () => {
                    setSpeaking(false);
                    setMood("happy");
                    URL.revokeObjectURL(url);
                };
                audio.play();
            } catch {
                setSpeaking(false);
                setMood("neutral");
            }
        },
        [speaking]
    );

    const renderText = (text: string) => text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
            <div className="mx-auto max-w-7xl px-4 pt-6">
                <SiteNav current="coach" />
            </div>

            <div className="mx-auto flex max-w-7xl gap-0 px-4 py-6 lg:gap-6">
                {/* ===== LEFT — VIRTUAL COACH CHARACTER ===== */}
                <div className="hidden w-[340px] flex-shrink-0 lg:block">
                    <div className="sticky top-6">
                        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
                            {/* Character display area */}
                            <div
                                className={`relative flex h-[430px] items-end justify-center overflow-hidden ${stateColor === "emerald"
                                        ? "bg-gradient-to-b from-emerald-50 via-emerald-100/50 to-white"
                                        : stateColor === "amber"
                                            ? "bg-gradient-to-b from-amber-50 via-amber-100/50 to-white"
                                            : "bg-gradient-to-b from-rose-50 via-rose-100/50 to-white"
                                    }`}
                            >
                                {/* Floor shadow */}
                                <div className="absolute bottom-4 h-4 w-48 rounded-full bg-black/5 blur-md" />

                                {/* The animated character */}
                                <div className="relative -mb-2">
                                    <CoachCharacter speaking={speaking} mood={mood} stateColor={stateColor} />
                                </div>

                                {/* Speaking indicator */}
                                <AnimatePresence>
                                    {speaking && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className={`absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-medium text-white ${stateColor === "emerald"
                                                    ? "bg-emerald-600"
                                                    : stateColor === "amber"
                                                        ? "bg-amber-600"
                                                        : "bg-rose-600"
                                                }`}
                                        >
                                            <span className="flex items-center gap-1.5">
                                                <motion.span
                                                    className="inline-block h-1.5 w-1.5 rounded-full bg-white"
                                                    animate={{ opacity: [1, 0.3, 1] }}
                                                    transition={{ duration: 0.8, repeat: Infinity }}
                                                />
                                                Speaking...
                                            </span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Thinking indicator */}
                                <AnimatePresence>
                                    {loading && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-slate-700 px-3 py-1 text-xs font-medium text-white"
                                        >
                                            Thinking...
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Character info card */}
                            <div className="border-t border-slate-100 px-5 py-4">
                                <div className="flex items-center gap-3">
                                    <div>
                                        <h2 className="text-base font-bold text-slate-900">Coach Aura</h2>
                                        <p className="text-xs text-slate-500">AI Fitness Coach • Personalized to you</p>
                                    </div>
                                    <span
                                        className={`ml-auto rounded-full px-2.5 py-1 text-xs font-bold ${readiness.state === "green"
                                                ? "bg-emerald-100 text-emerald-700"
                                                : readiness.state === "yellow"
                                                    ? "bg-amber-100 text-amber-700"
                                                    : "bg-rose-100 text-rose-700"
                                            }`}
                                    >
                                        {readiness.score}/100
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ===== RIGHT — CHAT INTERFACE ===== */}
                <div className="flex min-h-[calc(100vh-160px)] flex-1 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
                    {/* Mobile character header */}
                    <div
                        className={`flex items-center gap-3 border-b border-slate-100 px-5 py-3 lg:py-4`}
                    >
                        <div
                            className={`flex h-10 w-10 items-center justify-center rounded-full ${stateColor === "emerald"
                                    ? "bg-emerald-100"
                                    : stateColor === "amber"
                                        ? "bg-amber-100"
                                        : "bg-rose-100"
                                }`}
                        >
                            <Bot
                                className={`h-5 w-5 ${stateColor === "emerald"
                                        ? "text-emerald-600"
                                        : stateColor === "amber"
                                            ? "text-amber-600"
                                            : "text-rose-600"
                                    }`}
                            />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-900">Coach Aura</h3>
                            <p className="text-xs text-slate-500">
                                {speaking ? "Speaking..." : loading ? "Thinking..." : "Ready to help"}
                            </p>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
                        {messages.map((msg) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div className="flex max-w-[80%] gap-2.5">
                                    {msg.role === "assistant" && (
                                        <div
                                            className={`mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${stateColor === "emerald"
                                                    ? "bg-emerald-100"
                                                    : stateColor === "amber"
                                                        ? "bg-amber-100"
                                                        : "bg-rose-100"
                                                }`}
                                        >
                                            <Bot
                                                className={`h-4 w-4 ${stateColor === "emerald"
                                                        ? "text-emerald-600"
                                                        : stateColor === "amber"
                                                            ? "text-amber-600"
                                                            : "text-rose-600"
                                                    }`}
                                            />
                                        </div>
                                    )}

                                    <div>
                                        <div
                                            className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === "user"
                                                    ? "bg-slate-800 text-white"
                                                    : "border border-slate-100 bg-slate-50 text-slate-700"
                                                }`}
                                        >
                                            <p dangerouslySetInnerHTML={{ __html: renderText(msg.text) }} />
                                        </div>
                                        {msg.role === "assistant" && ttsAvailable && (
                                            <button
                                                onClick={() => speakText(msg.text)}
                                                className="ml-1 mt-1 flex items-center gap-1 text-xs text-slate-400 transition-colors hover:text-slate-600"
                                            >
                                                {speaking ? (
                                                    <><VolumeX className="h-3.5 w-3.5" /> Stop</>
                                                ) : (
                                                    <><Volume2 className="h-3.5 w-3.5" /> Listen</>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        {/* Typing dots */}
                        <AnimatePresence>
                            {loading && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex gap-2.5">
                                    <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${stateColor === "emerald" ? "bg-emerald-100" : stateColor === "amber" ? "bg-amber-100" : "bg-rose-100"
                                        }`}>
                                        <Bot className={`h-4 w-4 ${stateColor === "emerald" ? "text-emerald-600" : stateColor === "amber" ? "text-amber-600" : "text-rose-600"
                                            }`} />
                                    </div>
                                    <div className="flex items-center gap-1.5 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                                        <motion.div className="h-2 w-2 rounded-full bg-slate-400" animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity }} />
                                        <motion.div className="h-2 w-2 rounded-full bg-slate-400" animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }} />
                                        <motion.div className="h-2 w-2 rounded-full bg-slate-400" animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }} />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Suggested prompts */}
                    {messages.length <= 1 && !loading && (
                        <div className="border-t border-slate-100 px-5 py-3">
                            <p className="mb-2 text-xs font-medium text-slate-400">Try asking</p>
                            <div className="flex flex-wrap gap-2">
                                {SUGGESTED_PROMPTS.map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => sendMessage(p)}
                                        className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm"
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input */}
                    <div className="border-t border-slate-100 px-5 py-4">
                        <form
                            onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
                            className="flex items-center gap-3"
                        >
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Talk to Coach Aura..."
                                disabled={loading}
                                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-slate-300 focus:bg-white focus:shadow-sm disabled:opacity-50"
                            />
                            <Button
                                type="submit"
                                disabled={loading || !input.trim()}
                                className={`h-11 w-11 rounded-xl shadow-md transition-transform hover:scale-105 disabled:opacity-40 ${stateColor === "emerald"
                                        ? "bg-emerald-600 hover:bg-emerald-700"
                                        : stateColor === "amber"
                                            ? "bg-amber-600 hover:bg-amber-700"
                                            : "bg-rose-600 hover:bg-rose-700"
                                    }`}
                            >
                                <Send className="h-4 w-4 text-white" />
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
