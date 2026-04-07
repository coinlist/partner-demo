"use client";

import { OffersGrid } from "@coinlist-co/react/client/components";
import { warn } from "console";

export function HomeView() {
  return (
    <div className="flex flex-col items-center gap-4">
      <OffersGrid />
    </div>
  );
}
