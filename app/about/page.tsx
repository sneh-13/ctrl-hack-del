"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import {
  ArrowRight,
  Clock3,
  ActivitySquare,
  ShieldAlert,
  Brain,
  Code2,
  BarChart3,
} from "lucide-react";

import { SiteNav } from "@/components/site/site-nav";
import { Button } from "@/components/ui/button";

/* ------------------------------------------------------------------ */
/*  Reveal-on-scroll                                                  */
/* ------------------------------------------------------------------ */
function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"} ${className}`}
    >
      {children}
    </div>
  );
}

/* ================================================================== */
/*  ABOUT PAGE                                                        */
/* ================================================================== */
export default function AboutPage() {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";

  return (
    <div className="min-h-screen">
      {/* ── Nav ─────────────────────────────────────────────── */}
      <div className="px-4 pt-6 md:px-8 md:pt-10">
        <div className="mx-auto w-full max-w-6xl">
          <SiteNav current="about" />
        </div>
      </div>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-4 pb-16 pt-20 md:px-8 md:pb-24 md:pt-28">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-1/3 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-100/40 blur-[120px]" />
        </div>

        <div className="mx-auto w-full max-w-4xl text-center">
          <Reveal>
            <p className="mb-5 inline-block rounded-full border border-blue-100 bg-blue-50/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">
              About Aura
            </p>
          </Reveal>
          <Reveal>
            <h1 className="font-display text-4xl font-bold leading-[1.12] tracking-tight text-slate-900 md:text-6xl">
              Training should respect your{" "}
              <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                biology.
              </span>
            </h1>
          </Reveal>
          <Reveal>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
              Aura is a predictive recommendation engine that aligns gym training with biological readiness.
              Instead of following a rigid schedule, you train based on how your body actually feels — every single day.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Core Pillars (cards) ────────────────────────────── */}
      <section className="border-y border-slate-200/60 bg-gradient-to-b from-slate-50/80 to-white px-4 py-20 md:px-8 md:py-24">
        <div className="mx-auto w-full max-w-5xl">
          <Reveal>
            <h2 className="text-center font-display text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              Three systems. One decision.
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {/* Pillar 1 */}
            <Reveal>
              <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                <Clock3 className="h-5 w-5 text-blue-600" />
                <h3 className="mt-4 font-display text-xl font-semibold text-slate-900">Biological Prime Time</h3>
                <p className="mt-2 text-sm text-slate-500">Predicting exact performance windows</p>
                <p className="mt-4 text-sm leading-relaxed text-slate-600">
                  Aura estimates optimal lifting windows from circadian timing and core body temperature trends.
                  For most lifters, peak force output occurs{" "}
                  <span className="font-semibold text-slate-900">6-11 hours</span> after waking.
                </p>
              </div>
            </Reveal>

            {/* Pillar 2 */}
            <Reveal>
              <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                <ActivitySquare className="h-5 w-5 text-blue-600" />
                <h3 className="mt-4 font-display text-xl font-semibold text-slate-900">Go / No-Go Readiness</h3>
                <p className="mt-2 text-sm text-slate-500">Eliminating junk volume and overtraining</p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2.5 rounded-lg bg-emerald-50 px-3 py-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    <span className="text-sm text-emerald-800">Green — PR attempts, high intent</span>
                  </div>
                  <div className="flex items-center gap-2.5 rounded-lg bg-amber-50 px-3 py-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                    <span className="text-sm text-amber-800">Yellow — RPE 6-7, technique work</span>
                  </div>
                  <div className="flex items-center gap-2.5 rounded-lg bg-rose-50 px-3 py-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                    <span className="text-sm text-rose-800">Red — mobility and recovery</span>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Pillar 3 */}
            <Reveal>
              <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                <ShieldAlert className="h-5 w-5 text-blue-600" />
                <h3 className="mt-4 font-display text-xl font-semibold text-slate-900">Muscle Loss Guardrails</h3>
                <p className="mt-2 text-sm text-slate-500">Preserving lean mass during deficits</p>
                <p className="mt-4 text-sm leading-relaxed text-slate-600">
                  When sleep disruption and stress suggest catabolic risk, Aura flags it and adjusts training load.
                  Soreness is tracked across{" "}
                  <span className="font-semibold text-slate-900">13 muscle groups</span> for
                  smarter recovery routing.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── The Team ────────────────────────────────────────── */}
      <section className="px-4 py-20 md:px-8 md:py-28">
        <div className="mx-auto w-full max-w-5xl">
          <Reveal>
            <p className="text-center text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">The team</p>
            <h2 className="mt-4 text-center font-display text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              Built by engineers who lift.
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-center text-base text-slate-500">
              Three computer science and engineering students combining software, data, and sports science.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {/* Krish */}
            <Reveal>
              <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-display text-lg font-semibold text-slate-900">Krish Patel</h3>
                <p className="text-sm font-medium text-blue-600">Readiness Engine & Architecture</p>
                <p className="mt-1 text-xs text-slate-400">Computer Engineering · TMU · 3rd Year</p>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  Driven by evidence-based strength training. Focused on readiness, recovery, and training intensity that matches the body's signals.
                </p>
              </div>
            </Reveal>

            {/* Sneh */}
            <Reveal>
              <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-display text-lg font-semibold text-slate-900">Sneh Patel</h3>
                <p className="text-sm font-medium text-blue-600">Circadian Modeling & Visualization</p>
                <p className="mt-1 text-xs text-slate-400">Computer Science · Western University · 3rd Year</p>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  Obsessed with circadian performance. Interested in biological prime time, energy rhythms, and timing training for peak output.
                </p>
              </div>
            </Reveal>

            {/* Harish */}
            <Reveal>
              <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600">
                  <Code2 className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-display text-lg font-semibold text-slate-900">Harish Kiritharan</h3>
                <p className="text-sm font-medium text-blue-600">Full-Stack Development & UX</p>
                <p className="mt-1 text-xs text-slate-400">Computer Science · TMU · 3rd Year</p>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  Into performance systems and consistency. Focused on sustainable training habits, smart fatigue management, and long-term progression.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="border-t border-slate-200/60 bg-gradient-to-b from-slate-50 to-white px-4 py-20 md:px-8 md:py-28">
        <div className="mx-auto w-full max-w-3xl text-center">
          <Reveal>
            <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 md:text-5xl">
              Ready to train{" "}
              <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                with intent?
              </span>
            </h2>
          </Reveal>
          <Reveal>
            <p className="mx-auto mt-4 max-w-xl text-base text-slate-600">
              Sign in and let your biology drive the session.
            </p>
          </Reveal>
          <Reveal>
            <div className="mt-8">
              <Button asChild className="h-12 rounded-xl bg-blue-600 px-7 text-base font-semibold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700">
                <Link href="/login">
                  Sign In
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="border-t border-slate-200/60 px-4 py-10 md:px-8">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-4 md:flex-row">
          <p className="font-display text-sm text-slate-400">© 2026 Aura. Bio-Adaptive Gym Optimizer.</p>
          <div className="flex gap-6 text-sm text-slate-400">
            <Link href="/" className="transition-colors hover:text-slate-600">Home</Link>
            {isAuthenticated ? (
              <Link href="/dashboard" className="transition-colors hover:text-slate-600">Dashboard</Link>
            ) : (
              <span className="cursor-not-allowed text-slate-300">Dashboard</span>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
