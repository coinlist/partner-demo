"use client";

import { useCoinList } from "@coinlist-co/react";
import { useState } from "react";

export type SettingsUiState = {
  logoutLoading: boolean;
  logoutError: string | null;
};

export type SettingsUiEvent = {
  type: "ON_LOGOUT";
};

export function useSettingsViewModel(): {
  state: SettingsUiState;
  onEvent: (event: SettingsUiEvent) => void;
} {
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const { coinlist } = useCoinList();

  const uiState: SettingsUiState = {
    logoutLoading,
    logoutError,
  };
  const onEvent = async (event: SettingsUiEvent) => {
    switch (event.type) {
      case "ON_LOGOUT":
        await onLogout();
        break;
    }
  };
  const onLogout = async () => {
    setLogoutLoading(true);
    setLogoutError(null);
    try {
      const res = await fetch("/api/coinlist/oauth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("logout failed");
      coinlist.logout();
    } catch {
      setLogoutError("Could not sign out. Try again.");
    } finally {
      setLogoutLoading(false);
    }
  };

  return {
    state: uiState,
    onEvent,
  };
}
