import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DnsProbe } from "@/lib/network/dns";

export type SpeedRecord = {
  at: number;
  pingMs: number;
  jitterMs: number;
  downMbps: number;
  upMbps: number;
  protocol: string | null;
};

export type BoostRecord = {
  at: number;
  pingMs: number;
  downMbps: number;
  winnerName: string;
  winnerHost: string;
  winnerMs: number;
  estimateLabel: string;
};

type AppState = {
  tunerDone: Record<string, boolean>;
  lastBoost: BoostRecord | null;
  lastDns: DnsProbe[];
  speedHistory: SpeedRecord[];
  toggleTuner: (id: string) => void;
  setBoost: (record: BoostRecord) => void;
  setDns: (ranking: DnsProbe[]) => void;
  addSpeed: (record: SpeedRecord) => void;
};

export const useVoltStore = create<AppState>()(
  persist(
    (set) => ({
      tunerDone: {},
      lastBoost: null,
      lastDns: [],
      speedHistory: [],
      toggleTuner: (id) =>
        set((state) => ({
          tunerDone: { ...state.tunerDone, [id]: !state.tunerDone[id] },
        })),
      setBoost: (record) => set({ lastBoost: record }),
      setDns: (ranking) => set({ lastDns: ranking }),
      addSpeed: (record) =>
        set((state) => ({
          speedHistory: [record, ...state.speedHistory].slice(0, 8),
        })),
    }),
    { name: "volt-realme-9pro" },
  ),
);
