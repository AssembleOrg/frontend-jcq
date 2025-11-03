import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { MantineAppProvider } from "@/src/presentation/providers/mantine-provider";
import { ColorSchemeScript } from "@mantine/core";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "JCQ Andamios - Sistema de Gestión",
  description: "Sistema de gestión de proyectos de construcción",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <ColorSchemeScript defaultColorScheme="dark" />
      </head>
      <body
        className={`${montserrat.variable} antialiased`}
        suppressHydrationWarning
      >
        <MantineAppProvider>{children}</MantineAppProvider>
      </body>
    </html>
  );
}
