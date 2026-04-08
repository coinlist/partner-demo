"use client";

import { HomeView } from "./HomeView";
import { useHomeViewModel } from "./useHomeViewModel";

export function HomeContainer() {
  const { onEvent } = useHomeViewModel();
  return <HomeView onEvent={onEvent} />;
}
