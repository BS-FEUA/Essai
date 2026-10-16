import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "BS-Lokossa | FEUA — UNSTIM",
  description: "Bureau Sectoriel de Lokossa - Fédération des Étudiants de l’Université d’Abomey (UNSTIM)",
  keywords: ["FEUA", "BS-Lokossa", "syndicat", "étudiants", "Bénin", "Lokossa"],
  authors: [{ name: "FEUA BS-Lokossa" }],
  manifest: "/manifest.json",
  icons: {
    icon: "/feua-logo-transparent.png",
    apple: "/feua-logo-transparent.png",
  },
  openGraph: {
    title: "BS-Lokossa | FEUA — UNSTIM",
    description: "Bureau Sectoriel de Lokossa - Fédération des Étudiants de l’Université d’Abomey (UNSTIM)",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#1B7A3D" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="description" content="Bureau Sectoriel de Lokossa - Fédération des Étudiants de l’Université d’Abomey (UNSTIM) au Bénin" />
        <link rel="apple-touch-icon" href="/feua-logo-transparent.png" />
      </head>
      <body className="site-liquid-glass antialiased bg-background text-foreground min-h-screen overflow-x-hidden">
        <div
          aria-hidden="true"
          className="feua-watermark pointer-events-none fixed inset-0 z-[1]"
          style={{
            backgroundImage: "url('/feua-logo-transparent.png')",
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'min(72vw, 34rem)',
            mixBlendMode: 'multiply',
            opacity: 0.09,
          }}
        />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
