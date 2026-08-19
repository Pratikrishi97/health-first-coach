"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// Wraps the app with next-themes. The full light + dark design
// tokens already live in globals.css (:root and .dark) — this
// simply toggles the `class` on <html> and persists the choice.
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
