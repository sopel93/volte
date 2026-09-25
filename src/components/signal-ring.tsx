import { cn } from "@/lib/utils";

export function SignalRing({
  active,
  label,
}: {
  active: boolean;
  label: string;
}) {
  return (
    <div className="relative mx-auto grid size-52 place-items-center">
      <span
        className={cn(
          "pointer-events-none absolute inset-0 rounded-full border border-signal/25",
          active && "animate-[volt-pulse_2.8s_var(--ease-out)_infinite]",
        )}
      />
      <span
        className={cn(
          "pointer-events-none absolute inset-5 rounded-full border border-signal/40",
          active && "animate-[volt-pulse_2.8s_var(--ease-out)_infinite_0.2s]",
        )}
      />
      <span
        className={cn(
          "pointer-events-none absolute inset-10 rounded-full border border-border-strong bg-raised",
          active && "bg-signal-dim",
        )}
      />
      <span className="relative z-10 font-mono text-xs uppercase tracking-[0.22em] text-muted">
        {label}
      </span>
    </div>
  );
}
