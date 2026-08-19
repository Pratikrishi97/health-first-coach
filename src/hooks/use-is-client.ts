"use client";

import { useSyncExternalStore } from "react";

// Returns false during SSR and the first client render, then true.
// Used to avoid hydration mismatches for client-only UI (e.g. theme).
const emptySubscribe = () => () => {};

export function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}
