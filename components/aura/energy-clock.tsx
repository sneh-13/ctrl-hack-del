"use client";

import { useMemo } from "react";
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { Zap } from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

interface EnergyClockProps {
  wakeTime: string;
  peakStartOffsetHours?: number;
  peakEndOffsetHours?: number;
  hourlyPerformance: number[];
}

function toMinutes(time: string) {
  const [hourRaw, minuteRaw] = time.split(":");
  const hour = Number.parseInt(hourRaw ?? "0", 10);
  const minute = Number.parseInt(minuteRaw ?? "0", 10);
  return hour * 60 + minute;
}

function formatMinutes(minutes: number) {
  const normalized = ((minutes % 1440) + 1440) % 1440;
  const hour24 = Math.floor(normalized / 60);
  const minute = normalized % 60;
  const suffix = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${hour12}:${String(minute).padStart(2, "0")} ${suffix}`;
}

function minuteToAngle(minutes: number) {
  return (minutes / 1440) * 360 - 90;
}

function polarToCartesian(cx: number, cy: number, radius: number, angleDeg: number) {
  const angle = (angleDeg * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  };
}

function describeArc(cx: number, cy: number, radius: number, startMin: number, endMin: number) {
  const start = polarToCartesian(cx, cy, radius, minuteToAngle(startMin));
  const end = polarToCartesian(cx, cy, radius, minuteToAngle(endMin));
  const largeArcFlag = endMin - startMin > 720 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
}

export function EnergyClock({
  wakeTime,
  peakStartOffsetHours = 6,
  peakEndOffsetHours = 11,
  hourlyPerformance,
}: EnergyClockProps) {
  const wakeMinutes = toMinutes(wakeTime);
  const peakStartMinutes = (wakeMinutes + peakStartOffsetHours * 60) % 1440;
  const peakEndMinutes = (wakeMinutes + peakEndOffsetHours * 60) % 1440;

  const peakSegments =
    peakStartMinutes <= peakEndMinutes
      ? [[peakStartMinutes, peakEndMinutes]]
      : [
          [peakStartMinutes, 1440],
          [0, peakEndMinutes],
        ];

  const wakeMarker = polarToCartesian(140, 140, 98, minuteToAngle(wakeMinutes));

  const labels = useMemo(
    () => Array.from({ length: 24 }, (_, index) => `${String(index).padStart(2, "0")}:00`),
    [],
  );

  const chartData = useMemo(
    () => ({
      labels,
      datasets: [
        {
          data: hourlyPerformance,
          borderColor: "rgba(57, 255, 20, 0.95)",
          backgroundColor: "rgba(57, 255, 20, 0.16)",
          borderWidth: 2,
          tension: 0.42,
          fill: true,
          pointRadius: 0,
        },
      ],
    }),
    [hourlyPerformance, labels],
  );

  return (
    <div className="space-y-5">
      <div className="relative mx-auto h-[280px] w-[280px]">
        <svg viewBox="0 0 280 280" className="h-full w-full">
          <defs>
            <linearGradient id="peak-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#39ff14" />
              <stop offset="100%" stopColor="#84ff4f" />
            </linearGradient>
          </defs>

          <circle cx="140" cy="140" r="98" fill="none" stroke="rgba(110, 132, 159, 0.28)" strokeWidth="16" />

          {Array.from({ length: 24 }, (_, hour) => {
            const angle = minuteToAngle(hour * 60);
            const inner = polarToCartesian(140, 140, hour % 3 === 0 ? 78 : 86, angle);
            const outer = polarToCartesian(140, 140, 106, angle);
            return (
              <line
                key={hour}
                x1={inner.x}
                y1={inner.y}
                x2={outer.x}
                y2={outer.y}
                stroke={hour % 3 === 0 ? "rgba(140, 176, 210, 0.75)" : "rgba(90, 122, 156, 0.55)"}
                strokeWidth={hour % 3 === 0 ? 2 : 1}
              />
            );
          })}

          {peakSegments.map(([start, end], index) => (
            <path
              key={`${start}-${end}-${index}`}
              d={describeArc(140, 140, 98, start, end)}
              stroke="url(#peak-gradient)"
              strokeWidth="16"
              strokeLinecap="round"
              fill="none"
            />
          ))}

          <circle cx={wakeMarker.x} cy={wakeMarker.y} r="7" fill="#38bdf8" stroke="#0f172a" strokeWidth="2" />
        </svg>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xs tracking-[0.22em] text-slate-400 uppercase">Strength Peak</span>
          <span className="font-display mt-1 text-2xl text-white">{formatMinutes(peakStartMinutes)}</span>
          <span className="text-xs tracking-[0.16em] text-slate-300 uppercase">to {formatMinutes(peakEndMinutes)}</span>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-slate-950/65 p-3">
        <div className="mb-2 flex items-center gap-2 text-xs tracking-[0.14em] text-slate-300 uppercase">
          <Zap className="h-4 w-4 text-[#39ff14]" />
          Circadian Force Curve
        </div>
        <div className="h-24">
          <Line
            data={chartData}
            options={{
              maintainAspectRatio: false,
              animation: {
                duration: 550,
              },
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    label: (context) => `Power potential: ${context.parsed.y}%`,
                  },
                },
              },
              scales: {
                x: {
                  ticks: {
                    color: "rgba(148, 163, 184, 0.8)",
                    maxTicksLimit: 6,
                  },
                  grid: {
                    display: false,
                  },
                },
                y: {
                  display: false,
                  min: 0,
                  max: 100,
                  grid: {
                    display: false,
                  },
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
