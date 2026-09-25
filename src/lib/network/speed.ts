export type PingSample = {
  ms: number;
  ok: boolean;
};

export type ThroughputResult = {
  mbps: number;
  bytes: number;
  ms: number;
  ok: boolean;
};

export type SpeedReport = {
  pingMs: number;
  jitterMs: number;
  downMbps: number;
  upMbps: number;
  protocol: string | null;
  samples: PingSample[];
};

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2
    : (sorted[mid] ?? 0);
}

async function timedFetch(url: string, init: RequestInit = {}, timeoutMs = 6000): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, { cache: "no-store", ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function drain(res: Response) {
  try {
    await res.arrayBuffer();
  } catch {
    // Body may already be cancelled after abort.
  }
}

export async function measurePing(rounds = 5): Promise<{
  pingMs: number;
  jitterMs: number;
  samples: PingSample[];
}> {
  const samples: PingSample[] = [];
  for (let i = 0; i < rounds; i++) {
    const start = performance.now();
    try {
      const res = await timedFetch(`/api/speed/ping?n=${i}&t=${Date.now()}`, {}, 4000);
      const ms = performance.now() - start;
      await drain(res);
      samples.push({ ms, ok: res.ok });
    } catch {
      samples.push({ ms: 0, ok: false });
    }
  }
  const good = samples.filter((s) => s.ok).map((s) => s.ms);
  // First sample includes DNS + TLS + RRC wakeup. Drop it when we have enough.
  const steady = good.length >= 3 ? good.slice(1) : good;
  const pingMs = median(steady);
  const deviations = steady.map((v) => Math.abs(v - pingMs));
  return { pingMs, jitterMs: median(deviations), samples };
}

async function readBody(
  res: Response,
  onBytes?: (received: number) => void,
): Promise<number> {
  if (!res.body) {
    const buf = await res.arrayBuffer();
    onBytes?.(buf.byteLength);
    return buf.byteLength;
  }
  const reader = res.body.getReader();
  let received = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    received += value.byteLength;
    onBytes?.(received);
  }
  return received;
}

export async function measureDownload(
  bytes: number,
  onProgress?: (received: number, mbps: number) => void,
): Promise<ThroughputResult> {
  const start = performance.now();
  try {
    const res = await timedFetch(`/api/speed/down?bytes=${bytes}&t=${Date.now()}`, {}, 15000);
    if (!res.ok) return { mbps: 0, bytes: 0, ms: 0, ok: false };
    const received = await readBody(res, (got) => {
      const elapsed = (performance.now() - start) / 1000;
      const mbps = elapsed > 0 ? (got * 8) / elapsed / 1e6 : 0;
      onProgress?.(got, mbps);
    });
    const ms = performance.now() - start;
    const mbps = ms > 0 ? (received * 8) / (ms / 1000) / 1e6 : 0;
    return { mbps, bytes: received, ms, ok: received > 0 };
  } catch {
    return { mbps: 0, bytes: 0, ms: 0, ok: false };
  }
}

function randomPayload(bytes: number): Blob {
  const buffer = new ArrayBuffer(bytes);
  const payload = new Uint8Array(buffer);
  const chunk = 65536;
  for (let offset = 0; offset < bytes; offset += chunk) {
    crypto.getRandomValues(payload.subarray(offset, Math.min(offset + chunk, bytes)));
  }
  return new Blob([buffer], { type: "application/octet-stream" });
}

export async function measureUpload(
  bytes: number,
  onProgress?: (sent: number, mbps: number) => void,
): Promise<ThroughputResult> {
  const payload = randomPayload(bytes);
  const start = performance.now();
  onProgress?.(0, 0);
  try {
    const res = await timedFetch(
      `/api/speed/up?t=${Date.now()}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/octet-stream" },
        body: payload,
      },
      15000,
    );
    const ms = performance.now() - start;
    if (!res.ok) return { mbps: 0, bytes: 0, ms, ok: false };
    const json = (await res.json()) as { bytes?: number };
    const sent = json.bytes ?? payload.size;
    const mbps = ms > 0 ? (sent * 8) / (ms / 1000) / 1e6 : 0;
    onProgress?.(sent, mbps);
    return { mbps, bytes: sent, ms, ok: true };
  } catch {
    return { mbps: 0, bytes: 0, ms: 0, ok: false };
  }
}

export function payloadForLink(kind: "probe" | "full", downlinkMbps: number | null): {
  down: number;
  up: number;
} {
  const hint = downlinkMbps ?? 20;
  if (kind === "probe") {
    return { down: hint < 8 ? 256_000 : 750_000, up: 180_000 };
  }
  if (hint < 4) return { down: 400_000, up: 200_000 };
  if (hint < 20) return { down: 1_500_000, up: 400_000 };
  return { down: 4_000_000, up: 1_000_000 };
}

export function formatMbps(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "—";
  if (value < 10) return value.toFixed(1);
  return Math.round(value).toString();
}

export function formatMs(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "—";
  if (value < 10) return value.toFixed(1);
  return Math.round(value).toString();
}
