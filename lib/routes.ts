import { OfferId } from "@coinlist-co/react";

export const ROUTES = {
  ROOT: "/",
  SETTINGS: "/settings",
  OFFER_DETAILS: (id: OfferId): string => `/offer/${id}`,
};
