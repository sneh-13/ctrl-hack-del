"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bot, Send, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { CoachCharacter } from "@/components/aura/coach-character";
import { SatimaCharacter } from "@/components/aura/satima-character";
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

const SATIMA_REPLY = "100 push-ups, 100 sit-ups, 100 squats, and a 10 km run. Every single day.";

type Mood = "happy" | "neutral" | "thinking" | "encouraging";
type CharacterMode = "aura" | "satima";

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
    const [characterMode, setCharacterMode] = useState<CharacterMode>("aura");
    const [impacting, setImpacting] = useState(false);
    const [impactFxId, setImpactFxId] = useState(0);
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
            const trimmed = text.trim();
            if (!trimmed || loading) return;

            const now = Date.now();
            setMessages((prev) => [...prev, { id: `u-${now}`, role: "user", text: trimmed }]);
            setInput("");

            if (characterMode === "satima") {
                setMessages((prev) => [...prev, { id: `a-${now + 1}`, role: "assistant", text: SATIMA_REPLY }]);
                setMood("neutral");
                return;
            }

            setLoading(true);
            setMood("thinking");

            try {
                const history = messages.map((m) => ({ role: m.role, text: m.text }));
                const res = await fetch("/api/ai/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ message: trimmed, profile, readiness, latestLog, history }),
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
        [loading, characterMode, messages, profile, readiness, latestLog]
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

    const triggerSatimaImpact = useCallback(() => {
        if (impacting) return;
        setImpactFxId((prev) => prev + 1);
        setImpacting(true);
        setMood("encouraging");
        window.setTimeout(() => setCharacterMode("satima"), 180);
        window.setTimeout(() => setImpacting(false), 1000);
    }, [impacting]);

    const switchToAura = useCallback(() => {
        if (impacting) return;
        setCharacterMode("aura");
        setMood("happy");
    }, [impacting]);

    const renderText = (text: string) => text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    const characterName = characterMode === "satima" ? "Satima" : "Coach Aura";

    return (
        <motion.div
            className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50"
            animate={
                impacting
                    ? {
                        x: [0, -14, 13, -11, 8, -6, 4, -2, 0],
                        y: [0, 5, -4, 3, -2, 2, -1, 1, 0],
                        rotate: [0, -1.3, 1.1, -0.8, 0.5, -0.35, 0.2, -0.1, 0],
                    }
                    : { x: 0, y: 0, rotate: 0 }
            }
            transition={
                impacting
                    ? {
                        duration: 1,
                        ease: "easeInOut",
                        times: [0, 0.12, 0.24, 0.36, 0.5, 0.66, 0.82, 0.92, 1],
                    }
                    : { duration: 0.2 }
            }
        >
            <AnimatePresence>
                {impacting && (
                    <motion.div
                        key={`impact-${impactFxId}`}
                        className="pointer-events-none fixed inset-0 z-[100] overflow-hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="absolute inset-0 bg-white/10"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0, 0.25, 0] }}
                            transition={{ duration: 0.55, ease: "easeOut" }}
                        />
                        {Array.from({ length: 12 }).map((_, index) => (
                            <motion.span
                                key={`shard-${index}`}
                                className="absolute left-1/2 top-1/2 block h-[2px] w-44 origin-left bg-white/85 shadow-[0_0_14px_rgba(255,255,255,0.7)]"
                                style={{ transform: `translate(-50%, -50%) rotate(${index * 30}deg)` }}
                                initial={{ scaleX: 0, opacity: 0 }}
                                animate={{ scaleX: [0, 1.15, 0.35], opacity: [0, 0.95, 0] }}
                                transition={{ duration: 0.85, ease: "easeOut", delay: index * 0.01 }}
                            />
                        ))}
                        <motion.div
                            className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/80"
                            initial={{ scale: 0.3, opacity: 0 }}
                            animate={{ scale: [0.3, 2.2, 2.6], opacity: [0, 1, 0] }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
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

                                {/* The character (Aura / Satima) */}
                                <AnimatePresence mode="wait" initial={false}>
                                    {characterMode === "aura" ? (
                                        <motion.div
                                            key="aura-character"
                                            className="relative -mb-2"
                                            initial={{ opacity: 0, y: 12, scale: 0.96 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 16, scale: 0.94 }}
                                            transition={{ duration: 0.35, ease: "easeOut" }}
                                        >
                                            <CoachCharacter speaking={speaking} mood={mood} stateColor={stateColor} />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key={`satima-character-${impactFxId}`}
                                            className="relative -mb-2"
                                            initial={{ opacity: 0, y: 110, scale: 0.72, rotate: -5 }}
                                            animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
                                            exit={{ opacity: 0, y: 16, scale: 0.95 }}
                                            transition={{ type: "spring", stiffness: 190, damping: 18 }}
                                        >
                                            <SatimaCharacter impacting={impacting} />
                                        </motion.div>
                                    )}
                                </AnimatePresence>

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
                                <div className="flex items-start gap-3">
                                    <div className="min-w-0">
                                        <h2 className="text-base font-bold text-slate-900">{characterName}</h2>
                                        <p className="text-xs text-slate-500">
                                            {characterMode === "satima"
                                                ? "Impact mode enabled • You summoned Satima"
                                                : "AI Fitness Coach • Personalized to you"}
                                        </p>
                                        <div className="mt-2 flex items-center gap-2">
                                            <button
                                                onClick={switchToAura}
                                                disabled={impacting}
                                                className={`rounded-full border px-3 py-1 text-xs font-semibold transition-all ${characterMode === "aura"
                                                    ? "border-slate-900 bg-slate-900 text-white"
                                                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                                                    } disabled:cursor-not-allowed disabled:opacity-60`}
                                            >
                                                Aura
                                            </button>
                                            <button
                                                onClick={triggerSatimaImpact}
                                                disabled={impacting}
                                                className={`rounded-full border px-3 py-1 text-xs font-semibold transition-all ${characterMode === "satima"
                                                    ? "border-rose-500 bg-rose-500 text-white"
                                                    : "border-rose-200 bg-rose-50 text-rose-700 hover:border-rose-300 hover:bg-rose-100"
                                                    } disabled:cursor-not-allowed disabled:opacity-60`}
                                            >
                                                Satima
                                            </button>
                                        </div>
                                    </div>
                                    <div className="ml-auto flex flex-col items-end gap-2">
                                        <span
                                            className={`rounded-full px-2.5 py-1 text-xs font-bold ${readiness.state === "green"
                                                    ? "bg-emerald-100 text-emerald-700"
                                                    : readiness.state === "yellow"
                                                        ? "bg-amber-100 text-amber-700"
                                                        : "bg-rose-100 text-rose-700"
                                                }`}
                                        >
                                            {readiness.score}/100
                                        </span>
                                        {characterMode === "satima" && (
                                            <motion.span
                                                initial={{ opacity: 0, y: 6 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-rose-700"
                                            >
                                                Impact Mode
                                            </motion.span>
                                        )}
                                    </div>
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
                            <h3 className="text-sm font-bold text-slate-900">{characterName}</h3>
                            <p className="text-xs text-slate-500">
                                {characterMode === "satima"
                                    ? "Impact mode online"
                                    : speaking
                                        ? "Speaking..."
                                        : loading
                                            ? "Thinking..."
                                            : "Ready to help"}
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
        </motion.div>
    );
}
