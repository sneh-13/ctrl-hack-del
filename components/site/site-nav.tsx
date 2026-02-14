import Link from "next/link";

import { cn } from "@/lib/utils";

interface SiteNavProps {
  current: "home" | "dashboard" | "about";
  className?: string;
}

const items: Array<{ key: SiteNavProps["current"]; href: string; label: string }> = [
  { key: "home", href: "/", label: "Home" },
  { key: "dashboard", href: "/dashboard", label: "Dashboard" },
  { key: "about", href: "/about", label: "About Us" },
];

export function SiteNav({ current, className }: SiteNavProps) {
  return (
    <nav
      className={cn(
        "flex items-center justify-between rounded-2xl border border-cyan-300/20 bg-slate-950/72 px-4 py-3 backdrop-blur md:px-6",
        className,
      )}
    >
      <Link href="/" className="font-display text-xl tracking-[0.2em] text-cyan-100 uppercase">
        Aura
      </Link>

      <div className="flex items-center gap-2">
        {items.map((item) => {
          const active = item.key === current;
          return (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs tracking-[0.15em] uppercase transition-colors md:text-sm",
                active
                  ? "border-cyan-300/55 bg-cyan-400/15 text-cyan-100"
                  : "border-white/10 text-slate-300 hover:border-cyan-300/35 hover:text-cyan-100",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
