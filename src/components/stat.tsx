import { cn } from "@/lib/utils";

export function Stat({
  label,
  value,
  unit,
  hint,
  className,
}: {
  label: string;
  value: string;
  unit?: string;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-subtle">
        {label}
      </p>
      <p className="mt-1 flex items-baseline gap-1 font-mono text-2xl font-medium tabular-nums tracking-tight text-fg">
        <span>{value}</span>
        {unit ? (
          <span className="text-xs font-sans font-medium text-muted">{unit}</span>
        ) : null}
      </p>
      {hint ? <p className="mt-1 text-xs text-subtle">{hint}</p> : null}
    </div>
  );
}
