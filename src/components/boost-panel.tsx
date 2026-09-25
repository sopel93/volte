import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, Circle, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/copy-button";
import { SignalRing } from "@/components/signal-ring";
import { Stat } from "@/components/stat";
import {
  initialBoostSteps,
  runBoostSession,
  type BoostStep,
} from "@/lib/network/boost";
import { formatMbps, formatMs } from "@/lib/network/speed";
import { useVoltStore } from "@/lib/store";
import { cn } from "@/lib/utils";

function StepIcon({ status }: { status: BoostStep["status"] }) {
  if (status === "run") {
    return <LoaderCircle className="size-4 animate-spin text-signal" />;
  }
  if (status === "done") {
    return <Check className="size-4 text-signal" />;
  }
  if (status === "fail") {
    return <Circle className="size-4 text-danger" />;
  }
  return <Circle className="size-4 text-subtle" />;
}

export function BoostPanel() {
  const lastBoost = useVoltStore((s) => s.lastBoost);
  const setBoost = useVoltStore((s) => s.setBoost);
  const setDns = useVoltStore((s) => s.setDns);
  const [running, setRunning] = useState(false);
  const [steps, setSteps] = useState<BoostStep[]>(initialBoostSteps);

  async function start() {
    if (running) return;
    setRunning(true);
    setSteps(initialBoostSteps());
    try {
      const outcome = await runBoostSession(setSteps);
      setDns(outcome.ranking);
      setBoost({
        at: Date.now(),
        pingMs: outcome.pingMs,
        downMbps: outcome.downMbps,
        winnerName: outcome.winner?.name ?? "—",
        winnerHost: outcome.winner?.hostname ?? "",
        winnerMs: outcome.winner?.ms ?? 0,
        estimateLabel: outcome.link.estimateLabel,
      });
    } finally {
      setRunning(false);
    }
  }

  const winnerHost = lastBoost?.winnerHost;

  return (
    <section className="px-5">
      <div className="rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)]">
        <SignalRing
          active={running}
          label={running ? "Sesja" : "Nasłuch"}
        />
        <Button
          type="button"
          variant="primary"
          size="xl"
          className="mt-2 w-full rounded-lg"
          disabled={running}
          onClick={start}
        >
          {running ? "Trwa pomiar…" : lastBoost ? "Ponów sesję" : "Uruchom sesję"}
        </Button>
        <p className="mt-3 text-center text-sm leading-relaxed text-muted">
          Wybudza radio, mierzy RTT, ściga resolvery DNS i rozgrzewa cache.
          Nie steruje pasmem n78 — to robi modem Snapdragon X51.
        </p>
      </div>

      <ol className="mt-4 space-y-0.5 rounded-2xl bg-surface p-2 shadow-[var(--shadow-border)]">
        {steps.map((step) => (
          <li
            key={step.id}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5",
              step.status === "run" && "bg-raised",
            )}
          >
            <StepIcon status={step.status} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-fg">{step.label}</p>
              <p className="truncate font-mono text-[11px] text-subtle">
                {step.detail}
              </p>
            </div>
          </li>
        ))}
      </ol>

      {lastBoost ? (
        <div className="mt-4 rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)]">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-subtle">
            Plan po sesji
          </p>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <Stat label="Opóźnienie" value={formatMs(lastBoost.pingMs)} unit="ms" />
            <Stat label="Próbka" value={formatMbps(lastBoost.downMbps)} unit="Mb/s" />
            <Stat label="DNS" value={formatMs(lastBoost.winnerMs)} unit="ms" />
          </div>
          <p className="mt-4 text-sm text-muted">
            Łącze: {lastBoost.estimateLabel}. Najszybszy DNS z tej wieży:{" "}
            <span className="text-fg">{lastBoost.winnerName}</span>.
          </p>
          {winnerHost ? (
            <div className="mt-4 flex flex-col gap-2">
              <p className="font-mono text-sm text-signal">{winnerHost}</p>
              <CopyButton
                value={winnerHost}
                label="Kopiuj host Prywatnego DNS"
                done="Host DNS skopiowany"
              />
              <Button variant="secondary" asChild>
                <Link to="/tuner">
                  Otwórz tuner Realme
                  <ArrowRight />
                </Link>
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
