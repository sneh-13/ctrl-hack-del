"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type LanguageCode = "en" | "es" | "fr" | "de" | "ja";

interface LanguageContextType {
    language: LanguageCode;
    setLanguage: (lang: LanguageCode) => void;
    voiceId: string; // ElevenLabs Voice ID for the selected language
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Voice mappings for ElevenLabs
// Using "Rachel" for English and other high-quality multilingual voices where appropriate
// For simplicity, we might reuse a multilingual voice or specific ones if known.
// "21m00Tcm4TlvDq8ikWAM" is Rachel (English/Multilingual v2)
const VOICE_MAP: Record<LanguageCode, string> = {
    en: "21m00Tcm4TlvDq8ikWAM", // Rachel
    es: "21m00Tcm4TlvDq8ikWAM", // Rachel (works well for multilingual)
    fr: "21m00Tcm4TlvDq8ikWAM",
    de: "21m00Tcm4TlvDq8ikWAM",
    ja: "21m00Tcm4TlvDq8ikWAM",
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<LanguageCode>("en");

    // Persist language preference
    useEffect(() => {
        const saved = localStorage.getItem("aura-language") as LanguageCode;
        if (saved && VOICE_MAP[saved]) {
            setLanguage(saved);
        }
    }, []);

    const handleSetLanguage = (lang: LanguageCode) => {
        setLanguage(lang);
        localStorage.setItem("aura-language", lang);
    };

    return (
        <LanguageContext.Provider
            value={{
                language,
                setLanguage: handleSetLanguage,
                voiceId: VOICE_MAP[language],
            }}
        >
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}
