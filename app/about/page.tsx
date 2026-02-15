import { ActivitySquare, Clock3, ShieldAlert } from "lucide-react";

import { SiteNav } from "@/components/site/site-nav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="min-h-screen px-4 py-6 md:px-8 md:py-10">
      <div className="mx-auto w-full max-w-6xl space-y-8">
        <SiteNav current="about" />

        <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm md:p-12">
          <p className="text-xs font-semibold tracking-[0.14em] text-slate-500 uppercase">About Aura</p>
          <h1 className="mt-3 text-4xl text-slate-900 md:text-5xl">Why This Project Exists</h1>
          <p className="mt-5 max-w-4xl text-lg text-slate-600">
            Aura aligns gym training with biological readiness instead of rigid scheduling. The Gym Optimizer is designed
            as a predictive recommendation engine that tells lifters when to train and how hard to push to maximize
            performance while preserving lean mass.
          </p>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <Clock3 className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-xl text-slate-900">1. Biological Prime Time</CardTitle>
              <CardDescription className="text-slate-500">Predicting exact performance windows</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-slate-600">
              <p>Aura estimates optimal lifting windows from circadian timing and core body temperature trends.</p>
              <p>
                The goal is a practical, personalized window where nerve conduction velocity and muscle enzyme activity
                are most favorable.
              </p>
              <p>For most users, this is 6-11 hours after waking.</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <ActivitySquare className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-xl text-slate-900">2. Autoregulated Go/No-Go</CardTitle>
              <CardDescription className="text-slate-500">Eliminating junk volume and overtraining</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-slate-600">
              <p>Daily readiness is scored from signals like HRV trends and sleep debt.</p>
              <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p><span className="font-semibold text-emerald-700">Green Light:</span> Optimal readiness, push for PR-level effort.</p>
                <p><span className="font-semibold text-amber-700">Yellow Light:</span> Moderate fatigue, cap intensity around RPE 6-7.</p>
                <p><span className="font-semibold text-rose-700">Red Light:</span> High CNS fatigue, mandatory rest or deload.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <ShieldAlert className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-xl text-slate-900">3. Muscle Loss Guardrails</CardTitle>
              <CardDescription className="text-slate-500">Preserving lean mass during deficits</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-slate-600">
              <p>
                Aura helps protect muscle while cutting by flagging stress states where cortisol pressure is likely
                elevated.
              </p>
              <p>
                If poor sleep and high stress imply catabolic risk, workout recommendations are adjusted to limit
                unnecessary tissue loss.
              </p>
              <p>This gives bodybuilders a practical safety layer while staying lean.</p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
