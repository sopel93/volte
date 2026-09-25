import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  parseDeviceFromUa,
  snapshotLink,
  subscribeLink,
  type LinkSnapshot,
} from "@/lib/network/connection";
import { DEVICE } from "@/lib/network/realme";

export function LinkLive() {
  const [link, setLink] = useState<LinkSnapshot | null>(null);
  const [deviceLabel, setDeviceLabel] = useState(DEVICE.models);

  useEffect(() => {
    const sync = () => setLink(snapshotLink());
    sync();
    const device = parseDeviceFromUa();
    setDeviceLabel(
      device.isRealme9Pro
        ? DEVICE.name
        : device.isRealme
          ? "realme · profil 9 Pro 5G"
          : DEVICE.models,
    );
    return subscribeLink(sync);
  }, []);

  const tone =
    !link || !link.online
      ? "neutral"
      : link.estimate === "5g" || link.estimate === "wifi"
        ? "signal"
        : link.estimate === "slow"
          ? "warn"
          : "neutral";

  return (
    <div className="flex flex-wrap items-center gap-2 px-5">
      <Badge tone={link && !link.online ? "danger" : tone}>
        <span className="size-1.5 rounded-full bg-current" />
        {link ? (link.online ? link.estimateLabel : "Offline") : "Łącze"}
      </Badge>
      <Badge>{deviceLabel}</Badge>
      {link?.saveData ? <Badge tone="warn">Oszczędzanie danych</Badge> : null}
    </div>
  );
}
