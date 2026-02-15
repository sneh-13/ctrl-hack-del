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
      "Aura predicts performance windows from circadian rhythm and core body temperature signals. For most lifters, force output peaks 6-11 hours after waking.",
    icon: TimerReset,
  },
  {
    title: "Autoregulated Go/No-Go Training",
    detail:
      "HRV and sleep debt power a daily readiness light: Green for PR attempts, Yellow for RPE 6-7 technique work, Red for rest or deload.",
    icon: BrainCircuit,
  },
  {
    title: "Muscle Loss Preservation",
    detail:
      "Aura protects lean mass in a calorie deficit by reducing high-risk training load when stress and poor sleep suggest catabolic pressure.",
    icon: Shield,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen px-4 py-6 md:px-8 md:py-10">
      <div className="mx-auto w-full max-w-6xl space-y-8">
        <SiteNav current="home" />

        <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm md:p-12">
          <Badge className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-blue-700 hover:bg-blue-50">
            Bio-Adaptive Gym Optimizer
          </Badge>

          <h1 className="mt-5 max-w-3xl text-4xl leading-tight text-slate-900 md:text-6xl">
            Train in sync with your biology.
          </h1>

          <p className="mt-5 max-w-2xl text-lg text-slate-600">
            Aura is a predictive recommendation engine that aligns your gym training with biological readiness so every
            session is timed and dosed with intent.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild className="h-11 rounded-xl bg-blue-600 px-5 text-white hover:bg-blue-700">
              <Link href="/dashboard">
                Open User Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-11 rounded-xl border-slate-300 bg-white px-5 text-slate-700">
              <Link href="/about">About Aura</Link>
            </Button>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">6-11h post-wake</p>
              <p className="mt-1 text-sm text-slate-600">Primary strength peak window for most users.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">Green / Yellow / Red</p>
              <p className="mt-1 text-sm text-slate-600">Immediate effort guidance from readiness state.</p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <Card key={pillar.title} className="border-slate-200 bg-white shadow-sm">
                <CardHeader>
                  <Icon className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-xl text-slate-900">{pillar.title}</CardTitle>
                  <CardDescription className="text-slate-500">Core project outcome</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-6 text-slate-600">{pillar.detail}</p>
                </CardContent>
              </Card>
            );
          })}
        </section>
      </div>
    </div>
  );
}
