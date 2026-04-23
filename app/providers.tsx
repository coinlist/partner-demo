"use client";

import { requiredEnv } from "@/lib/env";
import { DemoCoinListProvider } from "@/lib/providers/CoinListProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return <DemoCoinListProvider>{children}</DemoCoinListProvider>;
}
