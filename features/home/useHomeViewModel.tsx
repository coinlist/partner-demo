"use client";

import { ROUTES } from "@/lib/routes";
import { useRouter } from "next/navigation";

export type HomeUiState = {};

export type HomeUiEvent = {
  type: "ON_SETTINGS_CLICK";
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
    }
  };

  return {
    state,
    onEvent,
  };
}
