export type LinkKind = "wifi" | "cellular" | "ethernet" | "unknown";
export type EffectiveType = "slow-2g" | "2g" | "3g" | "4g" | "unknown";

export type LinkSnapshot = {
  online: boolean;
  kind: LinkKind;
  effective: EffectiveType;
  downlinkMbps: number | null;
  rttMs: number | null;
  saveData: boolean;
  estimate: "5g" | "4g" | "3g" | "slow" | "wifi" | "offline" | "unknown";
  estimateLabel: string;
};

type NetworkInformationLike = {
  type?: string;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
  addEventListener?: (type: string, listener: () => void) => void;
  removeEventListener?: (type: string, listener: () => void) => void;
};

function readConnection(): NetworkInformationLike | null {
  if (typeof navigator === "undefined") return null;
  const nav = navigator as Navigator & {
    connection?: NetworkInformationLike;
    mozConnection?: NetworkInformationLike;
    webkitConnection?: NetworkInformationLike;
  };
  return nav.connection ?? nav.mozConnection ?? nav.webkitConnection ?? null;
}

function mapKind(type: string | undefined): LinkKind {
  if (type === "wifi") return "wifi";
  if (type === "cellular") return "cellular";
  if (type === "ethernet") return "ethernet";
  return "unknown";
}

function mapEffective(value: string | undefined): EffectiveType {
  if (value === "slow-2g" || value === "2g" || value === "3g" || value === "4g") {
    return value;
  }
  return "unknown";
}

function estimateLink(snapshot: Omit<LinkSnapshot, "estimate" | "estimateLabel">): {
  estimate: LinkSnapshot["estimate"];
  estimateLabel: string;
} {
  if (!snapshot.online) {
    return { estimate: "offline", estimateLabel: "Brak sieci" };
  }
  if (snapshot.kind === "wifi") {
    return { estimate: "wifi", estimateLabel: "Wi-Fi" };
  }
  if (snapshot.kind === "ethernet") {
    return { estimate: "wifi", estimateLabel: "Ethernet" };
  }

  const down = snapshot.downlinkMbps ?? 0;
  const rtt = snapshot.rttMs ?? 999;
  if (snapshot.kind === "cellular" || snapshot.effective !== "unknown") {
    if (snapshot.effective === "slow-2g" || snapshot.effective === "2g") {
      return { estimate: "slow", estimateLabel: "2G / EDGE" };
    }
    if (snapshot.effective === "3g" && down < 8) {
      return { estimate: "3g", estimateLabel: "3G / HSPA" };
    }
    // Chrome rarely reports 5G as its own type. High downlink + low RTT on
    // cellular is the honest proxy — labelled as an estimate, not a lock.
    if (down >= 50 && rtt <= 40) {
      return { estimate: "5g", estimateLabel: "Szacunek 5G" };
    }
    if (snapshot.effective === "4g" || down >= 8) {
      return { estimate: "4g", estimateLabel: "LTE / 4G" };
    }
    if (snapshot.effective === "3g") {
      return { estimate: "3g", estimateLabel: "3G / HSPA" };
    }
  }

  return { estimate: "unknown", estimateLabel: "Łącze aktywne" };
}

export function snapshotLink(): LinkSnapshot {
  const online = typeof navigator === "undefined" ? true : navigator.onLine;
  const conn = readConnection();
  const base: Omit<LinkSnapshot, "estimate" | "estimateLabel"> = {
    online,
    kind: mapKind(conn?.type),
    effective: mapEffective(conn?.effectiveType),
    downlinkMbps: typeof conn?.downlink === "number" ? conn.downlink : null,
    rttMs: typeof conn?.rtt === "number" ? conn.rtt : null,
    saveData: Boolean(conn?.saveData),
  };
  const { estimate, estimateLabel } = estimateLink(base);
  return { ...base, estimate, estimateLabel };
}

export function subscribeLink(listener: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const conn = readConnection();
  window.addEventListener("online", listener);
  window.addEventListener("offline", listener);
  conn?.addEventListener?.("change", listener);
  return () => {
    window.removeEventListener("online", listener);
    window.removeEventListener("offline", listener);
    conn?.removeEventListener?.("change", listener);
  };
}

export function parseDeviceFromUa(ua = typeof navigator === "undefined" ? "" : navigator.userAgent) {
  const isRealme9Pro =
    /RMX3471|RMX3472|RMX3474/i.test(ua) ||
    (/realme/i.test(ua) && /9\s*pro/i.test(ua));
  const isRealme = /realme|RMX\d{4}/i.test(ua);
  const isAndroid = /Android/i.test(ua);
  return { isRealme9Pro, isRealme, isAndroid, ua };
}

export function readNextHopProtocol(): string | null {
  if (typeof performance === "undefined") return null;
  const entries = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
  for (let i = entries.length - 1; i >= 0; i--) {
    const proto = entries[i]?.nextHopProtocol;
    if (proto) return proto;
  }
  return null;
}

export function protocolLabel(proto: string | null): string {
  if (!proto) return "—";
  if (proto === "h3" || proto === "http/3") return "HTTP/3 · QUIC";
  if (proto === "h2" || proto === "http/2") return "HTTP/2";
  if (proto.startsWith("http/1")) return "HTTP/1.1";
  return proto;
}
