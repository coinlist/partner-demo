"use client";

import { ROUTES } from "@/lib/routes";
import { Offer } from "@coinlist-co/react";
import { useRouter } from "next/navigation";

export type HomeUiState = {};

export type HomeUiEvent =
  | {
      type: "ON_SETTINGS_CLICK";
    }
  | {
      type: "ON_OFFER_CLICK";
      offer: Offer;
    };

export function useHomeViewModel(): {
  state: HomeUiState;
  onEvent: (event: HomeUiEvent) => void;
} {
  const router = useRouter();

  const state: HomeUiState = {};

  const onEvent = (event: HomeUiEvent) => {
    switch (event.type) {
      case "ON_SETTINGS_CLICK":
        router.push(ROUTES.SETTINGS);
        break;
      case "ON_OFFER_CLICK":
        router.push(ROUTES.OFFER_DETAILS(event.offer.id));
        break;
    }
  };

  return {
    state,
    onEvent,
  };
}
