import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/copy-button";
import { PageHeader } from "@/components/page-header";
import { pickWinner, raceDns, type DnsProbe } from "@/lib/network/dns";
import { formatMs } from "@/lib/network/speed";
import { useVoltStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dns")({ component: DnsPage });

function DnsPage() {
  const ranking = useVoltStore((s) => s.lastDns);
  const setDns = useVoltStore((s) => s.setDns);
  const [running, setRunning] = useState(false);
  const [live, setLive] = useState<DnsProbe[]>(ranking);
  const winner = pickWinner(live);

  async function run() {
    if (running) return;
    setRunning(true);
    setLive([]);
    try {
      const next = await raceDns((probe) => {
        setLive((prev) => {
          const rest = prev.filter((p) => p.id !== probe.id);
          return [...rest, probe].sort((a, b) => {
            if (a.ok !== b.ok) return a.ok ? -1 : 1;
            return a.ms - b.ms;
          });
        });
      });
      setDns(next);
      setLive(next);
    } finally {
      setRunning(false);
    }
  }

  return (
    <main>
      <PageHeader kicker="Resolver" title="Wyścig DNS">
        Pomiar DNS-over-HTTPS z Twojej wieży, nie z serwera aplikacji. Android
        9+ przyjmie zwycięzcę jako Prywatny DNS — to jedyna zmiana DNS bez
        roota, której modem przestrzega.
      </PageHeader>

      <section className="px-5">
        <Button
          type="button"
          size="xl"
          className="w-full rounded-lg"
          disabled={running}
          onClick={run}
        >
          {running ? "Ścigam resolvery…" : "Uruchom wyścig"}
        </Button>

        {winner ? (
          <div className="mt-4 rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)]">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-subtle">
              Zwycięzca z tej wieży
            </p>
            <p className="mt-2 text-xl font-medium tracking-tight">{winner.name}</p>
            <p className="mt-1 font-mono text-sm text-signal">{winner.hostname}</p>
            <p className="mt-2 text-sm text-muted">{winner.note}</p>
            <div className="mt-4 flex flex-col gap-2">
              <CopyButton
                value={winner.hostname}
                label="Kopiuj nazwę hosta"
                done="Host skopiowany"
              />
              <Button variant="secondary" asChild>
                <Link to="/tuner">
                  Ścieżka w ustawieniach Realme
                  <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>
        ) : null}

        <ul className="mt-4 space-y-2">
          {live.map((row, index) => (
            <li
              key={row.id}
              className={cn(
                "rounded-2xl bg-surface px-4 py-3 shadow-[var(--shadow-border)]",
                index === 0 && row.ok && "ring-1 ring-signal/40",
              )}
            >
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-sm font-medium">{row.name}</p>
                <p className="font-mono text-sm tabular-nums text-fg">
                  {row.ok ? `${formatMs(row.ms)} ms` : "brak"}
                </p>
              </div>
              <p className="mt-1 font-mono text-[11px] text-subtle">{row.hostname}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {row.blocksAds ? <Badge tone="signal">mniej reklam = mniej danych</Badge> : null}
                {index === 0 && row.ok ? <Badge tone="signal">najszybszy</Badge> : null}
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-6 text-xs leading-relaxed text-subtle">
          AdGuard wygra na oszczędności transferu, Cloudflare zwykle na czystym
          RTT. Wklejasz host do: Ustawienia → Hasło i bezpieczeństwo → Prywatny
          DNS → Nazwa hosta dostawcy.
        </p>
      </section>
    </main>
  );
}
