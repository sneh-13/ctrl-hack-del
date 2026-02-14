import { ActivitySquare, Clock3, ShieldAlert } from "lucide-react";

import { SiteNav } from "@/components/site/site-nav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="min-h-screen px-4 py-6 md:px-8 md:py-9">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <SiteNav current="about" />

        <section className="rounded-3xl border border-cyan-300/20 bg-slate-950/70 p-6 backdrop-blur md:p-10">
          <p className="text-xs tracking-[0.16em] text-slate-400 uppercase">About Aura</p>
          <h1 className="font-display mt-2 text-4xl text-white md:text-5xl">Why This Project Exists</h1>
          <p className="mt-4 max-w-4xl text-lg text-slate-300">
            Aura is built to align gym training with biological readiness instead of rigid schedule assumptions. The purpose of
            the Gym Optimizer is to provide a predictive recommendation engine that identifies when, and how hard, a lifter
            should train to maximize performance and preserve lean mass.
          </p>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <Card className="border-white/10 bg-slate-950/68">
            <CardHeader>
              <Clock3 className="h-6 w-6 text-cyan-200" />
              <CardTitle className="font-display text-xl text-white">1. Biological Prime Time</CardTitle>
              <CardDescription>Predicting exact performance windows</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-300">
              <p>
                Aura estimates each athlete&apos;s optimal lifting window through circadian timing and core body temperature trends.
              </p>
              <p>
                The target output is a practical training window where nerve conduction velocity and muscle enzyme activity are
                most favorable.
              </p>
              <p>
                For most users, this lands in the 6-11 hour window after waking.
              </p>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-slate-950/68">
            <CardHeader>
              <ActivitySquare className="h-6 w-6 text-cyan-200" />
              <CardTitle className="font-display text-xl text-white">2. Autoregulated Go/No-Go</CardTitle>
              <CardDescription>Eliminating junk volume and overtraining</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-300">
              <p>
                Daily readiness is scored from signals like heart-rate-variability trends and sleep debt.
              </p>
              <div className="space-y-2 rounded-xl border border-white/10 bg-slate-900/60 p-3">
                <p>
                  <span className="font-semibold text-[#7eff61]">Green Light:</span> Optimal readiness, push for PR-level effort.
                </p>
                <p>
                  <span className="font-semibold text-[#ffd38a]">Yellow Light:</span> Moderate fatigue, cap intensity around RPE 6-7.
                </p>
                <p>
                  <span className="font-semibold text-[#ff9db2]">Red Light:</span> High CNS fatigue, mandatory rest or deload.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-slate-950/68">
            <CardHeader>
              <ShieldAlert className="h-6 w-6 text-cyan-200" />
              <CardTitle className="font-display text-xl text-white">3. Muscle Loss Guardrails</CardTitle>
              <CardDescription>Preserving lean mass during deficits</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-300">
              <p>
                A key focus is protecting muscle while cutting. Aura flags high-stress states where cortisol pressure is likely elevated.
              </p>
              <p>
                When poor sleep or high stress indicates catabolic risk, workout guidance is adjusted to reduce unnecessary tissue loss.
              </p>
              <p>
                This provides bodybuilders a safety layer to stay lean without sacrificing hard-earned muscle.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
