"use client";

import { HomeView } from "./HomeView";
import { useHomeViewModel } from "./useHomeViewModel";

export function HomeContainer() {
  const { state, onEvent } = useHomeViewModel();
  return <HomeView state={state} onEvent={onEvent} />;
}
