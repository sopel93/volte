export type DnsProvider = {
  id: string;
  name: string;
  hostname: string;
  note: string;
  blocksAds: boolean;
  query: string;
  headers?: Record<string, string>;
};

export type DnsProbe = {
  id: string;
  name: string;
  hostname: string;
  note: string;
  blocksAds: boolean;
  ms: number;
  ok: boolean;
  path: "direct" | "failed";
};

export const DNS_PROVIDERS: DnsProvider[] = [
  {
    id: "cloudflare",
    name: "Cloudflare",
    hostname: "one.one.one.one",
    note: "Niski narzut, szeroka anycast w PL.",
    blocksAds: false,
    query: "https://cloudflare-dns.com/dns-query?name=www.play.pl&type=A",
    headers: { Accept: "application/dns-json" },
  },
  {
    id: "google",
    name: "Google",
    hostname: "dns.google",
    note: "Stabilny, często blisko wieży operatora.",
    blocksAds: false,
    query: "https://dns.google/resolve?name=www.play.pl&type=A",
  },
  {
    id: "quad9",
    name: "Quad9",
    hostname: "dns.quad9.net",
    note: "Filtr złośliwych domen, bez reklam.",
    blocksAds: false,
    query: "https://dns.quad9.net:5053/dns-query?name=www.play.pl&type=A",
  },
  {
    id: "adguard",
    name: "AdGuard",
    hostname: "dns.adguard-dns.com",
    note: "Tnie reklamy i trackery — mniej danych na LTE/5G.",
    blocksAds: true,
    query: "https://dns.adguard-dns.com/resolve?name=www.play.pl&type=A",
    headers: { Accept: "application/dns-json" },
  },
];

const WARM_DOMAINS = [
  "www.google.com",
  "www.youtube.com",
  "www.facebook.com",
  "www.instagram.com",
  "www.tiktok.com",
  "www.allegro.pl",
  "www.wp.pl",
  "www.onet.pl",
  "www.play.pl",
  "www.netflix.com",
];

async function probeOnce(provider: DnsProvider): Promise<number | null> {
  const start = performance.now();
  try {
    const res = await fetch(provider.query, {
      cache: "no-store",
      headers: provider.headers,
      signal: AbortSignal.timeout(3500),
    });
    const ms = performance.now() - start;
    if (!res.ok) return null;
    // Drain so we don't leave the connection hanging.
    await res.arrayBuffer();
    return ms;
  } catch {
    return null;
  }
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2
    : (sorted[mid] ?? 0);
}

export async function raceDns(
  onEach?: (probe: DnsProbe) => void,
): Promise<DnsProbe[]> {
  const results = await Promise.all(
    DNS_PROVIDERS.map(async (provider) => {
      const times: number[] = [];
      for (let i = 0; i < 2; i++) {
        const ms = await probeOnce(provider);
        if (ms != null) times.push(ms);
      }
      const probe: DnsProbe = {
        id: provider.id,
        name: provider.name,
        hostname: provider.hostname,
        note: provider.note,
        blocksAds: provider.blocksAds,
        ms: times.length ? median(times) : 0,
        ok: times.length > 0,
        path: times.length ? "direct" : "failed",
      };
      onEach?.(probe);
      return probe;
    }),
  );
  return results.sort((a, b) => {
    if (a.ok !== b.ok) return a.ok ? -1 : 1;
    return a.ms - b.ms;
  });
}

export async function warmDomains(
  onEach?: (done: number, total: number, host: string) => void,
): Promise<number> {
  let done = 0;
  await Promise.all(
    WARM_DOMAINS.map(async (host) => {
      const url = `https://cloudflare-dns.com/dns-query?name=${host}&type=A`;
      try {
        await fetch(url, {
          cache: "no-store",
          headers: { Accept: "application/dns-json" },
          signal: AbortSignal.timeout(2500),
        });
      } catch {
        // Warmup is best-effort — a miss is not a failure of the session.
      }
      done += 1;
      onEach?.(done, WARM_DOMAINS.length, host);
    }),
  );
  return done;
}

export function pickWinner(ranking: DnsProbe[]): DnsProbe | null {
  const ok = ranking.filter((r) => r.ok);
  return ok[0] ?? null;
}
