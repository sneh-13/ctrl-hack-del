"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { ChevronDown, History, LogOut, Globe } from "lucide-react";
import { useLanguage, type LanguageCode } from "@/components/providers/language-provider";

import { cn } from "@/lib/utils";

function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  const languages: { code: LanguageCode; label: string }[] = [
    { code: "en", label: "English" },
    { code: "es", label: "Español" },
    { code: "fr", label: "Français" },
    { code: "de", label: "Deutsch" },
    { code: "ja", label: "日本語" },
  ];

  return (
    <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5">
      <Globe className="h-3.5 w-3.5 text-slate-400" />
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as LanguageCode)}
        className="bg-transparent text-xs font-medium text-slate-700 outline-none"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
}

interface SiteNavProps {
  current: "home" | "dashboard" | "coach" | "about" | "login" | "register" | "history";
  className?: string;
  suppressActive?: boolean;
}

const items: Array<{ key: SiteNavProps["current"]; href: string; label: string }> = [
  { key: "home", href: "/", label: "Home" },
  { key: "dashboard", href: "/dashboard", label: "Dashboard" },
  { key: "coach", href: "/coach", label: "AI Coach" },
  { key: "about", href: "/about", label: "About Us" },
];

export function SiteNav({ current, className, suppressActive = false }: SiteNavProps) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const firstName = session?.user?.name?.split(" ")[0] ?? "Account";

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav
      className={cn(
        "relative flex items-center justify-between rounded-2xl border border-slate-200 bg-white/92 px-4 py-3 shadow-sm backdrop-blur md:px-6",
        suppressActive ? "z-40" : "z-[200]",
        className,
      )}
    >
      <Link href="/" className="font-display text-xl tracking-[-0.02em] text-slate-900">
        Aura
      </Link>

      <div className="flex items-center gap-2">
        <div className="mr-2 hidden md:block">
          <LanguageSelector />
        </div>

        {items.map((item) => {
          const requiresAuth = item.key === "dashboard" || item.key === "coach";
          const locked = !session && requiresAuth;
          const active = !suppressActive && item.key === current;

          if (locked) {
            return (
              <span
                key={item.key}
                aria-disabled="true"
                title="Sign in to access"
                className="cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-medium tracking-[0.02em] text-slate-400 md:text-sm"
              >
                {item.label}
              </span>
            );
          }

          return (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs font-medium tracking-[0.02em] transition-colors md:text-sm",
                active
                  ? "border-blue-200 bg-blue-50 text-blue-700"
                  : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-900",
              )}
            >
              {item.label}
            </Link>
          );
        })}

        {session ? (
          <div className="relative ml-1" ref={dropdownRef}>
            <button
              onClick={() => setOpen((prev) => !prev)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-100 md:text-sm"
            >
              {firstName}
              <ChevronDown
                className={cn("h-3.5 w-3.5 text-slate-400 transition-transform duration-150", open && "rotate-180")}
              />
            </button>

            {open && (
              <div
                className="absolute right-0 top-full z-[210] mt-1.5 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
                onMouseDown={(event) => event.stopPropagation()}
                onClick={(event) => event.stopPropagation()}
              >
                <div className="border-b border-slate-100 px-3 py-2.5">
                  <p className="text-xs font-medium text-slate-900">{session.user?.name}</p>
                  <p className="truncate text-xs text-slate-400">{session.user?.email}</p>
                </div>
                <div className="border-b border-slate-100 p-2 md:hidden">
                  <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Language</p>
                  <LanguageSelector />
                </div>
                <button
                  onClick={() => {
                    window.location.assign("/history");
                  }}
                  className="flex w-full items-center gap-2 border-b border-slate-100 px-3 py-2.5 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50 md:text-sm"
                >
                  <History className="h-3.5 w-3.5" />
                  View history
                </button>
                <button
                  onClick={() => {
                    setOpen(false);
                    signOut({ callbackUrl: "/" });
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50 md:text-sm"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/login"
            className={cn(
              "ml-1 rounded-lg border px-3 py-1.5 text-xs font-medium tracking-[0.02em] transition-colors md:text-sm",
              current === "login"
                ? "border-blue-200 bg-blue-50 text-blue-700"
                : "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
            )}
          >
            Sign in
          </Link>
        )}
      </div>
    </nav>
  );
}
