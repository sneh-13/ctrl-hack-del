"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Zap, Moon, Activity, Shield, Clock, BarChart3, Brain } from "lucide-react";

import { SiteNav } from "@/components/site/site-nav";
import { Button } from "@/components/ui/button";

/* ------------------------------------------------------------------ */
/*  Animated counter – counts up when visible                         */
/* ------------------------------------------------------------------ */
function AnimatedStat({
  value,
  suffix = "",
  prefix = "",
  label,
  sublabel,
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  sublabel?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) setStarted(true);
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let frame: number;
    const duration = 1400;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setCount(Math.round(eased * value));
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [started, value]);

  return (
    <div ref={ref} className="text-center">
      <p className="font-display text-5xl font-bold tracking-tight text-slate-900 md:text-6xl">
        {prefix}
        {count}
        {suffix}
      </p>
      <p className="mt-2 text-sm font-semibold uppercase tracking-[0.12em] text-blue-600">{label}</p>
      {sublabel && <p className="mt-1 text-xs text-slate-500">{sublabel}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Reveal-on-scroll wrapper                                          */
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

/* ------------------------------------------------------------------ */
/*  Inline SVG: Circadian Wave                                        */
/* ------------------------------------------------------------------ */
function CircadianWaveSVG() {
  return (
    <svg viewBox="0 0 400 180" className="w-full max-w-md" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="waveGrad" x1="0" y1="0" x2="400" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
          <stop offset="40%" stopColor="#3b82f6" stopOpacity="0.6" />
          <stop offset="60%" stopColor="#2563eb" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.15" />
        </linearGradient>
        <linearGradient id="waveFill" x1="0" y1="60" x2="0" y2="180" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* background grid lines */}
      {[40, 80, 120, 160].map((y) => (
        <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="#e2e8f0" strokeWidth="0.5" />
      ))}
      {/* peak zone highlight */}
      <rect x="140" y="10" width="120" height="170" rx="8" fill="#3b82f6" opacity="0.06" />
      <text x="200" y="170" textAnchor="middle" className="fill-blue-500 text-[9px] font-medium">PEAK WINDOW</text>
      {/* curve fill */}
      <path d="M0,130 C50,120 100,90 150,45 C180,25 220,25 250,45 C300,90 350,120 400,130 L400,180 L0,180 Z" fill="url(#waveFill)" />
      {/* curve stroke */}
      <path d="M0,130 C50,120 100,90 150,45 C180,25 220,25 250,45 C300,90 350,120 400,130" stroke="url(#waveGrad)" strokeWidth="3" strokeLinecap="round" />
      {/* peak dot */}
      <circle cx="200" cy="25" r="5" fill="#2563eb" />
      <circle cx="200" cy="25" r="9" fill="#3b82f6" opacity="0.25">
        <animate attributeName="r" values="9;14;9" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.25;0.05;0.25" dur="2s" repeatCount="indefinite" />
      </circle>
      {/* time labels */}
      <text x="20" y="155" className="fill-slate-400 text-[9px]">Wake</text>
      <text x="360" y="155" className="fill-slate-400 text-[9px]">Sleep</text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Inline SVG: Readiness Gauge                                       */
/* ------------------------------------------------------------------ */
function ReadinessGaugeSVG() {
  return (
    <svg viewBox="0 0 200 130" className="w-full max-w-[220px]" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gaugeGrad" x1="20" y1="100" x2="180" y2="100">
          <stop offset="0%" stopColor="#f43f5e" />
          <stop offset="40%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
      </defs>
      {/* arc track */}
      <path d="M 30 110 A 70 70 0 0 1 170 110" stroke="#e2e8f0" strokeWidth="14" strokeLinecap="round" fill="none" />
      {/* colored arc */}
      <path d="M 30 110 A 70 70 0 0 1 170 110" stroke="url(#gaugeGrad)" strokeWidth="14" strokeLinecap="round" fill="none" strokeDasharray="220" strokeDashoffset="60">
        <animate attributeName="stroke-dashoffset" from="220" to="60" dur="1.4s" fill="freeze" />
      </path>
      {/* needle */}
      <line x1="100" y1="110" x2="145" y2="55" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round">
        <animateTransform attributeName="transform" type="rotate" from="-90 100 110" to="25 100 110" dur="1.4s" fill="freeze" />
      </line>
      <circle cx="100" cy="110" r="5" fill="#1e293b" />
      {/* labels */}
      <text x="25" y="125" className="fill-rose-400 text-[8px] font-semibold">RED</text>
      <text x="85" y="30" className="fill-amber-500 text-[8px] font-semibold">YELLOW</text>
      <text x="155" y="125" className="fill-emerald-500 text-[8px] font-semibold">GO</text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Inline SVG: Body Silhouette                                       */
/* ------------------------------------------------------------------ */
function BodySilhouetteSVG() {
  return (
    <svg viewBox="0 0 120 260" className="h-48 w-auto md:h-56" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* head */}
      <circle cx="60" cy="28" r="18" fill="#dbeafe" stroke="#93c5fd" strokeWidth="1.5" />
      {/* torso */}
      <path d="M40,48 C38,55 35,85 36,120 L84,120 C85,85 82,55 80,48 Z" fill="#dbeafe" stroke="#93c5fd" strokeWidth="1.5" />
      {/* arms */}
      <path d="M38,52 C25,60 15,85 12,110" stroke="#93c5fd" strokeWidth="6" strokeLinecap="round" fill="none" />
      <path d="M82,52 C95,60 105,85 108,110" stroke="#93c5fd" strokeWidth="6" strokeLinecap="round" fill="none" />
      {/* legs */}
      <path d="M44,120 L38,190 L35,240" stroke="#93c5fd" strokeWidth="7" strokeLinecap="round" fill="none" />
      <path d="M76,120 L82,190 L85,240" stroke="#93c5fd" strokeWidth="7" strokeLinecap="round" fill="none" />
      {/* soreness highlights */}
      <circle cx="60" cy="80" r="14" fill="#3b82f6" opacity="0.2">
        <animate attributeName="opacity" values="0.2;0.4;0.2" dur="2.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="40" cy="170" r="10" fill="#f59e0b" opacity="0.3">
        <animate attributeName="opacity" values="0.3;0.5;0.3" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle cx="80" cy="170" r="10" fill="#10b981" opacity="0.2" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Feature Row (alternating layout)                                  */
/* ------------------------------------------------------------------ */
function FeatureRow({
  icon: Icon,
  title,
  description,
  detail,
  children,
  reverse = false,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  detail: string;
  children: React.ReactNode;
  reverse?: boolean;
}) {
  return (
    <Reveal>
      <div className={`flex flex-col items-center gap-10 md:gap-16 ${reverse ? "md:flex-row-reverse" : "md:flex-row"}`}>
        {/* graphic */}
        <div className="flex shrink-0 items-center justify-center rounded-3xl border border-slate-100 bg-white/70 p-8 shadow-sm backdrop-blur md:w-[340px]">
          {children}
        </div>
        {/* text */}
        <div className="max-w-xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
              <Icon className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">Feature</p>
          </div>
          <h3 className="font-display text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">{title}</h3>
          <p className="text-lg leading-relaxed text-slate-600">{description}</p>
          <p className="text-sm leading-relaxed text-slate-500">{detail}</p>
        </div>
      </div>
    </Reveal>
  );
}

/* ================================================================== */
/*  HOME PAGE                                                         */
/* ================================================================== */
export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* ── Nav ────────────────────────────────────────────────── */}
      <div className="px-4 pt-6 md:px-8 md:pt-10">
        <div className="mx-auto w-full max-w-6xl">
          <SiteNav current="home" />
        </div>
      </div>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-4 pb-24 pt-20 md:px-8 md:pb-32 md:pt-28">
        {/* subtle radial glow */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-1/2 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-100/50 blur-[120px]" />
        </div>

        <div className="mx-auto w-full max-w-5xl text-center">
          <Reveal>
            <p className="mb-5 inline-block rounded-full border border-blue-100 bg-blue-50/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">
              Bio-Adaptive Gym Optimizer
            </p>
          </Reveal>

          <Reveal>
            <h1 className="mx-auto max-w-4xl font-display text-5xl font-bold leading-[1.08] tracking-tight text-slate-900 md:text-7xl lg:text-8xl">
              Train in sync with your{" "}
              <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">biology.</span>
            </h1>
          </Reveal>

          <Reveal>
            <p className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-slate-600 md:text-xl">
              Aura is a predictive recommendation engine that aligns your gym training with biological readiness —
              so every session is timed and dosed with intent.
            </p>
          </Reveal>

          <Reveal>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Button asChild className="h-12 rounded-xl bg-blue-600 px-7 text-base font-semibold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700">
                <Link href="/dashboard">
                  Open Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-12 rounded-xl border-slate-300 bg-white px-7 text-base text-slate-700 hover:bg-slate-50">
                <Link href="/about">Learn More</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Stats Bar ──────────────────────────────────────────── */}
      <section className="border-y border-slate-200/60 bg-white/60 px-4 py-16 backdrop-blur md:px-8 md:py-20">
        <div className="mx-auto grid w-full max-w-5xl grid-cols-2 gap-10 md:grid-cols-4 md:gap-6">
          <AnimatedStat value={6} suffix="-11h" label="Peak Window" sublabel="hours post-wake for peak force" />
          <AnimatedStat value={3} label="Readiness States" sublabel="Green · Yellow · Red" />
          <AnimatedStat value={13} label="Muscle Groups" sublabel="tracked for soreness mapping" />
          <AnimatedStat value={24} suffix="h" label="Energy Curve" sublabel="circadian prediction" />
        </div>
      </section>

      {/* ── Problem Awareness ─────────────────────────────────── */}
      <section className="px-4 py-24 md:px-8 md:py-32">
        <div className="mx-auto w-full max-w-4xl text-center">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">The problem</p>
          </Reveal>
          <Reveal>
            <h2 className="mt-4 font-display text-4xl font-bold leading-snug tracking-tight text-slate-900 md:text-5xl lg:text-6xl">
              You&apos;re leaving gains on the table.
            </h2>
          </Reveal>
          <Reveal>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
              Most lifters follow a fixed schedule regardless of sleep debt, stress, or recovery state.
              Research shows that mistimed training increases injury risk by up to{" "}
              <span className="font-semibold text-slate-900">40%</span> and reduces strength output by{" "}
              <span className="font-semibold text-slate-900">15-20%</span>.
            </p>
          </Reveal>
          <Reveal>
            <p className="mx-auto mt-4 max-w-2xl text-base text-slate-500">
              Your body isn&apos;t a machine with a fixed output. It has peaks and valleys every single day.
              Aura helps you find them.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Two Pillars ───────────────────────────────────────── */}
      <section className="border-y border-slate-200/60 bg-gradient-to-b from-slate-50/80 to-white px-4 py-24 md:px-8 md:py-32">
        <div className="mx-auto w-full max-w-5xl">
          <Reveal>
            <p className="text-center text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Core science</p>
            <h2 className="mt-4 text-center font-display text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
              Two pillars of bio-adaptive training.
            </h2>
          </Reveal>

          <div className="mt-16 grid gap-8 md:grid-cols-2">
            <Reveal>
              <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-display text-2xl font-semibold text-slate-900">Biological Prime Time</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  Your force output, nerve conduction velocity, and muscle enzyme activity peak at predictable hours
                  each day — driven by core body temperature and circadian rhythm.
                </p>
                <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/70 px-5 py-4">
                  <p className="font-display text-3xl font-bold text-blue-600">6-11h</p>
                  <p className="mt-1 text-xs text-slate-500">post-wake is the primary strength peak for most lifters.</p>
                </div>
              </div>
            </Reveal>

            <Reveal>
              <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
                  <Activity className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-display text-2xl font-semibold text-slate-900">Go / No-Go Readiness</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  HRV trends, sleep debt, and yesterday&apos;s session RPE feed a daily readiness score that tells you
                  exactly how hard to push — or when to pull back.
                </p>
                <div className="mt-6 space-y-2">
                  <div className="flex items-center gap-3 rounded-xl bg-emerald-50 px-4 py-2.5">
                    <span className="h-3 w-3 rounded-full bg-emerald-500" />
                    <span className="text-sm font-medium text-emerald-800">Green — PR attempts, high intent</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl bg-amber-50 px-4 py-2.5">
                    <span className="h-3 w-3 rounded-full bg-amber-500" />
                    <span className="text-sm font-medium text-amber-800">Yellow — RPE 6-7, technique focus</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl bg-rose-50 px-4 py-2.5">
                    <span className="h-3 w-3 rounded-full bg-rose-500" />
                    <span className="text-sm font-medium text-rose-800">Red — mobility, recovery, deload</span>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Feature Walkthrough ────────────────────────────────── */}
      <section className="px-4 py-24 md:px-8 md:py-32">
        <div className="mx-auto w-full max-w-5xl space-y-24 md:space-y-32">
          <FeatureRow
            icon={BarChart3}
            title="24-Hour Energy Clock"
            description="See exactly when your body is primed for maximal output — and when it's not."
            detail="Aura models circadian and ultradian rhythms from your wake time and chronotype to produce a 24-hour performance curve. The highlighted peak window shows your best lifting hours."
          >
            <CircadianWaveSVG />
          </FeatureRow>

          <FeatureRow
            icon={Zap}
            title="Instant Go / No-Go"
            description="A three-second glance tells you everything you need to know about today."
            detail="The readiness gauge synthesizes sleep duration, stress level, last RPE, and subjective soreness into a single score. No guesswork — just clear direction."
            reverse
          >
            <ReadinessGaugeSVG />
          </FeatureRow>

          <FeatureRow
            icon={Shield}
            title="Interactive Body Map"
            description="Pinpoint soreness down to individual muscle groups for smarter programming."
            detail="Log soreness across 13 muscle groups with a simple tap. Aura uses this data to flag catabolic risk during cuts and route you away from high-risk training when recovery is compromised."
          >
            <BodySilhouetteSVG />
          </FeatureRow>
        </div>
      </section>

      {/* ── Big Stat Callout ───────────────────────────────────── */}
      <section className="border-y border-slate-200/60 bg-gradient-to-b from-white to-slate-50 px-4 py-24 md:px-8 md:py-32">
        <div className="mx-auto w-full max-w-3xl text-center">
          <Reveal>
            <p className="font-display text-6xl font-bold tracking-tight text-blue-600 md:text-8xl">80%</p>
          </Reveal>
          <Reveal>
            <p className="mt-4 text-xl font-medium text-slate-900 md:text-2xl">
              of overtraining injuries are preventable
            </p>
          </Reveal>
          <Reveal>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-500">
              When athletes train with readiness data instead of fixed schedules, injury rates drop dramatically and
              strength gains improve — because every session is calibrated to what the body can actually handle.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────────── */}
      <section className="px-4 py-24 md:px-8 md:py-32">
        <div className="mx-auto w-full max-w-5xl">
          <Reveal>
            <h2 className="text-center font-display text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
              Simple. Every single day.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-center text-lg text-slate-500">
              Three steps to training that actually respects your biology.
            </p>
          </Reveal>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {[
              { step: "01", title: "Check In", desc: "Log sleep, stress, and soreness in under 60 seconds.", icon: Moon },
              { step: "02", title: "Get Your Signal", desc: "Aura computes readiness, peak window, and a Go/No-Go directive.", icon: Brain },
              { step: "03", title: "Train Smart", desc: "Follow your personalized energy curve and intensity guidance.", icon: Zap },
            ].map((item) => (
              <Reveal key={item.step}>
                <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                  <p className="font-display text-4xl font-bold text-blue-100">{item.step}</p>
                  <div className="mt-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                    <item.icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="mt-4 font-display text-xl font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────── */}
      <section className="border-t border-slate-200/60 bg-gradient-to-b from-slate-50 to-white px-4 py-24 md:px-8 md:py-32">
        <div className="mx-auto w-full max-w-3xl text-center">
          <Reveal>
            <h2 className="font-display text-4xl font-bold tracking-tight text-slate-900 md:text-5xl lg:text-6xl">
              Start training{" "}
              <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">smarter.</span>
            </h2>
          </Reveal>
          <Reveal>
            <p className="mx-auto mt-5 max-w-xl text-lg text-slate-600">
              Stop guessing. Let your biology drive your programming.
            </p>
          </Reveal>
          <Reveal>
            <div className="mt-10">
              <Button asChild className="h-13 rounded-xl bg-blue-600 px-8 text-base font-semibold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700">
                <Link href="/dashboard">
                  Open Your Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="border-t border-slate-200/60 px-4 py-10 md:px-8">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-4 md:flex-row">
          <p className="font-display text-sm text-slate-400">© 2026 Aura. Bio-Adaptive Gym Optimizer.</p>
          <div className="flex gap-6 text-sm text-slate-400">
            <Link href="/about" className="hover:text-slate-600 transition-colors">About</Link>
            <Link href="/dashboard" className="hover:text-slate-600 transition-colors">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
