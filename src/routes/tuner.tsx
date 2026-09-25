import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/copy-button";
import { PageHeader } from "@/components/page-header";
import { APN_PROFILES, formatApn } from "@/lib/network/carriers";
import { DEVICE, POLAND_5G, TUNER_STEPS } from "@/lib/network/realme";
import { useVoltStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tuner")({ component: TunerPage });

function TunerPage() {
  const done = useVoltStore((s) => s.tunerDone);
  const toggle = useVoltStore((s) => s.toggleTuner);
  const lastBoost = useVoltStore((s) => s.lastBoost);
  const [apnId, setApnId] = useState(APN_PROFILES[0]?.id ?? "play");
  const apn = APN_PROFILES.find((p) => p.id === apnId) ?? APN_PROFILES[0];
  const finished = TUNER_STEPS.filter((s) => done[s.id]).length;

  return (
    <main>
      <PageHeader kicker="Snapdragon 695 · X51" title="Tuner Realme">
        {DEVICE.name} ({DEVICE.models}). Pasma 5G w PL: {DEVICE.polandBands.join(", ")}.
        Aplikacja nie zmienia radia — te przełączniki są w systemie i na tym
        modelu robią różnicę.
      </PageHeader>

      <section className="px-5">
        {lastBoost?.winnerHost ? (
          <div className="mb-4 rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)]">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-subtle">
              Host z ostatniej sesji
            </p>
            <p className="mt-2 font-mono text-sm text-signal">{lastBoost.winnerHost}</p>
            <CopyButton
              className="mt-3 w-full"
              value={lastBoost.winnerHost}
              label="Kopiuj do Prywatnego DNS"
            />
          </div>
        ) : null}

        <p className="mb-3 text-xs text-subtle">
          {finished}/{TUNER_STEPS.length} ustawień odhaczone
        </p>
        <ul className="space-y-2">
          {TUNER_STEPS.map((step) => {
            const on = Boolean(done[step.id]);
            return (
              <li key={step.id} className="rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)]">
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggle(step.id)}
                    className={cn(
                      "mt-0.5 grid size-11 shrink-0 place-items-center rounded-lg transition-colors duration-150 [&_svg]:pointer-events-none",
                      on ? "bg-signal text-accent-fg" : "bg-raised text-muted shadow-[var(--shadow-border)]",
                    )}
                  >
                    <Check className="size-5" />
                    <span className="sr-only">Oznacz jako zrobione</span>
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-sm font-medium text-fg">{step.title}</h2>
                      <Badge>{step.action}</Badge>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{step.why}</p>
                    <p className="mt-2 font-mono text-[11px] leading-relaxed text-subtle">
                      {step.path}
                    </p>
                    {step.altPath ? (
                      <p className="mt-1 font-mono text-[11px] leading-relaxed text-subtle">
                        albo: {step.altPath}
                      </p>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-8 px-5">
        <h2 className="text-lg font-medium tracking-tight">APN operatora</h2>
        <p className="mt-1 text-sm text-muted">
          Ustawienia → Karta SIM i dane komórkowe → [SIM] → Nazwy punktów dostępu.
          Protokół zawsze IPv4/IPv6.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {APN_PROFILES.map((profile) => (
            <Button
              key={profile.id}
              type="button"
              size="md"
              variant={profile.id === apnId ? "primary" : "secondary"}
              onClick={() => setApnId(profile.id)}
            >
              {profile.operator}
            </Button>
          ))}
        </div>
        {apn ? (
          <div className="mt-4 rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)]">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 font-mono text-xs">
              <div>
                <dt className="text-subtle">APN</dt>
                <dd className="mt-0.5 text-fg">{apn.apn}</dd>
              </div>
              <div>
                <dt className="text-subtle">MCC / MNC</dt>
                <dd className="mt-0.5 text-fg">
                  {apn.mcc} / {apn.mnc}
                </dd>
              </div>
              <div>
                <dt className="text-subtle">Użytkownik</dt>
                <dd className="mt-0.5 text-fg">{apn.user || "—"}</dd>
              </div>
              <div>
                <dt className="text-subtle">Hasło</dt>
                <dd className="mt-0.5 text-fg">{apn.password || "—"}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-subtle">Typ · protokół</dt>
                <dd className="mt-0.5 text-fg">
                  {apn.type} · {apn.protocol}
                </dd>
              </div>
            </dl>
            <p className="mt-3 text-sm text-muted">{apn.note}</p>
            <CopyButton className="mt-4 w-full" value={formatApn(apn)} label="Kopiuj profil APN" />
          </div>
        ) : null}
      </section>

      <section className="mt-8 px-5 pb-6">
        <h2 className="text-lg font-medium tracking-tight">5G w Polsce × 9 Pro</h2>
        <ul className="mt-3 space-y-2">
          {POLAND_5G.map((row) => (
            <li key={row.operator} className="rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)]">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-sm font-medium">{row.operator}</p>
                <p className="font-mono text-[11px] text-signal">{row.nr}</p>
              </div>
              <p className="mt-2 text-sm text-muted">{row.note}</p>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs leading-relaxed text-subtle">
          Modem X51 w 9 Pro obsługuje n78 (3,5–3,7 GHz) — główne pasmo 5G w
          Polsce — oraz n1/n3/n28 jako kotwicę LTE w NSA. Żadna aplikacja ze
          sklepu nie podbija Tput radia. VOLT podaje zmiany, które system
          naprawdę honoruje.
        </p>
      </section>
    </main>
  );
}
