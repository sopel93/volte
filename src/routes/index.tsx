import { createFileRoute } from "@tanstack/react-router";
import { BoostPanel } from "@/components/boost-panel";
import { LinkLive } from "@/components/link-live";
import { PageHeader } from "@/components/page-header";
import { DEVICE } from "@/lib/network/realme";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <main>
      <PageHeader kicker="VOLT · tuner komórkowy" title="realme 9 Pro 5G">
        {DEVICE.chipset} · modem {DEVICE.modem} · {DEVICE.nr}. Sesja mierzy
        Twoje łącze i wskazuje DNS oraz ustawienia, które na tym modelu
        naprawdę skracają czas ładowania.
      </PageHeader>
      <LinkLive />
      <div className="mt-5">
        <BoostPanel />
      </div>
    </main>
  );
}
