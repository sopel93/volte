import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { Stat } from "@/components/stat";
import { snapshotLink, readNextHopProtocol, protocolLabel } from "@/lib/network/connection";
import {
  formatMbps,
  formatMs,
  measureDownload,
  measurePing,
  measureUpload,
  payloadForLink,
} from "@/lib/network/speed";
import { useVoltStore } from "@/lib/store";

export const Route = createFileRoute("/pomiar")({ component: SpeedPage });

function SpeedPage() {
  const history = useVoltStore((s) => s.speedHistory);
  const addSpeed = useVoltStore((s) => s.addSpeed);
  const [running, setRunning] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState("Gotowe do pomiaru");
  const [liveDown, setLiveDown] = useState(0);
  const [liveUp, setLiveUp] = useState(0);
  const latest = history[0];

  useEffect(() => {
    setMounted(true);
  }, []);

  async function run() {
    if (running) return;
    setRunning(true);
    setLiveDown(0);
    setLiveUp(0);
    try {
      const link = snapshotLink();
      const payload = payloadForLink("full", link.downlinkMbps);

      setPhase("Wybudzenie radia");
      await measurePing(1);

      setPhase("Opóźnienie");
      const ping = await measurePing(6);

      setPhase("Pobieranie");
      const down = await measureDownload(payload.down, (_b, mbps) => {
        setLiveDown(mbps);
      });

      setPhase("Wysyłanie");
      const up = await measureUpload(payload.up, (_b, mbps) => {
        setLiveUp(mbps);
      });

      addSpeed({
        at: Date.now(),
        pingMs: ping.pingMs,
        jitterMs: ping.jitterMs,
        downMbps: down.mbps,
        upMbps: up.mbps,
        protocol: readNextHopProtocol(),
      });
      setPhase("Zakończono");
    } finally {
      setRunning(false);
    }
  }

  const chart = useMemo(
    () =>
      [...history].reverse().map((row, i) => ({
        i: i + 1,
        down: Number(row.downMbps.toFixed(1)),
        up: Number(row.upMbps.toFixed(1)),
      })),
    [history],
  );

  return (
    <main>
      <PageHeader kicker="Laboratorium" title="Pomiar łącza">
        Pobieranie i wysyłanie idą przez ten sam serwer — bez CDN operatora,
        więc wynik jest porównywalny między sesjami. Pierwsze pakiety po
        uśpieniu radia są odrzucane.
      </PageHeader>

      <section className="px-5">
        <div className="rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)]">
          <div className="grid grid-cols-3 gap-3">
            <Stat
              label="Pobieranie"
              value={formatMbps(running ? liveDown : (latest?.downMbps ?? 0))}
              unit="Mb/s"
            />
            <Stat
              label="Wysyłanie"
              value={formatMbps(running ? liveUp : (latest?.upMbps ?? 0))}
              unit="Mb/s"
            />
            <Stat
              label="Ping"
              value={formatMs(latest?.pingMs ?? 0)}
              unit="ms"
              hint={
                latest
                  ? `jitter ${formatMs(latest.jitterMs)} · ${protocolLabel(latest.protocol)}`
                  : undefined
              }
            />
          </div>
          <Button
            type="button"
            size="xl"
            className="mt-5 w-full rounded-lg"
            disabled={running}
            onClick={run}
          >
            {running ? phase : "Uruchom test"}
          </Button>
          <p className="mt-3 text-xs text-subtle">{phase}</p>
        </div>

        {mounted && chart.length > 1 ? (
          <div className="mt-4 rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)]">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-subtle">
              Historia
            </p>
            <div className="mt-3 h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chart} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(244,244,245,0.06)" vertical={false} />
                  <XAxis dataKey="i" tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "#18181c",
                      border: "1px solid rgba(244,244,245,0.1)",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                    labelFormatter={(v) => `Pomiar ${v}`}
                  />
                  <Line type="monotone" dataKey="down" name="↓ Mb/s" stroke="#5eead4" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="up" name="↑ Mb/s" stroke="#e4e4e7" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}
