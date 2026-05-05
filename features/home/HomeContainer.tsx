"use client";

import { Offer } from "@coinlist-co/react/shared";
import { HomeView } from "./HomeView";
import { useHomeViewModel } from "./useHomeViewModel";

export interface Props {
  offers: Offer[] | undefined;
}

export function HomeContainer({ offers }: Props) {
  const { state, onEvent } = useHomeViewModel(offers);
  return <HomeView state={state} onEvent={onEvent} />;
}
