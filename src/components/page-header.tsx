import type { ReactNode } from "react";

export function PageHeader({
  kicker,
  title,
  children,
}: {
  kicker?: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <header className="px-5 pt-[calc(1.25rem+env(safe-area-inset-top))] pb-4">
      {kicker ? (
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-subtle">
          {kicker}
        </p>
      ) : null}
      <h1 className="mt-2 font-sans text-3xl font-medium tracking-tight text-fg">
        {title}
      </h1>
      {children ? (
        <div className="mt-3 text-sm leading-relaxed text-muted">{children}</div>
      ) : null}
    </header>
  );
}
