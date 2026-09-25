import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Gauge, Radio, Settings2, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { to: "/", label: "Start", icon: Radio },
  { to: "/pomiar", label: "Pomiar", icon: Gauge },
  { to: "/dns", label: "DNS", icon: Shield },
  { to: "/tuner", label: "Tuner", icon: Settings2 },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col bg-bg">
      <div className="flex-1 pb-[calc(5.5rem+env(safe-area-inset-bottom))]">
        {children}
      </div>
      <nav
        className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-lg border-t border-border bg-bg/95 pb-[env(safe-area-inset-bottom)] pr-16 backdrop-blur-md"
        aria-label="Nawigacja"
      >
        <ul className="grid grid-cols-4 px-2 pt-1">
          {TABS.map((tab) => {
            const active =
              tab.to === "/"
                ? pathname === "/"
                : pathname === tab.to || pathname.startsWith(`${tab.to}/`);
            const Icon = tab.icon;
            return (
              <li key={tab.to}>
                <Link
                  to={tab.to}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-md text-[11px] tracking-wide transition-colors duration-150",
                    active ? "text-fg" : "text-subtle hover:text-muted",
                  )}
                >
                  <Icon
                    className={cn("size-5", active && "text-signal")}
                    strokeWidth={active ? 2.2 : 1.8}
                  />
                  {tab.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
