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
          borderColor: "rgba(0, 148, 255, 0.95)",
          backgroundColor: "rgba(0, 148, 255, 0.12)",
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
              <stop offset="0%" stopColor="#0094FF" />
              <stop offset="100%" stopColor="#01EDB8" />
            </linearGradient>
          </defs>

          <circle cx="140" cy="140" r="98" fill="none" stroke="rgba(148, 163, 184, 0.35)" strokeWidth="16" />

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
                stroke={hour % 3 === 0 ? "rgba(100, 116, 139, 0.65)" : "rgba(148, 163, 184, 0.45)"}
                strokeWidth={hour % 3 === 0 ? 1.8 : 1}
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

          <circle cx={wakeMarker.x} cy={wakeMarker.y} r="6" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
        </svg>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xs font-semibold tracking-[0.14em] text-slate-500 uppercase">Strength Peak</span>
          <span className="mt-1 text-2xl font-semibold text-slate-900">{formatMinutes(peakStartMinutes)}</span>
          <span className="text-xs font-semibold tracking-[0.12em] text-slate-500 uppercase">to {formatMinutes(peakEndMinutes)}</span>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-[0.12em] text-slate-500 uppercase">
          <Zap className="h-4 w-4 text-blue-600" />
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
                    color: "rgba(100, 116, 139, 0.9)",
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
