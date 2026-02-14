import Link from "next/link";
import { ArrowRight, BrainCircuit, Shield, TimerReset } from "lucide-react";

import { SiteNav } from "@/components/site/site-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const pillars = [
  {
    title: "Biological Prime Time Prediction",
    detail:
      "Aura predicts your exact performance window using circadian rhythm and core body temperature signals. For most lifters, force output peaks 6-11 hours after waking.",
    icon: TimerReset,
  },
  {
    title: "Autoregulated Go/No-Go Training",
    detail:
      "HRV and sleep debt inform a readiness traffic light: Green for PR pursuit, Yellow for RPE 6-7 technique work, Red for mandatory rest or deload.",
    icon: BrainCircuit,
  },
  {
    title: "Muscle Loss Preservation",
    detail:
      "Aura protects lean mass during a caloric deficit by flagging catabolic risk when stress and poor sleep imply an unfavorable testosterone-to-cortisol balance.",
    icon: Shield,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen px-4 py-6 md:px-8 md:py-9">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <SiteNav current="home" />

        <section className="overflow-hidden rounded-3xl border border-cyan-300/20 bg-slate-950/70 p-6 backdrop-blur md:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.35fr_1fr]">
            <div>
              <Badge className="bg-cyan-400/15 text-cyan-100 hover:bg-cyan-400/15">Bio-Adaptive Gym Optimizer</Badge>
              <h1 className="font-display mt-4 text-4xl leading-tight text-white md:text-6xl">
                Train When Your Biology Is Ready, Not When The Clock Says So.
              </h1>
              <p className="mt-4 max-w-2xl text-lg text-slate-300">
                Aura is a predictive recommendation engine that aligns training with biological readiness. It helps lifters
                maximize output, reduce junk volume, and protect muscle while cutting.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button asChild className="bg-[#39ff14] text-slate-950 hover:bg-[#7eff61]">
                  <Link href="/dashboard">
                    Open User Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>

                <Button asChild variant="outline" className="border-cyan-300/35 bg-slate-900 text-cyan-100 hover:bg-slate-800">
                  <Link href="/about">About Aura</Link>
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/65 p-5">
              <p className="text-xs tracking-[0.16em] text-slate-400 uppercase">Purpose</p>
              <p className="mt-3 text-slate-200">
                The Gym Optimizer exists to provide lifters a precise, predictive system for readiness-guided training decisions.
              </p>
              <div className="mt-5 space-y-3 text-sm">
                <div className="rounded-xl border border-white/10 bg-slate-950/80 p-3 text-slate-300">
                  <span className="font-display text-cyan-200">6-11h post-wake</span>
                  <p className="mt-1">Primary strength peak window for most users.</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-slate-950/80 p-3 text-slate-300">
                  <span className="font-display text-[#7eff61]">Green / Yellow / Red</span>
                  <p className="mt-1">Immediate effort prescription based on biological readiness.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <Card key={pillar.title} className="border-white/10 bg-slate-950/68">
                <CardHeader>
                  <Icon className="h-6 w-6 text-cyan-200" />
                  <CardTitle className="font-display text-xl text-white">{pillar.title}</CardTitle>
                  <CardDescription className="text-slate-300">Core project outcome</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-300">{pillar.detail}</p>
                </CardContent>
              </Card>
            );
          })}
        </section>
      </div>
    </div>
  );
}
