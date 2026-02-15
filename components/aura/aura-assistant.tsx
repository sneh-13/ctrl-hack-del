"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bot, Mic, Send, Sparkles, Volume2, VolumeX, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import type { DailyLogs, ReadinessScore, UserFitnessProfile } from "@/types";

interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    text: string;
    timestamp: Date;
}

interface AuraAssistantProps {
    profile: UserFitnessProfile;
    readiness: ReadinessScore;
    latestLog?: DailyLogs;
}

const SUGGESTED_PROMPTS = [
    "What should I train today?",
    "Explain my readiness score",
    "What muscles should I avoid?",
    "Give me a recovery tip",
];

const stateGlow: Record<string, string> = {
    green: "from-emerald-400 to-emerald-600",
    yellow: "from-amber-400 to-amber-600",
    red: "from-rose-400 to-rose-600",
};

const stateRing: Record<string, string> = {
    green: "ring-emerald-400/30",
    yellow: "ring-amber-400/30",
    red: "ring-rose-400/30",
};

export function AuraAssistant({ profile, readiness, latestLog }: AuraAssistantProps) {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [speaking, setSpeaking] = useState(false);
    const [ttsAvailable, setTtsAvailable] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Focus input when panel opens
    useEffect(() => {
        if (open) setTimeout(() => inputRef.current?.focus(), 300);
    }, [open]);

    // Initial greeting on first open
    useEffect(() => {
        if (open && messages.length === 0) {
            const greeting = readiness.state === "green"
                ? `You're looking **strong** today with a readiness score of ${readiness.score}/100. Ready to crush it — what do you want to work on?`
                : readiness.state === "yellow"
                    ? `Your readiness is at ${readiness.score}/100 — not bad, but let's be **strategic** today. What can I help you plan?`
                    : `Readiness is at ${readiness.score}/100 — your body's asking for a lighter day. Let me help you make the most of a **recovery session**.`;

            setMessages([{
                id: "greeting",
                role: "assistant",
                text: greeting,
                timestamp: new Date(),
            }]);
        }
    }, [open, messages.length, readiness.score, readiness.state]);

    const sendMessage = useCallback(async (text: string) => {
        if (!text.trim() || loading) return;

        const userMsg: ChatMessage = {
            id: `u-${Date.now()}`,
            role: "user",
            text: text.trim(),
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const history = messages.map((m) => ({ role: m.role, text: m.text }));

            const res = await fetch("/api/ai/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: text.trim(),
                    profile,
                    readiness,
                    latestLog,
                    history,
                }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed");

            const assistantMsg: ChatMessage = {
                id: `a-${Date.now()}`,
                role: "assistant",
                text: data.reply,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, assistantMsg]);
        } catch {
            setMessages((prev) => [
                ...prev,
                {
                    id: `e-${Date.now()}`,
                    role: "assistant",
                    text: "Sorry, I'm having trouble connecting. Try again in a moment.",
                    timestamp: new Date(),
                },
            ]);
        } finally {
            setLoading(false);
        }
    }, [loading, messages, profile, readiness, latestLog]);

    const speakText = useCallback(async (text: string) => {
        if (speaking) {
            audioRef.current?.pause();
            setSpeaking(false);
            return;
        }

        try {
            setSpeaking(true);
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
                URL.revokeObjectURL(url);
            };

            audio.play();
        } catch {
            setSpeaking(false);
        }
    }, [speaking]);

    const renderMessageText = (text: string) => {
        return text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    };

    const glow = stateGlow[readiness.state] || stateGlow.green;
    const ring = stateRing[readiness.state] || stateRing.green;

    return (
        <>
            {/* Floating Action Button */}
            <AnimatePresence>
                {!open && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setOpen(true)}
                        className={`fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br ${glow} shadow-xl ring-4 ${ring} transition-shadow hover:shadow-2xl`}
                    >
                        {/* Animated pulse rings */}
                        <motion.div
                            className={`absolute inset-0 rounded-full bg-gradient-to-br ${glow} opacity-30`}
                            animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        />
                        <motion.div
                            className={`absolute inset-0 rounded-full bg-gradient-to-br ${glow} opacity-20`}
                            animate={{ scale: [1, 1.7, 1], opacity: [0.2, 0, 0.2] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                        />
                        <Sparkles className="relative z-10 h-7 w-7 text-white" />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Panel */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed bottom-6 right-6 z-50 flex h-[600px] w-[400px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
                    >
                        {/* Header with animated character */}
                        <div className={`relative flex items-center gap-3 bg-gradient-to-r ${glow} px-5 py-4`}>
                            {/* Animated Aura character orb */}
                            <div className="relative">
                                <motion.div
                                    className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm"
                                    animate={speaking ? {
                                        scale: [1, 1.15, 1, 1.1, 1],
                                        borderRadius: ["50%", "45%", "50%", "47%", "50%"],
                                    } : {
                                        scale: [1, 1.05, 1],
                                    }}
                                    transition={{
                                        duration: speaking ? 0.5 : 3,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    }}
                                >
                                    <Bot className="h-6 w-6 text-white" />
                                </motion.div>
                                {/* Speaking indicator */}
                                {speaking && (
                                    <motion.div
                                        className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-white"
                                        animate={{ scale: [0.8, 1.2, 0.8] }}
                                        transition={{ duration: 0.6, repeat: Infinity }}
                                    >
                                        <Mic className="h-4 w-4 text-emerald-600" />
                                    </motion.div>
                                )}
                            </div>

                            <div className="flex-1">
                                <h3 className="text-sm font-bold text-white">Aura</h3>
                                <p className="text-xs text-white/80">
                                    {speaking ? "Speaking..." : loading ? "Thinking..." : "Your AI Coach"}
                                </p>
                            </div>

                            <button
                                onClick={() => setOpen(false)}
                                className="rounded-full p-1.5 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`group relative max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${msg.role === "user"
                                                ? "bg-slate-800 text-white"
                                                : "border border-slate-100 bg-slate-50 text-slate-700"
                                            }`}
                                    >
                                        <p
                                            dangerouslySetInnerHTML={{ __html: renderMessageText(msg.text) }}
                                        />
                                        {/* TTS button on assistant messages */}
                                        {msg.role === "assistant" && ttsAvailable && (
                                            <button
                                                onClick={() => speakText(msg.text)}
                                                className="mt-1.5 flex items-center gap-1 text-xs text-slate-400 transition-colors hover:text-slate-600"
                                            >
                                                {speaking ? (
                                                    <><VolumeX className="h-3.5 w-3.5" /> Stop</>
                                                ) : (
                                                    <><Volume2 className="h-3.5 w-3.5" /> Listen</>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            ))}

                            {/* Loading indicator */}
                            {loading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex justify-start"
                                >
                                    <div className="flex gap-1.5 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                                        <motion.div className="h-2 w-2 rounded-full bg-slate-400" animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
                                        <motion.div className="h-2 w-2 rounded-full bg-slate-400" animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }} />
                                        <motion.div className="h-2 w-2 rounded-full bg-slate-400" animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }} />
                                    </div>
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Suggested prompts (show when few messages) */}
                        {messages.length <= 1 && !loading && (
                            <div className="border-t border-slate-100 px-4 py-3">
                                <p className="mb-2 text-xs font-medium text-slate-400">Quick questions</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {SUGGESTED_PROMPTS.map((prompt) => (
                                        <button
                                            key={prompt}
                                            onClick={() => sendMessage(prompt)}
                                            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50"
                                        >
                                            {prompt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Input */}
                        <div className="border-t border-slate-100 px-4 py-3">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    sendMessage(input);
                                }}
                                className="flex items-center gap-2"
                            >
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask Aura anything..."
                                    disabled={loading}
                                    className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-300 focus:bg-white disabled:opacity-50"
                                />
                                <Button
                                    type="submit"
                                    disabled={loading || !input.trim()}
                                    size="icon"
                                    className={`h-10 w-10 rounded-full bg-gradient-to-br ${glow} text-white shadow-md transition-transform hover:scale-105 disabled:opacity-40`}
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
