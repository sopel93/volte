import { snapshotLink, type LinkSnapshot } from "@/lib/network/connection";
import {
  pickWinner,
  raceDns,
  warmDomains,
  type DnsProbe,
} from "@/lib/network/dns";
import {
  measureDownload,
  measurePing,
  payloadForLink,
} from "@/lib/network/speed";

export type BoostStep = {
  id: string;
  label: string;
  detail: string;
  status: "wait" | "run" | "done" | "fail";
};

export type BoostOutcome = {
  link: LinkSnapshot;
  pingMs: number;
  jitterMs: number;
  downMbps: number;
  ranking: DnsProbe[];
  winner: DnsProbe | null;
  warmed: number;
};

const INITIAL: BoostStep[] = [
  { id: "wake", label: "Wybudzenie radia", detail: "RRC idle → connected", status: "wait" },
  { id: "ping", label: "Opóźnienie", detail: "Mediana RTT", status: "wait" },
  { id: "dns", label: "Wyścig DNS", detail: "DoH z tej wieży", status: "wait" },
  { id: "warm", label: "Rozgrzewka domen", detail: "Cache dla 10 serwisów", status: "wait" },
  { id: "down", label: "Próbka łącza", detail: "Pobranie testowe", status: "wait" },
];

export function initialBoostSteps(): BoostStep[] {
  return INITIAL.map((step) => ({ ...step }));
}

function patch(
  steps: BoostStep[],
  id: string,
  patchValue: Partial<BoostStep>,
): BoostStep[] {
  return steps.map((step) => (step.id === id ? { ...step, ...patchValue } : step));
}

export async function runBoostSession(
  onSteps: (steps: BoostStep[]) => void,
): Promise<BoostOutcome> {
  let steps = initialBoostSteps();
  const emit = (next: BoostStep[]) => {
    steps = next;
    onSteps(steps);
  };

  emit(patch(steps, "wake", { status: "run" }));
  const link = snapshotLink();
  // First packet after RRC idle is slow on LTE/5G. Throw it away, then wait
  // a beat so the modem stays in connected state for the real samples.
  await measurePing(1);
  await new Promise((r) => setTimeout(r, 280));
  emit(
    patch(steps, "wake", {
      status: "done",
      detail: link.estimateLabel,
    }),
  );

  emit(patch(steps, "ping", { status: "run" }));
  const ping = await measurePing(5);
  emit(
    patch(steps, "ping", {
      status: ping.pingMs > 0 ? "done" : "fail",
      detail:
        ping.pingMs > 0
          ? `${Math.round(ping.pingMs)} ms · jitter ${Math.round(ping.jitterMs)} ms`
          : "Brak odpowiedzi",
    }),
  );

  emit(patch(steps, "dns", { status: "run" }));
  const ranking = await raceDns();
  const winner = pickWinner(ranking);
  emit(
    patch(steps, "dns", {
      status: winner ? "done" : "fail",
      detail: winner
        ? `${winner.name} · ${Math.round(winner.ms)} ms`
        : "Żaden resolver nie odpowiedział",
    }),
  );

  emit(patch(steps, "warm", { status: "run" }));
  const warmed = await warmDomains((done, total) => {
    emit(patch(steps, "warm", { status: "run", detail: `${done}/${total}` }));
  });
  emit(patch(steps, "warm", { status: "done", detail: `${warmed} domen` }));

  emit(patch(steps, "down", { status: "run" }));
  const payload = payloadForLink("probe", link.downlinkMbps);
  const down = await measureDownload(payload.down);
  emit(
    patch(steps, "down", {
      status: down.ok ? "done" : "fail",
      detail: down.ok ? `${down.mbps.toFixed(1)} Mb/s` : "Pomiar nieudany",
    }),
  );

  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate([18, 40, 18]);
  }

  return {
    link,
    pingMs: ping.pingMs,
    jitterMs: ping.jitterMs,
    downMbps: down.mbps,
    ranking,
    winner,
    warmed,
  };
}
