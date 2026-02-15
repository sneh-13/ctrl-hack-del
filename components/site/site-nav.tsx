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
        "flex items-center justify-between rounded-2xl border border-slate-200 bg-white/92 px-4 py-3 shadow-sm backdrop-blur md:px-6",
        className,
      )}
    >
      <Link href="/" className="font-display text-xl tracking-[-0.02em] text-slate-900">
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
                "rounded-lg border px-3 py-1.5 text-xs font-medium tracking-[0.02em] transition-colors md:text-sm",
                active
                  ? "border-blue-200 bg-blue-50 text-blue-700"
                  : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-900",
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
