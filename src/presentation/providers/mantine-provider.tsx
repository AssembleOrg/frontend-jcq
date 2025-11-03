"use client";

import { MantineProvider, createTheme } from "@mantine/core";
import "@mantine/core/styles.css";

const theme = createTheme({
  primaryColor: "orange",
  colors: {
    orange: [
      "#fff5ed",
      "#ffe8d6",
      "#ffd0aa",
      "#ffb67a",
      "#ff9f4f",
      "#ff8c61",
      "#ff6b35", // Brand orange
      "#e55425",
      "#cc4820",
      "#b33d1c",
    ],
  },
  fontFamily: "var(--font-montserrat), system-ui, -apple-system, sans-serif",
  headings: {
    fontFamily: "var(--font-montserrat), system-ui, -apple-system, sans-serif",
    fontWeight: "700", // Bold para títulos principales
    sizes: {
      h1: { fontWeight: "900" }, // Extra bold para H1
      h2: { fontWeight: "800" }, // Extra bold para H2
      h3: { fontWeight: "700" }, // Bold para H3
      h4: { fontWeight: "600" }, // Semi-bold para H4
      h5: { fontWeight: "600" }, // Semi-bold para H5
      h6: { fontWeight: "500" }, // Medium para H6
    },
  },
  defaultRadius: "md",
  fontSizes: {
    xs: "0.75rem",
    sm: "0.875rem",
    md: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
  },
  other: {
    fontWeights: {
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900,
    },
  },
});

export function MantineAppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MantineProvider
      theme={theme}
      defaultColorScheme="dark"
      forceColorScheme="dark"
    >
      {children}
    </MantineProvider>
  );
}
