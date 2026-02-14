"use client";

import { useMemo } from "react";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

interface DailyReadinessHeatmapProps {
  hourlyPerformance: number[];
}

function heatColor(value: number) {
  const ratio = Math.max(0, Math.min(1, value / 100));
  const start = { r: 59, g: 130, b: 246 };
  const end = { r: 239, g: 68, b: 68 };
  const r = Math.round(start.r + (end.r - start.r) * ratio);
  const g = Math.round(start.g + (end.g - start.g) * ratio);
  const b = Math.round(start.b + (end.b - start.b) * ratio);
  return `rgba(${r}, ${g}, ${b}, 0.86)`;
}

export function DailyReadinessHeatmap({ hourlyPerformance }: DailyReadinessHeatmapProps) {
  const labels = useMemo(
    () => Array.from({ length: 24 }, (_, hour) => `${String(hour).padStart(2, "0")}`),
    [],
  );

  const data = useMemo(
    () => ({
      labels,
      datasets: [
        {
          data: hourlyPerformance,
          backgroundColor: hourlyPerformance.map((value) => heatColor(value)),
          borderRadius: 3,
          borderSkipped: false,
          barPercentage: 1,
          categoryPercentage: 1,
        },
      ],
    }),
    [hourlyPerformance, labels],
  );

  return (
    <div className="space-y-3">
      <div className="h-34 md:h-40">
        <Bar
          data={data}
          options={{
            maintainAspectRatio: false,
            animation: {
              duration: 500,
            },
            plugins: {
              legend: {
                display: false,
              },
              tooltip: {
                callbacks: {
                  title: (items) => {
                    const value = items[0]?.label;
                    return `${value}:00`;
                  },
                  label: (context) => `Performance window: ${context.parsed.y}%`,
                },
              },
            },
            scales: {
              x: {
                ticks: {
                  color: "rgba(148,163,184,0.78)",
                  maxTicksLimit: 8,
                },
                grid: {
                  display: false,
                },
                border: {
                  display: false,
                },
              },
              y: {
                min: 0,
                max: 100,
                ticks: {
                  display: false,
                },
                grid: {
                  display: false,
                },
                border: {
                  display: false,
                },
              },
            },
          }}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-slate-300">
        <span className="tracking-[0.14em] uppercase">Cool / Recovered</span>
        <div className="h-2 w-32 rounded-full bg-gradient-to-r from-blue-500 via-amber-400 to-red-500" />
        <span className="tracking-[0.14em] uppercase">Hot / Fatigue</span>
      </div>
    </div>
  );
}
